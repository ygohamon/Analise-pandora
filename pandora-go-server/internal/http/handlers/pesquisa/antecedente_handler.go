package pesquisa

import (
	"net/http"

	"pandora-go-server/internal/httpx"
)

// antecedentePDFRG atende o clique no RG da aba antecedentes e retorna o PDF do SISMP.
func (h Handler) antecedentePDFRG(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.AntecedentePDFRG(r.Context(), r.PathValue("rg"), r.PathValue("login"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}
