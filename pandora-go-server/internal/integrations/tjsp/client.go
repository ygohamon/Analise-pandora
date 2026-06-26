// Package tjsp encapsula chamadas CAEX/TJSP usadas por repositories de processo.
package tjsp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/modelconfig"
)

// Client autentica no CAEX e consulta processos por CPF/CNPJ.
type Client struct {
	model modelconfig.Model
	mu    sync.Mutex
	token string
}

// NewClient cria o client chamado por repositories externos de processo.
func NewClient(model modelconfig.Model) *Client {
	return &Client{model: model}
}

// Processos consulta /processo/{tipo}/{documento} e retorna documentos brutos.
func (c *Client) Processos(ctx context.Context, tipo, documento string) ([]map[string]any, error) {
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "CAEX_URL"), "/")
	if baseURL == "" || !c.model.Ativado {
		return nil, nil
	}
	token, err := c.authToken(ctx)
	if err != nil || token == "" {
		return nil, err
	}
	endpoint := baseURL + "/processo/" + strings.Trim(tipo, "/") + "/" + url.PathEscape(documento)
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", token)
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "tjsp.caex", http.MethodGet, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("tjsp caex status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return mappers.ArrayOfMaps(payload["documento"]), nil
}

func (c *Client) authToken(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.token != "" {
		return c.token, nil
	}
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "CAEX_URL"), "/")
	username := modelVar(c.model.Vars, "CAEX_LOGIN")
	password := modelVar(c.model.Vars, "CAEX_SENHA")
	if baseURL == "" || username == "" || password == "" {
		return "", nil
	}
	raw, err := json.Marshal(map[string]string{"username": username, "password": password})
	if err != nil {
		return "", err
	}
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	endpoint := baseURL + "/auth/login"
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(raw))
	if err != nil {
		return "", err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalLogin(ctx, "tjsp.caex", res.StatusCode, time.Since(start))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("tjsp caex login status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return "", err
	}
	c.token = strings.TrimSpace(fmt.Sprint(payload["token"]))
	return c.token, nil
}

func modelVar(vars map[string]any, key string) string {
	if vars == nil {
		return ""
	}
	text := strings.TrimSpace(fmt.Sprint(vars[key]))
	if text == "<nil>" {
		return ""
	}
	return text
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
