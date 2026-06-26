// Package gpu encapsula chamadas HTTP ao WEBSERVICE_GPU.
//
// Repositories de pesquisa chamam este client para consultar advogado/preso sem
// conhecer login, token, timeout ou endpoints da API externa.
package gpu

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
	"pandora-go-server/internal/modelconfig"
)

// Client guarda configuracao e token do WEBSERVICE_GPU.
type Client struct {
	model modelconfig.Model
	mu    sync.Mutex
	token string
}

// NewClient cria o client usado por repositories de pesquisa/gpu.
func NewClient(model modelconfig.Model) *Client {
	return &Client{model: model}
}

// Post envia um JSON autenticado e retorna o objeto bruto da GPU.
func (c *Client) Post(ctx context.Context, path string, body any) (map[string]any, error) {
	if !c.model.Ativado {
		return nil, nil
	}
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "GPU_URL"), "/")
	if baseURL == "" {
		baseURL = strings.TrimRight(modelVar(c.model.Vars, "GPU_BASE_URL"), "/")
	}
	if baseURL == "" {
		return nil, nil
	}
	token, err := c.authToken(ctx)
	if err != nil || token == "" {
		return nil, err
	}
	endpoint := baseURL + "/" + strings.TrimLeft(path, "/")
	return postJSON(ctx, c.model, endpoint, token, body)
}

func (c *Client) authToken(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.token != "" {
		return c.token, nil
	}
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "GPU_URL"), "/")
	if baseURL == "" {
		baseURL = strings.TrimRight(modelVar(c.model.Vars, "GPU_BASE_URL"), "/")
	}
	email := firstModelVar(c.model.Vars, "GPU_LOGIN_EMAIL", "GPU_EMAIL")
	password := firstModelVar(c.model.Vars, "GPU_LOGIN_PASSWORD", "GPU_PASSWORD")
	if baseURL == "" || email == "" || password == "" {
		return "", nil
	}
	endpoint := baseURL + "/api/auth/login"
	raw, err := json.Marshal(map[string]string{"email": email, "password": password})
	if err != nil {
		return "", err
	}
	reqCtx, cancel := context.WithTimeout(ctx, gpuTimeout(c.model, 2*time.Minute))
	defer cancel()
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
	sharedintegrations.LogExternalLogin(ctx, "gpu", res.StatusCode, time.Since(start))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("gpu login status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return "", err
	}
	token := firstPayloadText(payload, "access_token", "admin_token", "token")
	if token == "" {
		return "", fmt.Errorf("gpu token not returned")
	}
	if !strings.HasPrefix(strings.ToLower(token), "bearer ") {
		token = "Bearer " + token
	}
	c.token = token
	return c.token, nil
}

func postJSON(ctx context.Context, model modelconfig.Model, endpoint string, token string, body any) (map[string]any, error) {
	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	reqCtx, cancel := context.WithTimeout(ctx, gpuTimeout(model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", token)
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "gpu", http.MethodPost, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("gpu status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func gpuTimeout(model modelconfig.Model, fallback time.Duration) time.Duration {
	text := firstModelVar(model.Vars, "GPU_TIMEOUT", "TIMEOUT", "CORTEX_TIMEOUT")
	if text == "" {
		return fallback
	}
	if parsed, err := time.ParseDuration(text); err == nil {
		return parsed
	}
	var amount int
	if _, err := fmt.Sscanf(text, "%d", &amount); err == nil && amount > 0 {
		if amount > 1000 {
			return time.Duration(amount) * time.Millisecond
		}
		return time.Duration(amount) * time.Second
	}
	return fallback
}

func firstModelVar(vars map[string]any, keys ...string) string {
	for _, key := range keys {
		if text := modelVar(vars, key); text != "" {
			return text
		}
	}
	return ""
}

func firstPayloadText(payload map[string]any, keys ...string) string {
	for _, key := range keys {
		text := strings.TrimSpace(fmt.Sprint(payload[key]))
		if text != "" && text != "<nil>" {
			return text
		}
	}
	return ""
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
