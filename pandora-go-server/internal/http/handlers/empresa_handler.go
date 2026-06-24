package handlers

import (
	"net/http"
	"strings"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/middleware"
	"pandora-go-server/internal/types"
)

// empresaIntegradoCNPJ atende o clique da pesquisa de empresa e retorna abas por categoria.
func (h Handler) empresaIntegradoCNPJ(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.IntegradoCNPJ(r.Context(), r.PathValue("cnpj"), h.empresaSearchOptions(r))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writeEmpresaIntegratedResult(w, result)
}

func (h Handler) empresaDetalhadoCNPJ(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.DetalhadoCNPJ(r.Context(), r.PathValue("cnpj"), h.empresaSearchOptions(r))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSearchOptions(r *http.Request) types.SearchOptions {
	user := auth.UserFromClaims(middleware.ClaimsFromContext(r.Context()))
	cpfUsuario := strings.TrimSpace(r.Header.Get("cpf-usuario"))
	if cpfUsuario == "" {
		cpfUsuario = stringClaimAny(user, "cpf")
	}
	cpfUsuario = onlyDigits(cpfUsuario)
	return types.SearchOptions{
		Funcao:        strings.ToLower(r.URL.Query().Get("funcao")),
		CPFUsuario:    cpfUsuario,
		EmailUsuario:  r.Header.Get("email-usuario"),
		Processo:      r.URL.Query().Get("processo"),
		PEP:           truthy(r.URL.Query().Get("pep")) && boolClaim(user, "pep", false),
		RIF:           truthy(r.URL.Query().Get("rif")) && boolClaim(user, "rif", false),
		JusBrasil:     boolClaim(user, "jusbrasil", false),
		Cortex:        boolClaim(user, "cortex", true),
		SEEU:          boolClaim(user, "seeu", false),
		Transparencia: boolClaim(user, "transparencia", true),
		FontesAbertas: boolClaimAny(user, false, "fontesAbertas", "fontes_abertas"),
	}
}

// empresaSimplificadoCNPJ atende a pesquisa inicial de empresas por CNPJ.
func (h Handler) empresaSimplificadoCNPJ(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoRazaoSocial(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoRazaoSocial(r.Context(), r.PathValue("razaosocial"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoNomeFantasia(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoNomeFantasia(r.Context(), r.PathValue("nomefantasia"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoEndereco(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoEndereco(r.Context(), r.PathValue("endereco"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoTelefone(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoTelefone(r.Context(), r.PathValue("telefone"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoEmail(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoEmail(r.Context(), r.PathValue("email"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoSocioPFCPF(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoSocioPFCPF(r.Context(), r.PathValue("cpf"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoSocioPFNome(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoSocioPFNome(r.Context(), r.PathValue("nome"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) empresaSimplificadoSocioPJCNPJ(w http.ResponseWriter, r *http.Request) {
	result, err := h.empresa.SimplificadoSocioPJCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeEmpresaResult(w, result, err)
}

func (h Handler) writeEmpresaResult(w http.ResponseWriter, result []map[string]any, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if len(result) == 0 {
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{
			Status: "ENOTFOUND",
			Msg:    "REGISTRO NÃO ENCONTRADO.",
			Data:   []any{},
		})
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) writeEmpresaIntegratedResult(w http.ResponseWriter, result any) {
	if empresaResultEmpty(result) {
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{
			Status: "ENOTFOUND",
			Msg:    "REGISTRO NÃO ENCONTRADO.",
			Data:   []any{},
		})
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func empresaResultEmpty(result any) bool {
	switch typed := result.(type) {
	case nil:
		return true
	case []map[string]any:
		return len(typed) == 0
	case []any:
		return len(typed) == 0
	default:
		return false
	}
}
