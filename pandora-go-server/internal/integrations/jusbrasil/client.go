package jusbrasil

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/modelconfig"
)

// Client encapsula as consultas JSON da API Jusbrasil.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client chamado por repositories judiciais externos.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// Lawsuits pagina processos e retorna o payload agregado da API.
func (c Client) Lawsuits(ctx context.Context, path string, document string) (map[string]any, error) {
	aggregated := map[string]any{"processos": []any{}}
	cursor := ""
	seen := map[string]struct{}{}
	for attempts := 0; attempts < 20; attempts++ {
		payload, err := c.post(ctx, path, map[string]any{
			"documentNumber": document,
			"pagination": map[string]any{
				"cursor": cursor,
				"size":   c.pageSize(),
			},
		})
		if err != nil || payload == nil {
			return aggregated, err
		}
		if value := payload["nome"]; value != nil {
			aggregated["nome"] = value
		}
		if value := payload["identificacao"]; value != nil {
			aggregated["identificacao"] = value
		}
		current := mappers.ArrayOfMaps(payload["processos"])
		all := mappers.ArrayOfMaps(aggregated["processos"])
		all = append(all, current...)
		aggregated["processos"] = mapsToAny(all)
		pagination := mappers.AsMap(payload["pagination"])
		next := strings.TrimSpace(fmt.Sprint(pagination["endCursor"]))
		if pagination["hasNextPage"] != true || next == "" {
			break
		}
		if _, ok := seen[next]; ok {
			break
		}
		seen[next] = struct{}{}
		cursor = next
	}
	return aggregated, nil
}

// Simple chama endpoints sem paginacao como MP, BNMP e empregador irregular.
func (c Client) Simple(ctx context.Context, path string, document string) (map[string]any, error) {
	return c.post(ctx, path, map[string]any{"documentNumber": document})
}

// BNMPMandados chama o endpoint legado do Jusbrasil usado pelo Node para a aba mandado.
func (c Client) BNMPMandados(ctx context.Context, documentType string, document string) ([]map[string]any, error) {
	baseURL := strings.TrimRight(modelVarAny(c.model.Vars, "", "JUSBRASIL_URL"), "/")
	apiKey := modelVarAny(c.model.Vars, "", "JUSBRASIL_API_KEY")
	if baseURL == "" || apiKey == "" {
		return nil, nil
	}
	payload, err := c.postTo(ctx, baseURL+"/bnmp", apiKey, map[string]any{
		"document": map[string]any{
			"type":  documentType,
			"value": document,
		},
		"pagination": map[string]any{
			"page":    1,
			"perPage": 100,
		},
	})
	if err != nil || payload == nil {
		return nil, err
	}
	return mappers.ArrayOfMaps(payload["data"]), nil
}

func (c Client) post(ctx context.Context, path string, body map[string]any) (map[string]any, error) {
	baseURL := strings.TrimRight(modelVarAny(c.model.Vars, "https://api.jusbrasil.com.br", "JUSBRASIL_API_URL", "JUSBRASIL_URL"), "/")
	apiKey := modelVarAny(c.model.Vars, "", "JUSBRASIL_APIKEY", "JUSBRASIL_API_KEY")
	if baseURL == "" || apiKey == "" {
		return nil, nil
	}
	return c.postTo(ctx, baseURL+"/"+strings.TrimLeft(path, "/"), apiKey, body)
}

func (c Client) postTo(ctx context.Context, endpoint string, apiKey string, body map[string]any) (map[string]any, error) {
	raw, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(raw))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "jusbrasil", http.MethodPost, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("jusbrasil status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func (c Client) pageSize() int {
	value := modelVar(c.model.Vars, "JUSBRASIL_API_PAGE_SIZE", "100")
	var size int
	if _, err := fmt.Sscanf(value, "%d", &size); err != nil || size <= 0 {
		return 100
	}
	return size
}

func modelVar(vars map[string]any, key string, fallback string) string {
	if vars == nil {
		return fallback
	}
	text := strings.TrimSpace(fmt.Sprint(vars[key]))
	if text == "" || text == "<nil>" {
		return fallback
	}
	return text
}

func modelVarAny(vars map[string]any, fallback string, keys ...string) string {
	for _, key := range keys {
		if value := modelVar(vars, key, ""); value != "" {
			return value
		}
	}
	return fallback
}

func mapsToAny(rows []map[string]any) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
