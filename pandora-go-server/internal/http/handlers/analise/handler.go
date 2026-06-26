package analise

import (
	"net/http"

	"pandora-go-server/internal/httpx"
)

// analiseEmpenhos atende as telas de empenhos e delega a consulta ao UseCase.
func (h Handler) analiseEmpenhos(w http.ResponseWriter, r *http.Request) {
	rows, err := h.analise.Empenhos(r.Context(), r.PathValue("tipo"), r.PathValue("valor"))
	h.analiseRows(w, r, rows, err)
}

// analiseLicitacoes atende consultas de licitacoes por CPF/CNPJ.
func (h Handler) analiseLicitacoes(w http.ResponseWriter, r *http.Request) {
	rows, err := h.analise.Licitacoes(r.Context(), r.PathValue("tipo"), r.PathValue("valor"))
	h.analiseRows(w, r, rows, err)
}

// analiseLicitacaoDados atende o filtro composto da tela de licitacoes.
func (h Handler) analiseLicitacaoDados(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	rows, err := h.analise.LicitacaoDados(r.Context(), q.Get("cdugestora"), q.Get("nulicitacao"), q.Get("cdmdlicitacao"))
	h.analiseRows(w, r, rows, err)
}

// analiseAditivos atende consultas de aditivos por documento ou licitacao.
func (h Handler) analiseAditivos(w http.ResponseWriter, r *http.Request) {
	rows, err := h.analise.Aditivos(r.Context(), r.PathValue("tipo"), r.PathValue("valor"))
	h.analiseRows(w, r, rows, err)
}

// analiseContratos atende consultas de contratos por documento, licitacao ou contrato.
func (h Handler) analiseContratos(w http.ResponseWriter, r *http.Request) {
	rows, err := h.analise.Contratos(r.Context(), r.PathValue("tipo"), r.PathValue("valor"))
	h.analiseRows(w, r, rows, err)
}

// analiseTCE atende os endpoints CODATA/TCE por tipo e data.
func (h Handler) analiseTCE(w http.ResponseWriter, r *http.Request) {
	rows, err := h.analise.TCE(r.Context(), r.PathValue("tipo"), r.PathValue("data"))
	h.analiseRows(w, r, rows, err)
}

func (h Handler) analiseRows(w http.ResponseWriter, _ *http.Request, rows []map[string]any, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: rows})
}
