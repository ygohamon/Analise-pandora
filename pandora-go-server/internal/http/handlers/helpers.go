package handlers

import (
	"net/http"
	"os"
	"strconv"
	"strings"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/middleware"
	"pandora-go-server/internal/types"
)

func currentUserID(r *http.Request) (int64, error) {
	id := auth.UserIDFromClaims(middleware.ClaimsFromContext(r.Context()))
	if id == "" {
		return 0, types.ErrTokenInvalid
	}
	parsed, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return 0, types.ErrTokenInvalid.WithCause(err)
	}
	return parsed, nil
}

func pathInt64(r *http.Request, name string) (int64, error) {
	return parseID(r.PathValue(name))
}

func parseID(value string) (int64, error) {
	value = strings.Trim(value, "/")
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id <= 0 {
		return 0, types.ErrInvalidParam
	}
	return id, nil
}

func optionalQueryInt(r *http.Request, name string) (*int, error) {
	value := strings.TrimSpace(r.URL.Query().Get(name))
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return nil, types.ErrInvalidParam.WithCause(err)
	}
	return &parsed, nil
}

func envBool(key string, fallback bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return fallback
	}
	return value == "true" || value == "1" || value == "yes" || value == "sim"
}

func envInt(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			return trimmed
		}
	}
	return ""
}

func dbEngineName(driver string) string {
	switch strings.ToLower(strings.TrimSpace(driver)) {
	case "sqlserver":
		return "mssql"
	case "":
		return os.Getenv("BD_ENGINE")
	default:
		return driver
	}
}

func emailRecipients(items []map[string]any) []string {
	out := []string{}
	for _, item := range items {
		for _, key := range []string{"email", "to"} {
			if value, ok := item[key].(string); ok {
				value = strings.TrimSpace(value)
				if strings.Contains(value, "@") {
					out = append(out, value)
				}
			}
		}
	}
	return out
}

func hasBroadcastRecipient(items []map[string]any) bool {
	for _, item := range items {
		if value, ok := item["email"].(string); ok && strings.EqualFold(strings.TrimSpace(value), "broadcast") {
			return true
		}
	}
	return false
}

func uniqueStrings(values []string) []string {
	seen := map[string]struct{}{}
	out := []string{}
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		key := strings.ToLower(trimmed)
		if trimmed == "" {
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, trimmed)
	}
	return out
}

func buildMailMessage(from string, to []string, subject string, html string) string {
	return strings.Join([]string{
		"From: " + from,
		"To: " + strings.Join(to, ", "),
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=\"UTF-8\"",
		"",
		html,
	}, "\r\n")
}

func clientIP(r *http.Request) string {
	if value := r.Header.Get("X-Real-IP"); value != "" {
		return value
	}
	if value := r.Header.Get("X-Forwarded-For"); value != "" {
		return strings.TrimSpace(strings.Split(value, ",")[0])
	}
	return r.RemoteAddr
}
