package middleware

import (
	"net/http"
	"sync"
	"time"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func RateLimit(limitPerMinute int) func(http.Handler) http.Handler {
	type bucket struct {
		count int
		reset time.Time
	}
	var mu sync.Mutex
	buckets := map[string]bucket{}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if limitPerMinute <= 0 {
				next.ServeHTTP(w, r)
				return
			}
			key := clientIP(r)
			now := time.Now()
			mu.Lock()
			b := buckets[key]
			if now.After(b.reset) {
				b = bucket{reset: now.Add(time.Minute)}
			}
			b.count++
			buckets[key] = b
			mu.Unlock()
			if b.count > limitPerMinute {
				httpx.ErrorFrom(w, types.ErrQuotaEmpty)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
