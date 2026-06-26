package pesquisa

import (
	"fmt"
	"net/http"
	"strings"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/middleware"
	"pandora-go-server/internal/types"
)

func (h Handler) pessoaIntegradoCPF(w http.ResponseWriter, r *http.Request) {
	cpf := r.PathValue("cpf")
	result, err := h.pessoas.IntegradoCPF(r.Context(), cpf, h.pessoaSearchOptions(r))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaIntegradoRG(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.IntegradoRG(r.Context(), r.PathValue("rg"), h.pessoaSearchOptions(r))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaIntegradoNome(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.IntegradoNome(r.Context(), r.PathValue("nome"), h.pessoaSearchOptions(r))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSearchOptions(r *http.Request) types.SearchOptions {
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

func boolClaim(user map[string]any, key string, fallback bool) bool {
	return boolClaimAny(user, fallback, key)
}

func boolClaimAny(user map[string]any, fallback bool, keys ...string) bool {
	for _, key := range keys {
		value, ok := user[key]
		if ok && value != nil {
			return boolValue(value, fallback)
		}
	}
	return fallback
}

func boolValue(value any, fallback bool) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case float64:
		return typed == 1
	case int:
		return typed == 1
	case string:
		return truthy(typed)
	default:
		return fallback
	}
}

func stringClaimAny(user map[string]any, keys ...string) string {
	for _, key := range keys {
		if value, ok := user[key]; ok && value != nil {
			text := strings.TrimSpace(fmt.Sprint(value))
			if text != "" && text != "<nil>" {
				return text
			}
		}
	}
	return ""
}

func onlyDigits(value string) string {
	var b strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func truthy(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "1", "s", "sim", "true", "t", "y", "yes":
		return true
	default:
		return false
	}
}

func (h Handler) writePessoaResult(w http.ResponseWriter, result any) {
	if pessoaResultEmpty(result) {
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{
			Status: "ENOTFOUND",
			Msg:    "REGISTRO NÃO ENCONTRADO.",
			Data:   []any{},
		})
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func pessoaResultEmpty(result any) bool {
	switch typed := result.(type) {
	case nil:
		return true
	case []types.PessoaSimplificada:
		return len(typed) == 0
	case []map[string]any:
		return len(typed) == 0
	case []any:
		return len(typed) == 0
	default:
		return false
	}
}

func (h Handler) pessoaSimplificadoCPF(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoCPF(r.Context(), r.PathValue("cpf"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoNome(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoNome(r.Context(), r.PathValue("nome"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoRG(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoRG(r.Context(), r.PathValue("rg"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoCNH(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoCNH(r.Context(), r.PathValue("cnh"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoTitulo(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoTitulo(r.Context(), r.PathValue("titulo"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoNomePai(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoNomePai(r.Context(), r.PathValue("nome"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoNomeMae(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoNomeMae(r.Context(), r.PathValue("nome"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoTelefone(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoTelefone(r.Context(), r.PathValue("telefone"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoEmail(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoEmail(r.Context(), r.PathValue("email"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}

func (h Handler) pessoaSimplificadoEndereco(w http.ResponseWriter, r *http.Request) {
	result, err := h.pessoas.SimplificadoEndereco(r.Context(), r.PathValue("endereco"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	h.writePessoaResult(w, result)
}
