package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) login(w http.ResponseWriter, r *http.Request) {
	var payload types.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	result, err := h.auth.Login(r.Context(), payload, clientIP(r))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LOGIN EFETUADO.", Data: result})
}

func (h Handler) loginDev(w http.ResponseWriter, r *http.Request) {
	var payload types.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	result, err := h.auth.LoginDev(r.Context(), payload)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LOGIN EFETUADO.", Data: result})
}

func (h Handler) loginByApp(w http.ResponseWriter, r *http.Request) {
	var payload types.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if strings.TrimSpace(payload.TokenApp) == "" {
		httpx.ErrorFrom(w, types.ErrAppNotFound)
		return
	}
	result, err := h.auth.LoginByApp(r.Context(), payload)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LOGIN EFETUADO.", Data: result})
}

func (h Handler) setupTFA(w http.ResponseWriter, r *http.Request) {
	id, err := currentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload types.SetupTFARequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	result, err := h.auth.SetupTFAForUser(r.Context(), id, payload.Senha)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"status":     200,
		"message":    "CONFIGURACAO DA AUTENTICACAO DE DOIS FATORES REALIZADA COM SUCESSO.",
		"setupToken": result.SetupToken,
		"dataURL":    result.DataURL,
		"tfaURL":     result.TFAURL,
	})
}

func (h Handler) verifyTFA(w http.ResponseWriter, r *http.Request) {
	id, err := currentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload types.VerifyTFARequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	result, err := h.auth.VerifyTFAForUser(r.Context(), id, payload.Token, payload.SetupToken)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LOGIN EFETUADO.", Data: result})
}

func (h Handler) usuarioMe(w http.ResponseWriter, r *http.Request) {
	id, err := currentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	user, err := h.auth.Me(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []types.Usuario{user}})
}

func (h Handler) permissoesMe(w http.ResponseWriter, r *http.Request) {
	id, err := currentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	perms, err := h.auth.Permissions(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: perms})
}
