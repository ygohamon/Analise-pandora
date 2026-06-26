package pesquisa

import (
	"net/http"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

// pesquisa_operacional_handler e o facade HTTP das telas de Pesquisa ja
// consolidadas. Cada handler atende uma rota do app e delega para o usecase de
// dominio existente, sem SQL e sem montar regra de permissao no repository.

func (h Handler) enderecoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.endereco.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) enderecoCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.endereco.PorCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) enderecoLogradouro(w http.ResponseWriter, r *http.Request) {
	rows, err := h.endereco.PorLogradouro(r.Context(), r.PathValue("logradouro"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) enderecoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.endereco.PorNome(r.Context(), r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) enderecoRazaoSocial(w http.ResponseWriter, r *http.Request) {
	rows, err := h.endereco.PorRazaoSocial(r.Context(), r.PathValue("razaosocial"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorNome(r.Context(), r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoChassi(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorChassi(r.Context(), r.PathValue("chassi"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoRenavam(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorRenavam(r.Context(), r.PathValue("renavam"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) veiculoPlaca(w http.ResponseWriter, r *http.Request) {
	rows, err := h.veiculo.PorPlaca(r.Context(), r.PathValue("placa"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) embarcacaoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.embarcacao.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) embarcacaoCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.embarcacao.PorCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) embarcacaoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.embarcacao.PorNome(r.Context(), r.PathValue("embarcacao"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) embarcacaoInscricao(w http.ResponseWriter, r *http.Request) {
	rows, err := h.embarcacao.PorInscricao(r.Context(), r.PathValue("inscricao"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) aeronaveCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.aeronave.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) aeronaveCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.aeronave.PorCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) aeronaveNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.aeronave.PorNome(r.Context(), r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) aeronaveMatricula(w http.ResponseWriter, r *http.Request) {
	rows, err := h.aeronave.PorMatricula(r.Context(), r.PathValue("matricula"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) obitoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.obito.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) obitoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.obito.PorNome(r.Context(), r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) beneficioCPF(w http.ResponseWriter, r *http.Request) {
	if !h.pessoaSearchOptions(r).Transparencia {
		httpx.ErrorFrom(w, types.ErrRouteUnauthorized)
		return
	}
	rows, err := h.beneficio.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) telefoneCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.telefone.PorCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) telefoneCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.telefone.PorCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) telefoneNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.telefone.PorNome(r.Context(), r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) telefoneRazaoSocial(w http.ResponseWriter, r *http.Request) {
	value := r.PathValue("razaosocial")
	if value == "" {
		value = r.PathValue("nomefantasia")
	}
	rows, err := h.telefone.PorRazaoSocial(r.Context(), value)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) telefoneNumero(w http.ResponseWriter, r *http.Request) {
	rows, err := h.telefone.PorTelefone(r.Context(), r.PathValue("telefone"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) orcrimLista(w http.ResponseWriter, r *http.Request) {
	rows, err := h.orcrim.Listar(r.Context())
	h.writeOrcrimResult(w, rows, err)
}

func (h Handler) orcrimNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.orcrim.PorNome(r.Context(), r.PathValue("orcrim"))
	h.writeOrcrimResult(w, rows, err)
}

func (h Handler) writeOperationalResult(w http.ResponseWriter, rows []map[string]any, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if rows == nil {
		rows = []map[string]any{}
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: rows})
}

func (h Handler) writeOrcrimResult(w http.ResponseWriter, rows []map[string]any, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if rows == nil {
		rows = []map[string]any{}
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{
		Status: "OK",
		Data: []map[string]any{{
			"membros_organizacao_criminosa": rows,
		}},
	})
}
