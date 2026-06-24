package middleware

import (
	"context"
	"net/http"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func RequireJWT(verifier auth.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, err := verifier.Verify(r.Header.Get("Authorization"))
			if err != nil {
				httpx.ErrorFrom(w, types.ErrTokenInvalid.WithCause(err))
				return
			}
			ctx := context.WithValue(r.Context(), claimsKey{}, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := auth.UserFromClaims(ClaimsFromContext(r.Context()))
		if user["perfil"] == "admin" {
			next.ServeHTTP(w, r)
			return
		}
		if groups, ok := user["grupos"].([]any); ok {
			for _, group := range groups {
				if group == "admin" {
					next.ServeHTTP(w, r)
					return
				}
			}
		}
		httpx.ErrorFrom(w, types.ErrRouteUnauthorized)
	})
}
