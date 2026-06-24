package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/usecases"
)

type bcccsPixPayload struct {
	UserID       int64  `json:"userId"`
	Motivo       string `json:"motivo"`
	Processo     string `json:"processo"`
	TipoProcesso string `json:"tipoProcesso"`
}

// bcccsPixCPF recebe HTTP e delega consulta PIX por CPF ao BCCCSUseCase.
func (h Handler) bcccsPixCPF(w http.ResponseWriter, r *http.Request) {
	h.bcccsPix(w, r, "cpf", r.PathValue("cpf"))
}

// bcccsPixCNPJ recebe HTTP e delega consulta PIX por CNPJ ao BCCCSUseCase.
func (h Handler) bcccsPixCNPJ(w http.ResponseWriter, r *http.Request) {
	h.bcccsPix(w, r, "cnpj", r.PathValue("cnpj"))
}

// bcccsPixChave recebe HTTP e delega consulta PIX por chave ao BCCCSUseCase.
func (h Handler) bcccsPixChave(w http.ResponseWriter, r *http.Request) {
	h.bcccsPix(w, r, "chave", r.PathValue("chave"))
}

func (h Handler) bcccsPix(w http.ResponseWriter, r *http.Request, tipo string, valor string) {
	var payload bcccsPixPayload
	if r.Body != nil {
		_ = json.NewDecoder(r.Body).Decode(&payload)
	}
	userID, err := currentUserID(r)
	if err != nil && payload.UserID > 0 {
		userID = payload.UserID
		err = nil
	}
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}

	query := r.URL.Query()
	req := usecases.BCCCSRequest{
		Tipo:         tipo,
		Valor:        valor,
		Motivo:       firstNonEmpty(payload.Motivo, query.Get("motivo")),
		UserID:       userID,
		IP:           clientIP(r),
		Processo:     firstNonEmpty(payload.Processo, query.Get("processo"), r.Header.Get("X-Pandora-Processo")),
		TipoProcesso: firstNonEmpty(payload.TipoProcesso, query.Get("tipoProcesso"), r.Header.Get("X-Pandora-Tipo-Processo")),
	}
	dados, err := h.bcccs.ConsultaPix(r.Context(), req)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	msg := "BCCCS - CONSULTA PIX"
	if len(dados) == 0 {
		msg = strings.ToUpper("Registro nao encontrado.")
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: msg, Data: dados})
}
