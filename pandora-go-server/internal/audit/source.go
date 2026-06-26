package audit

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"pandora-go-server/internal/middleware"
)

// SourceEvent descreve uma fonte consultada pelo integrado sem carregar payload sensivel.
// Chamado pelos usecases para registrar auditoria tecnica por fonte.
type SourceEvent struct {
	Domain    string
	Source    string
	Category  string
	Document  string
	Allowed   bool
	Rows      int
	StartedAt time.Time
	Duration  time.Duration
	Err       error
}

// LogSource registra inicio/fim/falha de uma fonte do integrado em log estruturado.
// Retorna apenas metadados mascarados; payloads das APIs e bancos nao sao gravados.
func LogSource(ctx context.Context, event SourceEvent) {
	status := "ok"
	if !event.Allowed {
		status = "blocked"
	}
	if event.Err != nil {
		status = "error"
	}
	if os.Getenv("SERVER_ENV") != "production" {
		printSourceEvent(event, status)
		return
	}
	args := []any{
		"request_id", middleware.RequestIDFromContext(ctx),
		"domain", event.Domain,
		"source", event.Source,
		"category", event.Category,
		"document", event.Document,
		"allowed", event.Allowed,
		"status", status,
		"rows", event.Rows,
		"duration_ms", event.Duration.Milliseconds(),
	}
	if event.Err != nil {
		args = append(args, "error", event.Err.Error())
	}
	slog.InfoContext(ctx, "integrated source audited", args...)
}

func printSourceEvent(event SourceEvent, status string) {
	message := "SOURCE AUDITED"
	if status == "blocked" {
		message = "SOURCE BLOCKED"
	}
	if status == "error" {
		message = "SOURCE ERROR"
	}
	detail := fmt.Sprintf("ROWS=%d DURATION=%dMS", event.Rows, event.Duration.Milliseconds())
	if event.Err != nil {
		detail += " ERROR=" + event.Err.Error()
	}
	fmt.Fprintf(os.Stdout, "%s %s %s [%s] [%s] {%s} %s %s\n",
		time.Now().Format("15:04:05.000"),
		blue("[ INFO ]"),
		message,
		strings.ToUpper(event.Domain),
		strings.ToUpper(event.Category),
		event.Document,
		strings.ToUpper(status),
		detail,
	)
}

func blue(text string) string {
	return "\033[34m" + text + "\033[0m"
}
