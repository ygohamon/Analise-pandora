package integrations

import (
	"context"

	"pandora-go-server/internal/middleware"
)

// LogAttrs devolve campos comuns para logs tecnicos de APIs externas.
// Chamado pelos clients HTTP/SOAP para correlacionar fonte externa e request HTTP.
func LogAttrs(ctx context.Context, apiName string) []any {
	return []any{
		"request_id", middleware.RequestIDFromContext(ctx),
		"api", apiName,
	}
}
