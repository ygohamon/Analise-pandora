package cortex

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/modelconfig"
)

var session = struct {
	sync.Mutex
	token     string
	createdAt time.Time
}{}

// Client encapsula login/cache e chamadas HTTP ao Cortex.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client Cortex a partir do model configurado.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// Get chama um endpoint Cortex autenticado e retorna o JSON bruto.
func (c Client) Get(ctx context.Context, endpoint, cpfUsuario string) (any, error) {
	token, err := c.token(ctx)
	if err != nil {
		return nil, err
	}
	reqCtx, cancel := context.WithTimeout(ctx, timeout(c.model, 20*time.Second))
	defer cancel()
	start := time.Now()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)
	if cpfUsuario != "" {
		req.Header.Set("usuario", cpfUsuario)
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	slog.InfoContext(ctx, "external api call", append(sharedintegrations.LogAttrs(ctx, "cortex"), "method", http.MethodGet, "status", res.StatusCode, "duration_ms", time.Since(start).Milliseconds(), "path", safePath(endpoint))...)
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("cortex status %d", res.StatusCode)
	}
	var payload any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func (c Client) token(ctx context.Context) (string, error) {
	session.Lock()
	defer session.Unlock()
	if session.token != "" && time.Since(session.createdAt) < 8*time.Minute {
		return session.token, nil
	}
	basePessoas := strings.TrimRight(modelVar(c.model.Vars, "CORTEX_URL_PESSOAS"), "/")
	if basePessoas == "" {
		return "", fmt.Errorf("cortex url pessoas not configured")
	}
	reqCtx, cancel := context.WithTimeout(ctx, timeout(c.model, 20*time.Second))
	defer cancel()
	body := strings.NewReader(fmt.Sprintf(`{"email":%q,"senha":%q}`, modelVar(c.model.Vars, "CORTEX_LOGIN"), modelVar(c.model.Vars, "CORTEX_SENHA")))
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, basePessoas+"/login", body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("cortex login status %d", res.StatusCode)
	}
	token := strings.TrimSpace(res.Header.Get("token"))
	if token == "" {
		token = strings.TrimSpace(res.Header.Get("Authorization"))
	}
	if token == "" {
		return "", fmt.Errorf("cortex login did not return token header")
	}
	session.token = token
	session.createdAt = time.Now()
	slog.InfoContext(ctx, "external api login ok", sharedintegrations.LogAttrs(ctx, "cortex")...)
	return token, nil
}

func timeout(model modelconfig.Model, fallback time.Duration) time.Duration {
	text := strings.TrimSpace(fmt.Sprint(firstValue(model.Vars, "TIMEOUT", "CORTEX_TIMEOUT")))
	if text == "" {
		return fallback
	}
	if parsed, err := time.ParseDuration(text); err == nil {
		return parsed
	}
	var seconds int
	if _, err := fmt.Sscanf(text, "%d", &seconds); err == nil && seconds > 0 {
		if seconds > 1000 {
			return time.Duration(seconds) * time.Millisecond
		}
		return time.Duration(seconds) * time.Second
	}
	return fallback
}

func firstValue(row map[string]any, keys ...string) any {
	for _, key := range keys {
		if value, ok := row[key]; ok {
			return value
		}
	}
	return nil
}

func modelVar(vars map[string]any, key string) string {
	return strings.TrimSpace(fmt.Sprint(vars[key]))
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
