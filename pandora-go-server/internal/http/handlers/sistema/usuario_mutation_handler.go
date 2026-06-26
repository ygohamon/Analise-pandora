package sistema

import (
	"encoding/json"
	"net/http"
	"strings"

	sistemarepo "pandora-go-server/internal/repositories/sistema"

	"pandora-go-server/internal/http/handlers/shared"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) validarSenhaAtual(w http.ResponseWriter, r *http.Request) {
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	password := stringFromPayload(payload, "senhaAtual", "senhaatual", "senha", "password")
	if err := h.auth.ValidateCurrentPassword(r.Context(), actorID, password); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "SENHA ATUAL VALIDA."})
}

func (h Handler) trocaSenhaUsuario(w http.ResponseWriter, r *http.Request) {
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	targetID, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	newPassword := stringFromPayload(payload, "senhanova", "senhaNova", "novaSenha", "password")
	confirm := stringFromPayload(payload, "senhanova2", "senhaNovaConfirma", "confirmacao", "confirmPassword")
	if confirm != "" && confirm != newPassword {
		httpx.ErrorFrom(w, types.ErrInvalidParam)
		return
	}
	current := stringFromPayload(payload, "senhaantiga", "senhaAtual", "senhaatual", "currentPassword")
	if err := h.auth.ChangePassword(r.Context(), actorID, targetID, current, newPassword); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "SENHA ALTERADA COM SUCESSO."})
}

func (h Handler) atualizaPreferenciasUsuario(w http.ResponseWriter, r *http.Request) {
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	targetID, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	patch := sistemarepo.UserPreferencePatch{}
	if value, ok := optionalBool(payload, "temaEscuro", "tema_escuro"); ok {
		patch.TemaEscuro = &value
	}
	if value, ok := optionalBool(payload, "espa"); ok {
		patch.ESPA = &value
	}
	if err := h.auth.UpdateUserPreferences(r.Context(), actorID, targetID, patch); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO ATUALIZADO COM SUCESSO."})
}

func (h Handler) atualizaTermoPreUsuario(w http.ResponseWriter, r *http.Request) {
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	targetID, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	termo := stringFromPayload(payload, "termo", "arquivo", "base64", "pdf")
	if termo == "" {
		termo = strings.TrimSpace(stringFromPayload(payload, "termoBase64", "documento"))
	}
	if err := h.auth.UpdatePreUserTerm(r.Context(), actorID, targetID, termo); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "TERMO ATUALIZADO COM SUCESSO."})
}

func (h Handler) meuHistorico(w http.ResponseWriter, r *http.Request) {
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	targetID, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	quantity := 200
	offset := 0
	if parsed, err := shared.OptionalQueryInt(r, "quantidade"); err != nil {
		httpx.ErrorFrom(w, err)
		return
	} else if parsed != nil {
		quantity = *parsed
	}
	if parsed, err := shared.OptionalQueryInt(r, "offset"); err != nil {
		httpx.ErrorFrom(w, err)
		return
	} else if parsed != nil {
		offset = *parsed
	}
	result, err := h.auth.MyHistory(r.Context(), actorID, targetID, quantity, offset)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) redefineSenhaUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	payload := map[string]any{}
	_ = json.NewDecoder(r.Body).Decode(&payload)
	password := stringFromPayload(payload, "senha", "senhanova", "senhaNova", "password")
	if err := h.auth.ResetUserPassword(r.Context(), id, password); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "SENHA REDEFINIDA COM SUCESSO."})
}

func (h Handler) redefineSenhasGeral(w http.ResponseWriter, r *http.Request) {
	payload := map[string]any{}
	_ = json.NewDecoder(r.Body).Decode(&payload)
	password := stringFromPayload(payload, "senha", "senhanova", "senhaNova", "password")
	if err := h.auth.ResetAllPasswords(r.Context(), password); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "SENHAS REDEFINIDAS COM SUCESSO."})
}

func (h Handler) resetTFAUsuario(w http.ResponseWriter, r *http.Request) {
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.ResetTFA(r.Context(), stringFromPayload(payload, "login")); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "TFA REDEFINIDO COM SUCESSO."})
}

func (h Handler) removeUsuarioFalso(w http.ResponseWriter, r *http.Request) {
	payload, err := stringMapPayload(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.RemoveFalseUser(r.Context(), payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO REMOVIDO COM SUCESSO."})
}

func (h Handler) alteraListaNegraUsuario(w http.ResponseWriter, r *http.Request) {
	payload, err := stringMapPayload(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	action := r.PathValue("acao")
	if err := h.auth.SetBlacklistStatus(r.Context(), action, payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LISTA NEGRA ATUALIZADA COM SUCESSO."})
}

func (h Handler) removeUsuarioPorIdentificador(w http.ResponseWriter, r *http.Request) {
	value := strings.TrimSpace(r.PathValue("id"))
	payload := map[string]string{}
	if digits := strings.TrimSpace(value); digits != "" {
		payload["cpf"] = digits
	}
	if err := h.auth.SetBlacklistStatus(r.Context(), "bloquear", payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO BLOQUEADO COM SUCESSO."})
}

func stringMapPayload(r *http.Request) (map[string]string, error) {
	var raw map[string]any
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		return nil, types.ErrInvalidPayload.WithCause(err)
	}
	out := map[string]string{}
	for key, value := range raw {
		out[key] = strings.TrimSpace(toString(value))
	}
	return out, nil
}

func stringFromPayload(payload map[string]any, keys ...string) string {
	for _, key := range keys {
		if value, ok := payload[key]; ok {
			if text := strings.TrimSpace(toString(value)); text != "" {
				return text
			}
		}
	}
	return ""
}

func optionalBool(payload map[string]any, keys ...string) (bool, bool) {
	for _, key := range keys {
		if value, ok := payload[key]; ok {
			switch v := value.(type) {
			case bool:
				return v, true
			case float64:
				return v != 0, true
			case string:
				trimmed := strings.ToLower(strings.TrimSpace(v))
				return trimmed == "true" || trimmed == "1" || trimmed == "sim" || trimmed == "yes", true
			}
		}
	}
	return false, false
}

func toString(value any) string {
	switch v := value.(type) {
	case string:
		return v
	case float64:
		return strings.TrimSuffix(strings.TrimSuffix(jsonNumber(v), "0"), ".")
	case bool:
		if v {
			return "true"
		}
		return "false"
	default:
		return ""
	}
}

func jsonNumber(value float64) string {
	raw, _ := json.Marshal(value)
	return string(raw)
}
