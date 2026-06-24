package middleware

import "net/http"

func CORS(allowed []string, env string) func(http.Handler) http.Handler {
	allowedSet := map[string]struct{}{}
	for _, origin := range allowed {
		allowedSet[origin] = struct{}{}
	}
	dev := env == "development" || env == "test"
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if _, ok := allowedSet[origin]; ok || (dev && isDevOrigin(origin)) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, hs")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE, OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func isDevOrigin(origin string) bool {
	return origin == "http://localhost:4200" || origin == "http://127.0.0.1:4200"
}
