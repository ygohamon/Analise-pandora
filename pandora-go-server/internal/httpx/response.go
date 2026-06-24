package httpx

import (
	"encoding/json"
	"net/http"

	"pandora-go-server/internal/types"
)

type APIResponse struct {
	Status string `json:"status"`
	Msg    string `json:"msg,omitempty"`
	Data   any    `json:"dados,omitempty"`
}

func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func Error(w http.ResponseWriter, status int, code string, message string) {
	w.Header().Set("X-Pandora-Error-Code", code)
	w.Header().Set("X-Pandora-Error-Message", message)
	JSON(w, status, APIResponse{Status: code, Msg: message})
}

func ErrorFrom(w http.ResponseWriter, err error) {
	if appErr, ok := types.AsAppError(err); ok {
		w.Header().Set("X-Pandora-Error-Kind", string(appErr.Kind))
		w.Header().Set("X-Pandora-Audit-Severity", string(appErr.AuditSeverity))
		Error(w, appErr.HTTPStatus, appErr.Code, appErr.Message)
		return
	}
	w.Header().Set("X-Pandora-Error-Kind", string(types.ErrInternal.Kind))
	w.Header().Set("X-Pandora-Audit-Severity", string(types.ErrInternal.AuditSeverity))
	Error(w, types.ErrInternal.HTTPStatus, types.ErrInternal.Code, types.ErrInternal.Message)
}
