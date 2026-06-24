package httpx

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"pandora-go-server/internal/types"
)

func TestErrorFromKnownAppError(t *testing.T) {
	t.Parallel()

	rec := httptest.NewRecorder()
	ErrorFrom(rec, types.ErrTokenInvalid)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}

	var payload APIResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if payload.Status != types.ErrTokenInvalid.Code {
		t.Fatalf("payload status = %q, want %q", payload.Status, types.ErrTokenInvalid.Code)
	}
}

func TestAPIResponseUsesDadosField(t *testing.T) {
	t.Parallel()

	rec := httptest.NewRecorder()
	JSON(rec, http.StatusOK, APIResponse{Status: "OK", Data: map[string]string{"token": "abc"}})

	var payload map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if _, ok := payload["dados"]; !ok {
		t.Fatalf("payload = %v, want dados field", payload)
	}
	if _, ok := payload["data"]; ok {
		t.Fatalf("payload = %v, did not want data field", payload)
	}
}

func TestErrorFromUnknownError(t *testing.T) {
	t.Parallel()

	rec := httptest.NewRecorder()
	ErrorFrom(rec, errors.New("boom"))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}

	var payload APIResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	if payload.Status != types.ErrInternal.Code {
		t.Fatalf("payload status = %q, want %q", payload.Status, types.ErrInternal.Code)
	}
}
