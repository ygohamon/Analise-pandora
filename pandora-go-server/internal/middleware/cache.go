package middleware

import (
	"net/http"
	"time"

	"pandora-go-server/internal/cache"
)

func CacheGET(store *cache.Memory, ttl time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet || ttl <= 0 {
				next.ServeHTTP(w, r)
				return
			}
			key := r.URL.RequestURI()
			if entry, ok := store.Get(key); ok {
				w.Header().Set("Content-Type", entry.Header)
				w.Header().Set("X-Cache", "HIT")
				w.WriteHeader(entry.Status)
				_, _ = w.Write(entry.Body)
				return
			}
			rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK, cache: true}
			next.ServeHTTP(rec, r)
			if rec.status == http.StatusOK {
				store.Set(key, cache.Entry{
					Body:      rec.body.Bytes(),
					Header:    w.Header().Get("Content-Type"),
					Status:    rec.status,
					ExpiresAt: time.Now().Add(ttl),
				})
			}
		})
	}
}
