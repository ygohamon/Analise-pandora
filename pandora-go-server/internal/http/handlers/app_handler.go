package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) listaAplicativos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListAuthorizedApps(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []map[string]any{{"aplicativo": result}}})
}

func (h Handler) criaAplicativo(w http.ResponseWriter, r *http.Request) {
	var payload types.AplicativoPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	token, err := h.auth.CreateAuthorizedApp(r.Context(), payload)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{
		Status: "OK",
		Msg:    fmt.Sprintf("Aplicativo %s autorizado. Garde as credenciais geradas para o cliente", payload.Nome),
		Data:   []any{payload.Nome, token},
	})
}

func (h Handler) atualizaAplicativo(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload types.AplicativoPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.UpdateAuthorizedApp(r.Context(), id, payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Aplicativo atualizado"})
}

func (h Handler) removeAplicativo(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.DeleteAuthorizedApp(r.Context(), id); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Aplicativo removido"})
}
