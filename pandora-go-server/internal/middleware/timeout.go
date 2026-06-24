package middleware

import (
	"net/http"
	"time"

	"pandora-go-server/internal/types"
)

func Timeout(timeout time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.TimeoutHandler(next, timeout, `{"status":"`+types.ErrLoginTimeout.Code+`","msg":"`+types.ErrLoginTimeout.Message+`"}`)
	}
}
