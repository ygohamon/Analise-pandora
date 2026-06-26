package integrations

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"pandora-go-server/internal/middleware"
)

var dependencyStatus sync.Map

// LogAttrs devolve campos comuns para logs tecnicos de APIs externas.
// Chamado pelos clients HTTP/SOAP para correlacionar fonte externa e request HTTP.
func LogAttrs(ctx context.Context, apiName string) []any {
	return []any{
		"request_id", middleware.RequestIDFromContext(ctx),
		"api", apiName,
	}
}

// LogExternalCall registra chamadas de API externa sem poluir o INFO.
// Chamado pelos clients de integrations; sucesso fica em DEBUG e falha fica em WARN.
func LogExternalCall(ctx context.Context, apiName, method string, status int, duration time.Duration, path string, attrs ...any) {
	args := append(LogAttrs(ctx, apiName),
		"method", method,
		"status", status,
		"duration_ms", duration.Milliseconds(),
	)
	if path != "" {
		args = append(args, "path", path)
	}
	args = append(args, attrs...)
	if status >= http.StatusOK && status < http.StatusBadRequest {
		slog.DebugContext(ctx, "api externa ok", args...)
		return
	}
	if os.Getenv("SERVER_ENV") != "production" {
		printExternalWarn(apiName, method, status, path, duration)
		return
	}
	slog.WarnContext(ctx, "api externa falhou", args...)
}

// LogExternalLogin registra login/token de API externa apenas quando o status muda.
// Isso mostra se a API autenticou sem repetir a mesma linha em toda requisicao.
func LogExternalLogin(ctx context.Context, apiName string, status int, duration time.Duration, attrs ...any) {
	state := statusLabel(status)
	level := slog.LevelInfo
	if status < http.StatusOK || status >= http.StatusBadRequest {
		level = slog.LevelWarn
	}
	if !statusChanged("api.login."+apiName, fmt.Sprintf("%d:%s", status, state)) {
		return
	}
	if os.Getenv("SERVER_ENV") != "production" {
		printAPIStatus(apiName, status, state, duration, "")
		return
	}
	args := append(LogAttrs(ctx, apiName),
		"status", status,
		"duration_ms", duration.Milliseconds(),
		"state", state,
	)
	args = append(args, attrs...)
	slog.Log(ctx, level, "login de api externa", args...)
}

// LogDependencyStatus registra dependencias somente na inicializacao ou quando mudam.
func LogDependencyStatus(ctx context.Context, component, name, state string, attrs ...any) {
	if !statusChanged(component+"."+name, state) {
		return
	}
	if os.Getenv("SERVER_ENV") != "production" {
		printDependencyStatus(component, name, state, attrs...)
		return
	}
	args := []any{"component", component, "name", name, "state", state}
	args = append(args, attrs...)
	if state == "ok" || state == "configured" {
		slog.InfoContext(ctx, "status de dependencia", args...)
		return
	}
	slog.WarnContext(ctx, "status de dependencia", args...)
}

func statusChanged(key, state string) bool {
	if previous, ok := dependencyStatus.Load(key); ok && previous == state {
		return false
	}
	dependencyStatus.Store(key, state)
	return true
}

func printDependencyStatus(component, name, state string, attrs ...any) {
	if component == "api" {
		status := dependencyHTTPStatus(state)
		printAPIStatus(name, status, statusLabel(status), 0, "")
		return
	}
	label := "[ DEP ]"
	displayName := name
	status := dependencyHTTPStatus(state)
	if component == "database" {
		label = "[ DB ]"
		displayName = strings.ToUpper(name)
	}
	detail := ""
	if component == "database" {
		if err := attrValue(attrs, "error"); err != "" {
			detail = " error=" + err
		}
	}
	fmt.Fprintf(os.Stdout, "%s %s  %-24s  [%s]%s\n",
		time.Now().Format("15:04:05.000"),
		green(label),
		displayName,
		colorStatus(status, statusLabel(status)),
		detail,
	)
}

func attrValue(attrs []any, key string) string {
	for i := 0; i+1 < len(attrs); i += 2 {
		if fmt.Sprint(attrs[i]) == key {
			return fmt.Sprint(attrs[i+1])
		}
	}
	return ""
}

func printAPIStatus(apiName string, status int, label string, duration time.Duration, detail string) {
	durationText := ""
	if duration > 0 {
		durationText = fmt.Sprintf(" %dms", duration.Milliseconds())
	}
	if detail != "" {
		durationText += " " + detail
	}
	fmt.Fprintf(os.Stdout, "%s %s  %-24s  [%s]%s\n",
		time.Now().Format("15:04:05.000"),
		green("[ API ]"),
		friendlyAPIName(apiName),
		colorStatus(status, label),
		durationText,
	)
}

func printExternalWarn(apiName, method string, status int, path string, duration time.Duration) {
	fmt.Fprintf(os.Stdout, "%s %s API EXTERNA FALHOU [%s] %s [%s] PATH=%s DURATION=%dMS\n",
		time.Now().Format("15:04:05.000"),
		orange("[ WARN ]"),
		friendlyAPIName(apiName),
		strings.ToUpper(method),
		colorStatus(status, statusLabel(status)),
		path,
		duration.Milliseconds(),
	)
}

func dependencyHTTPStatus(state string) int {
	switch strings.ToLower(strings.TrimSpace(state)) {
	case "ok", "configured":
		return http.StatusOK
	case "timeout":
		return http.StatusGatewayTimeout
	case "unauthorized":
		return http.StatusUnauthorized
	case "forbidden":
		return http.StatusForbidden
	case "unavailable", "not_configured":
		return http.StatusServiceUnavailable
	case "bad_gateway":
		return http.StatusBadGateway
	default:
		return 0
	}
}

func statusLabel(status int) string {
	switch status {
	case http.StatusBadRequest:
		return "BAD_REQUEST"
	case http.StatusUnauthorized:
		return "UNAUTHORIZED"
	case http.StatusForbidden:
		return "FORBIDDEN"
	case http.StatusNotFound:
		return "NOT_FOUND"
	case http.StatusMethodNotAllowed:
		return "METHOD_NOT_ALLOWED"
	case http.StatusConflict:
		return "CONFLICT"
	case http.StatusTooManyRequests:
		return "TOO_MANY_REQUESTS"
	case http.StatusRequestTimeout, http.StatusGatewayTimeout:
		return "TIMEOUT"
	case http.StatusInternalServerError:
		return "INTERNAL_SERVER_ERROR"
	case http.StatusBadGateway:
		return "BAD GATEWAY"
	case http.StatusServiceUnavailable:
		return "UNAVAILABLE"
	case 0:
		return "DISCONNECTED"
	default:
		if status >= http.StatusOK && status < http.StatusBadRequest {
			return "CONNECTED"
		}
		if status >= http.StatusInternalServerError {
			return "UNAVAILABLE"
		}
		return "HTTP_ERROR"
	}
}

func colorStatus(status int, label string) string {
	code := fmt.Sprintf("%03d", status)
	text := code + ": " + label
	color := "\033[31m"
	if status >= http.StatusOK && status < http.StatusBadRequest {
		color = "\033[32m"
	} else if label == "TIMEOUT" {
		color = "\033[33m"
	}
	return color + text + "\033[0m"
}

func green(text string) string {
	return "\033[32m" + text + "\033[0m"
}

func orange(text string) string {
	return "\033[38;5;208m" + text + "\033[0m"
}

func friendlyAPIName(name string) string {
	upper := strings.ToUpper(name)
	switch {
	case strings.Contains(upper, "GPU"):
		return "GPU"
	case strings.Contains(upper, "CREDLINK"):
		return "CREDLINK"
	case strings.Contains(upper, "CORTEX"):
		return "CORTEX"
	case strings.Contains(upper, "JUSBRASIL"):
		return "JUSBRASIL"
	case strings.Contains(upper, "SEEU"):
		return "SEEU"
	case strings.Contains(upper, "SISMP"):
		return "SISMP"
	case strings.Contains(upper, "RECEITA"):
		return "RECEITA_FEDERAL"
	case strings.Contains(upper, "TJSP"):
		return "TJSP"
	case strings.Contains(upper, "TRANSPARENCIA"):
		return "TRANSPARENCIA"
	case strings.Contains(upper, "CRAWLER"):
		return "CRAWLERS"
	case strings.Contains(upper, "BCCCS"), strings.Contains(upper, "PIX"):
		return "PIX/BCCCS"
	case strings.Contains(upper, "TCU"):
		return "TCU"
	case strings.Contains(upper, "INFOSEG"):
		return "INFOSEG"
	default:
		clean := strings.Split(upper, ".")[0]
		if clean == "" {
			return "API"
		}
		return clean
	}
}
