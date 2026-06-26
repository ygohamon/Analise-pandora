package pesquisa

import (
	"encoding/json"
	"net/http"
	"pandora-go-server/internal/http/handlers/shared"
	"strings"

	"pandora-go-server/internal/httpx"
	usecases "pandora-go-server/internal/usecases/pesquisa"
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
	userID, err := shared.CurrentUserID(r)
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
		Motivo:       shared.FirstNonEmpty(payload.Motivo, query.Get("motivo")),
		UserID:       userID,
		IP:           shared.ClientIP(r),
		Processo:     shared.FirstNonEmpty(payload.Processo, query.Get("processo"), r.Header.Get("X-Pandora-Processo")),
		TipoProcesso: shared.FirstNonEmpty(payload.TipoProcesso, query.Get("tipoProcesso"), r.Header.Get("X-Pandora-Tipo-Processo")),
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
