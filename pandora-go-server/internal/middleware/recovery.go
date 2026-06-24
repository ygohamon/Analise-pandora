package middleware

import (
	"log/slog"
	"net/http"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func Recover(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					logger.Error("panic recovered", "request_id", RequestIDFromContext(r.Context()), "error", rec)
					httpx.ErrorFrom(w, types.ErrInternal)
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}
