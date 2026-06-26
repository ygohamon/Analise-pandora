package oauthjson

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

// Session guarda token OAuth client_credentials para APIs externas JSON.
type Session struct {
	sync.Mutex
	token     string
	expiresAt time.Time
}

// Token retorna um bearer token valido, renovando quando necessario.
func (s *Session) Token(ctx context.Context, model modelconfig.Model, includeScope bool) (string, error) {
	s.Lock()
	defer s.Unlock()
	if s.token != "" && time.Now().Before(s.expiresAt.Add(-1*time.Minute)) {
		return s.token, nil
	}
	tokenURL := modelVar(model.Vars, "TOKEN_URL")
	if tokenURL == "" {
		return "", fmt.Errorf("token url not configured")
	}
	form := url.Values{}
	form.Set("grant_type", "client_credentials")
	form.Set("client_id", modelVar(model.Vars, "CLIENT_ID"))
	form.Set("client_secret", modelVar(model.Vars, "CLIENT_SECRET"))
	if includeScope {
		if scope := modelVar(model.Vars, "SCOPE"); scope != "" {
			form.Set("scope", scope)
		}
	}
	reqCtx, cancel := context.WithTimeout(ctx, Timeout(model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, tokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalLogin(ctx, SourceSigla(model, "oauth"), res.StatusCode, time.Since(start))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("oauth status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return "", err
	}
	accessToken := cleanText(payload["access_token"])
	if accessToken == "" {
		return "", fmt.Errorf("oauth token not returned")
	}
	expiresIn := 3600
	if raw := cleanText(payload["expires_in"]); raw != "" {
		var parsed int
		if _, err := fmt.Sscanf(raw, "%d", &parsed); err == nil && parsed > 0 {
			expiresIn = parsed
		}
	}
	s.token = "Bearer " + accessToken
	s.expiresAt = time.Now().Add(time.Duration(expiresIn) * time.Second)
	return s.token, nil
}

// GetJSON executa GET autenticado e decodifica um objeto JSON.
func GetJSON(ctx context.Context, model modelconfig.Model, apiName, endpoint, bearerToken string, headers map[string]string) (map[string]any, error) {
	reqCtx, cancel := context.WithTimeout(ctx, Timeout(model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	if bearerToken != "" {
		req.Header.Set("Authorization", bearerToken)
	}
	req.Header.Set("Accept", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, apiName, http.MethodGet, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("%s status %d", apiName, res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

// PostJSON executa POST autenticado com corpo JSON e decodifica um objeto JSON.
func PostJSON(ctx context.Context, model modelconfig.Model, apiName, endpoint, bearerToken string, headers map[string]string, body any) (map[string]any, error) {
	rawBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	reqCtx, cancel := context.WithTimeout(ctx, Timeout(model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewReader(rawBody))
	if err != nil {
		return nil, err
	}
	if bearerToken != "" {
		req.Header.Set("Authorization", bearerToken)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, apiName, http.MethodPost, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("%s status %d", apiName, res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

// Timeout interpreta TIMEOUT/CORTEX_TIMEOUT no formato usado pelos model configs.
func Timeout(model modelconfig.Model, fallback time.Duration) time.Duration {
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

// SourceSigla retorna a sigla configurada, com fallback seguro.
func SourceSigla(model modelconfig.Model, fallback string) string {
	if sigla := strings.TrimSpace(model.Sigla); sigla != "" {
		return sigla
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

func cleanText(value any) string {
	text := strings.TrimSpace(fmt.Sprint(value))
	switch strings.ToLower(text) {
	case "", "<nil>", "null", "undefined":
		return ""
	default:
		return text
	}
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
