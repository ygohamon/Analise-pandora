package middleware

import (
	"net/http"
	"strconv"
	"time"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		next.ServeHTTP(w, r)
	})
}

func MaxBody(bytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, bytes)
			next.ServeHTTP(w, r)
		})
	}
}

func RequireRequestHash(validFor time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := r.Header.Get("hs")
			if raw == "" {
				httpx.ErrorFrom(w, types.ErrHashNotFound)
				return
			}
			if len(raw) <= 40 {
				httpx.ErrorFrom(w, types.ErrHashInvalid)
				return
			}
			hash := raw[:40]
			ts := raw[40:]
			createdAt, err := strconv.ParseInt(ts, 10, 64)
			if err != nil {
				httpx.ErrorFrom(w, types.ErrHashInvalid.WithCause(err))
				return
			}
			if time.Since(time.UnixMilli(createdAt)) > validFor {
				httpx.ErrorFrom(w, types.ErrHashInvalid)
				return
			}
			id := auth.UserIDFromClaims(ClaimsFromContext(r.Context()))
			expected := utils.SHA1Hex(id + r.UserAgent() + ts)
			if hash != expected {
				httpx.ErrorFrom(w, types.ErrHashInvalid)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
