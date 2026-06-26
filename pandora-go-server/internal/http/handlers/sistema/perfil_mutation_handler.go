package sistema

import (
	"encoding/json"
	"net/http"

	"pandora-go-server/internal/http/handlers/shared"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) atualizaPermissoesPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var raw json.RawMessage
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	var payload []types.Permissao
	if err := json.Unmarshal(raw, &payload); err != nil || payload == nil {
		grouped := map[string][]string{}
		if err := json.Unmarshal(raw, &grouped); err != nil {
			httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
			return
		}
		payload = groupedPermissionsToList(grouped)
	}
	if err := h.auth.UpdateProfilePermissions(r.Context(), id, payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "PERMISSOES DO PERFIL ATUALIZADAS COM SUCESSO."})
}

func (h Handler) atualizaFlagPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	flag := r.PathValue("flag")
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	value := firstPayloadValue(payload, profilePayloadKeys(flag)...)
	if err := h.auth.UpdateProfileFlag(r.Context(), id, flag, value); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "PERFIL ATUALIZADO COM SUCESSO."})
}

func (h Handler) atualizaHorarioPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	active, _ := optionalBool(payload, "ativo", "horarioAtivo")
	start := int64(numberFromPayload(payload, 9, "hora_inicio", "horaInicio", "inicio"))
	end := int64(numberFromPayload(payload, 19, "hora_fim", "horaFim", "fim"))
	if err := h.auth.UpdateProfileSchedule(r.Context(), id, active, start, end); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "HORARIO DO PERFIL ATUALIZADO COM SUCESSO."})
}

func (h Handler) atualizaProcessoPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	required, _ := optionalBool(payload, "necessitaProcesso", "necessita_processo", "ativo")
	limitValue := int64(numberFromPayload(payload, -1, "limiteConsultasPorProcesso", "limite_consultas_por_processo", "limite"))
	var limit *int64
	if limitValue >= 0 {
		limit = &limitValue
	}
	if err := h.auth.UpdateProfileProcess(r.Context(), id, required, limit); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "PROCESSO DO PERFIL ATUALIZADO COM SUCESSO."})
}

func (h Handler) atualizaSessaoPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload map[string]any
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	minutes := int64(numberFromPayload(payload, 15, "tempoSessaoMinutos", "tempo_sessao_minutos", "tempo", "minutos"))
	if err := h.auth.UpdateProfileSession(r.Context(), id, minutes); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "SESSAO DO PERFIL ATUALIZADA COM SUCESSO."})
}

func (h Handler) criaPerfil(w http.ResponseWriter, r *http.Request) {
	var payload types.PerfilAdmin
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.CreateProfile(r.Context(), payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "PERFIL CRIADO COM SUCESSO."})
}

func (h Handler) removePerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.DeleteProfile(r.Context(), id); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "PERFIL REMOVIDO COM SUCESSO."})
}

func firstPayloadValue(payload map[string]any, keys ...string) any {
	for _, key := range keys {
		if value, ok := payload[key]; ok {
			return value
		}
	}
	return false
}

func profilePayloadKeys(flag string) []string {
	common := []string{"valor", "value", "ativo", "checked", flag}
	switch flag {
	case "fontes-abertas":
		return append([]string{"fontesAbertas", "fontes_abertas"}, common...)
	case "fontes-dados":
		return append([]string{"mostrarFontesDados", "mostrar_fontes_dados"}, common...)
	case "servidor-estadual":
		return append([]string{"servidorEstadual", "servidor_estadual"}, common...)
	case "pesquisa-endereco":
		return append([]string{"pesquisaEndereco", "pesquisa_endereco"}, common...)
	default:
		return common
	}
}

func numberFromPayload(payload map[string]any, fallback int, keys ...string) int {
	for _, key := range keys {
		if value, ok := payload[key]; ok {
			switch v := value.(type) {
			case float64:
				return int(v)
			case int:
				return v
			}
		}
	}
	return fallback
}

func groupedPermissionsToList(grouped map[string][]string) []types.Permissao {
	out := []types.Permissao{}
	for section, items := range grouped {
		for _, item := range items {
			out = append(out, types.Permissao{Secao: section, Item: item})
		}
	}
	return out
}
