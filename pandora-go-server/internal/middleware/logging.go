package middleware

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"
)

func Logger(logger *slog.Logger, env string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)
			duration := time.Since(start)
			requestID := RequestIDFromContext(r.Context())
			errorCode := rec.Header().Get("X-Pandora-Error-Code")
			errorKind := rec.Header().Get("X-Pandora-Error-Kind")
			errorMessage := rec.Header().Get("X-Pandora-Error-Message")
			if errorMessage == "" && rec.status >= 400 {
				errorMessage = responseMessage(rec.body.Bytes())
			}
			if !strings.EqualFold(env, "production") {
				printPrettyHTTPLog(requestID, r, rec.status, duration, errorCode, errorKind, errorMessage, rec.Header().Get("X-Cache"))
				return
			}
			attrs := []any{
				"request_id", requestID,
				"method", r.Method,
				"path", r.URL.Path,
				"query", r.URL.RawQuery,
				"status", rec.status,
				"status_class", statusClass(rec.status),
				"error_code", errorCode,
				"error_kind", errorKind,
				"error_message", errorMessage,
				"audit_severity", rec.Header().Get("X-Pandora-Audit-Severity"),
				"duration_ms", duration.Milliseconds(),
				"origin_ip", clientIP(r),
				"user_agent", r.UserAgent(),
				"cache", rec.Header().Get("X-Cache"),
			}
			if rec.status >= 500 {
				logger.Error("http_request", attrs...)
			} else if rec.status >= 400 {
				logger.Warn("http_request", attrs...)
			} else {
				logger.Info("http_request", attrs...)
			}
		})
	}
}

func printPrettyHTTPLog(requestID string, r *http.Request, status int, duration time.Duration, errorCode, errorKind, errorMessage, cacheStatus string) {
	statusText := fmt.Sprintf("[ %s ] %d", statusIcon(status), status)
	path := r.URL.Path
	if r.URL.RawQuery != "" {
		path += "?" + r.URL.RawQuery
	}
	cacheText := ""
	if cacheStatus != "" {
		cacheText = " cache=" + cacheStatus
	}
	fmt.Fprintf(os.Stdout, "%s %s %-6s %s %s %s%s\n",
		time.Now().Format("15:04:05.000"),
		statusColor(status, statusText),
		r.Method,
		path,
		muted(fmt.Sprintf("%dms", duration.Milliseconds())),
		muted("req="+shortID(requestID)),
		cacheText,
	)
	if status >= 400 || errorCode != "" || errorMessage != "" {
		detail := strings.TrimSpace(errorMessage)
		if detail == "" {
			detail = "sem mensagem de erro no corpo da resposta"
		}
		fmt.Fprintf(os.Stdout, "  %s %s %s\n",
			statusColor(status, "erro"),
			muted(firstNonEmpty(errorCode, "HTTP_ERROR")),
			detail,
		)
		if errorKind != "" {
			fmt.Fprintf(os.Stdout, "  %s %s\n", muted("tipo"), errorKind)
		}
	}
}

func responseMessage(body []byte) string {
	if len(body) == 0 {
		return ""
	}
	var payload struct {
		Msg    string `json:"msg"`
		Status string `json:"status"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		text := strings.TrimSpace(string(body))
		if len(text) > 240 {
			return text[:240] + "..."
		}
		return text
	}
	if payload.Msg != "" {
		return payload.Msg
	}
	return payload.Status
}

func statusClass(status int) string {
	switch {
	case status >= 500:
		return "5xx"
	case status >= 400:
		return "4xx"
	case status >= 300:
		return "3xx"
	case status >= 200:
		return "2xx"
	default:
		return "1xx"
	}
}

func statusIcon(status int) string {
	switch {
	case status >= 500:
		return "ERR "
	case status >= 400:
		return "BAD "
	case status >= 300:
		return "RED "
	case status >= 200:
		return "OK "
	default:
		return "INFO"
	}
}

func statusColor(status int, text string) string {
	switch {
	case status >= 500:
		return "\033[31m" + text + "\033[0m"
	case status >= 400:
		return "\033[33m" + text + "\033[0m"
	case status >= 300:
		return "\033[36m" + text + "\033[0m"
	default:
		return "\033[32m" + text + "\033[0m"
	}
}

func muted(text string) string {
	return "\033[90m" + text + "\033[0m"
}

func shortID(value string) string {
	if len(value) <= 8 {
		return value
	}
	return value[:8]
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
