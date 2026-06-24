package credlink

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/modelconfig"
)

// Client encapsula chamadas HTTP ao Credlink.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client Credlink a partir do model configurado.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// Completo consulta o endpoint completo do Credlink por CPF/CNPJ.
func (c Client) Completo(ctx context.Context, cpf string) (map[string]any, error) {
	baseURL := modelVar(c.model.Vars, "COMPLETO")
	if baseURL == "" {
		return nil, nil
	}
	values := url.Values{}
	values.Set("usuario", modelVar(c.model.Vars, "usuario"))
	values.Set("senha", modelVar(c.model.Vars, "senha"))
	values.Set("sigla", modelVar(c.model.Vars, "sigla"))
	values.Set("cpfcnpj", cpf)
	values.Set("nome", "NOME")
	values.Set("telefone", "TELEFONE")
	endpoint := baseURL
	if strings.Contains(endpoint, "?") {
		endpoint += "&" + values.Encode()
	} else {
		endpoint += "?" + values.Encode()
	}
	start := time.Now()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	slog.InfoContext(ctx, "external api call", append(sharedintegrations.LogAttrs(ctx, "credlink"), "method", http.MethodGet, "status", res.StatusCode, "duration_ms", time.Since(start).Milliseconds())...)
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("credlink status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func modelVar(vars map[string]any, key string) string {
	return strings.TrimSpace(fmt.Sprint(vars[key]))
}
