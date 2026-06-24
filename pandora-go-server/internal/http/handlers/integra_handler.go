package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"pandora-go-server/internal/httpx"
)

func (h Handler) listaRequisicoesIntegra(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.IntegraRequests(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) finalizaRequisicaoIntegra(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.FinishIntegraRequest(r.Context(), id); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "REQUISIÇÃO FINALIZADA COM SUCESSO."})
}

func (h Handler) historicoIntegraPorPerfil(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.IntegraHistoryByProfile(r.Context(), r.PathValue("perfil"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) historicoIntegraAtendimento(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.IntegraServiceHistory(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) dashboardIntegra(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.IntegraDashboard(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) downloadAnexoIntegra(w http.ResponseWriter, r *http.Request) {
	id, err := pathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	attachment, err := h.auth.IntegraAttachment(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	mime := firstNonEmpty(attachment.MIME, "application/octet-stream")
	name := strings.ReplaceAll(firstNonEmpty(attachment.NomeArquivo, "anexo"), "\"", "")
	w.Header().Set("Content-Type", mime)
	w.Header().Set("Content-Length", strconv.FormatInt(attachment.Tamanho, 10))
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", name))
	_, _ = w.Write(attachment.Arquivo)
}
