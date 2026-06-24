package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) listaNegraPandora(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListBlacklist(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "LISTA NEGRA PANDORA CARREGADA COM SUCESSO.", Data: result})
}

func (h Handler) resumoAPIs(w http.ResponseWriter, r *http.Request) {
	year, err := optionalQueryInt(r, "ano")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	month, err := optionalQueryInt(r, "mes")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.APIQueriesSummary(r.Context(), year, month)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "RESUMO MENSAL DE CONSULTAS DE APIS CARREGADO.", Data: result})
}

func (h Handler) consultasAPIsMensal(w http.ResponseWriter, r *http.Request) {
	year, err := optionalQueryInt(r, "ano")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	month, err := optionalQueryInt(r, "mes")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.APIQueriesMonthly(r.Context(), year, month, r.URL.Query().Get("servico"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Histórico mensal de consultas de APIs carregado.", Data: result})
}

func (h Handler) logsRecentes(w http.ResponseWriter, r *http.Request) {
	quantity := 100
	offset := 0
	if parsed, err := optionalQueryInt(r, "quantidade"); err != nil {
		httpx.ErrorFrom(w, err)
		return
	} else if parsed != nil {
		quantity = *parsed
	}
	if parsed, err := optionalQueryInt(r, "offset"); err != nil {
		httpx.ErrorFrom(w, err)
		return
	} else if parsed != nil {
		offset = *parsed
	}
	result, err := h.auth.RecentLogs(r.Context(), quantity, offset)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) resumoLogsLegadosSemPerfil(w http.ResponseWriter, r *http.Request) {
	count, err := h.auth.LegacyNoProfileLogsCount(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Resumo de logs legados carregado com sucesso.", Data: map[string]int64{"qtd": count}})
}

func (h Handler) tokensValidos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ValidTokens(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) auditoriaPix(w http.ResponseWriter, r *http.Request) {
	filters := map[string]string{
		"usuario":      r.URL.Query().Get("usuario"),
		"dataInicio":   r.URL.Query().Get("dataInicio"),
		"dataFim":      r.URL.Query().Get("dataFim"),
		"tipoConsulta": r.URL.Query().Get("tipoConsulta"),
	}
	result, err := h.auth.AuditPix(r.Context(), filters)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Auditoria PIX carregada com sucesso", Data: result})
}

func (h Handler) processosReincidentes(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.RecurrentProcesses(r.Context(), r.URL.Query().Get("periodo"), r.URL.Query().Get("duracao"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, result)
}

func (h Handler) detalhesProcessoReincidente(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.RecurrentProcessDetails(
		r.Context(),
		r.URL.Query().Get("usuario"),
		r.URL.Query().Get("processo"),
		r.URL.Query().Get("periodo"),
		r.URL.Query().Get("duracao"),
	)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, result)
}

func (h Handler) logsErros(w http.ResponseWriter, r *http.Request) {
	filters := map[string]string{
		"de":       r.URL.Query().Get("de"),
		"ate":      r.URL.Query().Get("ate"),
		"tipo":     r.URL.Query().Get("tipo"),
		"arquivo":  r.URL.Query().Get("arquivo"),
		"mensagem": r.URL.Query().Get("mensagem"),
	}
	result, err := h.auth.ErrorLogs(r.Context(), filters)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Logs de erros recuperados.", Data: result})
}

func (h Handler) registraLogErro(w http.ResponseWriter, r *http.Request) {
	var payload types.ErrorLogPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.RegisterErrorLog(r.Context(), payload); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Log de erro atualizado."})
}

func (h Handler) alertasAuditoria(w http.ResponseWriter, r *http.Request) {
	minimum := 2
	if parsed, err := optionalQueryInt(r, "minimo"); err != nil {
		httpx.ErrorFrom(w, err)
		return
	} else if parsed != nil {
		minimum = *parsed
	}
	result, err := h.auth.AuditAlerts(r.Context(), r.URL.Query().Get("tipo"), minimum, r.URL.Query().Get("periodo"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) rankings(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.Rankings(
		r.Context(),
		r.URL.Query().Get("ranking"),
		r.URL.Query().Get("duracao"),
		r.URL.Query().Get("top"),
		r.URL.Query().Get("parametro"),
	)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) recursosMaisUtilizados(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.Resources(
		r.Context(),
		r.URL.Query().Get("duracao"),
		r.URL.Query().Get("chave"),
		r.URL.Query().Get("perfil"),
		r.URL.Query().Get("ano"),
		r.URL.Query().Get("mes"),
	)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) processosMaisUtilizados(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ProcessesMostUsed(r.Context(), r.URL.Query().Get("duracao"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) usuariosQuePesquisaram(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.UsersSearchedValue(
		r.Context(),
		r.URL.Query().Get("duracao"),
		r.URL.Query().Get("chave"),
		r.URL.Query().Get("valor"),
	)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) estatisticasUso(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.UsageStats(r.Context(), r.URL.Query().Get("categoria"), r.URL.Query().Get("duracao"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) registrosNaoEncontrados(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.NotFoundRecords(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) logsUsuarioQuery(w http.ResponseWriter, r *http.Request) {
	top, err := optionalQueryInt(r, "top")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	login := strings.TrimSpace(r.URL.Query().Get("login"))
	cpf := strings.TrimSpace(r.URL.Query().Get("cpf"))
	if cpf != "" {
		result, err := h.auth.UserLogsByCPF(r.Context(), cpf, top)
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Logs do usuário carregados com sucesso.", Data: result})
		return
	}
	if login == "" {
		httpx.ErrorFrom(w, types.ErrInvalidParam)
		return
	}
	result, err := h.auth.UserLogs(r.Context(), login, top)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Logs do usuário carregados com sucesso.", Data: result})
}

func (h Handler) logsUsuario(w http.ResponseWriter, r *http.Request) {
	top, err := optionalQueryInt(r, "top")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.UserLogs(r.Context(), r.PathValue("usuario"), top)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "Logs do usuário carregados com sucesso.", Data: result})
}
