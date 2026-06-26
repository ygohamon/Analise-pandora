// Package crawlers encapsula a chamada ao pandora-crawlers.
//
// Os integrados de pessoa/empresa chamam este client apenas no fluxo
// funcao=crawlers. Falha ou timeout deve ser tratado pelo usecase como bypass.
package crawlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
)

// Client consulta o endpoint /crawl do servico pandora-crawlers.
type Client struct {
	baseURL string
	timeout time.Duration
}

// NewClient cria a integracao usada pelos usecases integrados.
func NewClient(baseURL string, timeout time.Duration) *Client {
	return &Client{baseURL: strings.TrimRight(strings.TrimSpace(baseURL), "/"), timeout: timeout}
}

// Search executa busca aberta e retorna linhas brutas normalizadas para a aba crawler.
func (c *Client) Search(ctx context.Context, query string) ([]map[string]any, error) {
	query = strings.TrimSpace(query)
	if c == nil || c.baseURL == "" || query == "" {
		return []map[string]any{}, nil
	}
	timeout := c.timeout
	if timeout <= 0 {
		timeout = 2 * time.Minute
	}
	reqCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	endpoint, err := url.Parse(c.baseURL + "/crawl")
	if err != nil {
		return nil, err
	}
	q := endpoint.Query()
	q.Set("spider", "all")
	q.Set("timeout", fmt.Sprintf("%d", timeout.Milliseconds()))
	q.Set("q", query)
	endpoint.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		sharedintegrations.LogExternalCall(ctx, "crawlers", http.MethodGet, 0, time.Since(start), "/crawl")
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "crawlers", http.MethodGet, res.StatusCode, time.Since(start), "/crawl")
	if res.StatusCode == http.StatusNotFound {
		return []map[string]any{}, nil
	}
	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("crawlers status %d", res.StatusCode)
	}
	var payload any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return normalize(payload), nil
}

func normalize(payload any) []map[string]any {
	rows := []map[string]any{}
	switch value := payload.(type) {
	case []any:
		for _, item := range value {
			if row, ok := item.(map[string]any); ok {
				rows = append(rows, normalizeRow(row))
			}
		}
	case map[string]any:
		if nested, ok := value["dados"].([]any); ok {
			for _, item := range nested {
				if row, ok := item.(map[string]any); ok {
					rows = append(rows, normalizeRow(row))
				}
			}
			return rows
		}
		rows = append(rows, normalizeRow(value))
	}
	return rows
}

func normalizeRow(row map[string]any) map[string]any {
	out := map[string]any{}
	for key, value := range row {
		out[key] = value
	}
	if _, ok := out["fonte"]; !ok {
		out["fonte"] = "CRAWLERS"
	}
	if _, ok := out["rank"]; !ok {
		out["rank"] = 0
	}
	if _, ok := out["tipo"]; !ok {
		out["tipo"] = "buscageral"
	}
	return out
}
