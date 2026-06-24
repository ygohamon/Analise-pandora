package middleware

import (
	"bytes"
	"net/http"
)

const maxRecordedBodyBytes = 64 * 1024

type statusRecorder struct {
	http.ResponseWriter
	status int
	body   bytes.Buffer
	cache  bool
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func (r *statusRecorder) Write(b []byte) (int, error) {
	if r.body.Len() < maxRecordedBodyBytes {
		remaining := maxRecordedBodyBytes - r.body.Len()
		if len(b) > remaining {
			_, _ = r.body.Write(b[:remaining])
		} else {
			_, _ = r.body.Write(b)
		}
	}
	return r.ResponseWriter.Write(b)
}
