package pesquisa

import (
	"net/http"
)

// pesquisa_novas_handler e o facade HTTP das telas novas da secao Pesquisa.
// Ele atende rotas do app, chama pesquisa.UseCases e mantem consultas
// exclusivas em repositories/pesquisa ate virarem dominios reaproveitaveis.

func (h Handler) gpuCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.GPUSimplificado(r.Context(), "cpf", r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) gpuNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.GPUSimplificado(r.Context(), "nome", r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) gpuRG(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.GPUSimplificado(r.Context(), "rg", r.PathValue("rg"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) gpuOAB(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.GPUSimplificado(r.Context(), "oab", r.PathValue("oab"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) gpuDetalhadoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.GPUDetalhado(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) gpuAtendimentosAdvogado(w http.ResponseWriter, r *http.Request) {
	payload, err := h.pesquisa.GPUAtendimentosAdvogado(r.Context(), r.URL.Query().Get("advogado_id"), r.URL.Query().Get("page"), r.URL.Query().Get("size"))
	if err != nil {
		h.writeOperationalResult(w, nil, err)
		return
	}
	if payload == nil {
		payload = map[string]any{"visitas": []any{}}
	}
	h.writeOperationalResult(w, []map[string]any{payload}, nil)
}

func (h Handler) presoSimplificadoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "cpf", r.PathValue("cpf"), false)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoSimplificadoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "nome", r.PathValue("nome"), false)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoSimplificadoVulgo(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "vulgo", r.PathValue("vulgo"), false)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoSimplificadoCNC(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "cnc", r.PathValue("cnc"), false)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoSimplificadoNomeMae(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "nomemae", r.PathValue("nomemae"), false)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoDetalhadoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "cpf", r.PathValue("cpf"), true)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) presoDetalhadoCNC(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Presos(r.Context(), "cnc", r.PathValue("cnc"), true)
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) armaSerie(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Arma(r.Context(), "serie", r.PathValue("serie"), "")
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) armaSINARM(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Arma(r.Context(), "sinarm", r.PathValue("sinarm"), "")
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) orgaosPesquisa(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Orgaos(r.Context(), r.URL.Query().Get("orgao"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) folhaMunicipal(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	rows, err := h.pesquisa.Folha(r.Context(), "municipal", q.Get("cdorgao"), q.Get("mes"), q.Get("ano"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) folhaEstadual(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	rows, err := h.pesquisa.Folha(r.Context(), "estadual", q.Get("cdorgao"), q.Get("mes"), q.Get("ano"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) imovelCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.ImoveisCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) imovelCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.ImoveisCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "cpf", r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "cnpj", r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "nome", r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoRazaoSocial(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "razaosocial", r.PathValue("razaosocial"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoOperacao(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "operacao", r.PathValue("operacao"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) investigadoAlcunha(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Investigados(r.Context(), "alcunha", r.PathValue("alcunha"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) prontuarioCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Prontuarios(r.Context(), "cpf", r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) prontuarioNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Prontuarios(r.Context(), "nome", r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) prontuarioRG(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Prontuarios(r.Context(), "rg", r.PathValue("rg"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) prontuarioAlcunha(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.Prontuarios(r.Context(), "alcunha", r.PathValue("alcunha"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) fichaSujaCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.FichaSuja(r.Context(), "cpf", r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) fichaSujaRG(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.FichaSuja(r.Context(), "rg", r.PathValue("rg"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) fichaSujaNome(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.FichaSuja(r.Context(), "nome", r.PathValue("nome"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) fichaSujaNomeMae(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.FichaSuja(r.Context(), "nomemae", r.PathValue("nomemae"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) fichaSujaTitulo(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.FichaSuja(r.Context(), "titulo", r.PathValue("titulo"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) processoNumero(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.ProcessoNumero(r.Context(), r.PathValue("processo"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) processoCPF(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.ProcessoCPF(r.Context(), r.PathValue("cpf"))
	h.writeOperationalResult(w, rows, err)
}

func (h Handler) processoCNPJ(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pesquisa.ProcessoCNPJ(r.Context(), r.PathValue("cnpj"))
	h.writeOperationalResult(w, rows, err)
}
