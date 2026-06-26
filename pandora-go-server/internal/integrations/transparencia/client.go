package transparencia

import (
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

// Client encapsula chamadas JSON ao Portal da Transparencia.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client usado por repositories externos especificos.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// GetArray consulta um endpoint e retorna a lista bruta em mapas.
// Chamado por repositories de processo/empresa para montar abas do integrado.
func (c Client) GetArray(ctx context.Context, path string, query map[string]string) ([]map[string]any, error) {
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "PORTAL_TRANSPARENCIA_URL_API"), "/")
	apiKey := strings.TrimSpace(modelVar(c.model.Vars, "TRANSPARENCIA_CHAVE_API"))
	if baseURL == "" || apiKey == "" {
		return nil, nil
	}
	values := url.Values{}
	for key, value := range query {
		values.Set(key, value)
	}
	endpoint := baseURL + "/" + strings.TrimLeft(path, "/")
	if encoded := values.Encode(); encoded != "" {
		endpoint += "?" + encoded
	}
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("chave-api-dados", apiKey)
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "transparencia", http.MethodGet, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("transparencia status %d", res.StatusCode)
	}
	var payload any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return normalizeRows(payload), nil
}

func modelVar(vars map[string]any, key string) string {
	if vars == nil {
		return ""
	}
	return strings.TrimSpace(fmt.Sprint(vars[key]))
}

func normalizeRows(payload any) []map[string]any {
	if rows := mappers.ArrayOfMaps(payload); len(rows) > 0 {
		return rows
	}
	mapped := mappers.AsMap(payload)
	if rows := mappers.ArrayOfMaps(mapped["dados"]); len(rows) > 0 {
		return rows
	}
	return mappers.ArrayOfMaps(mapped["content"])
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
