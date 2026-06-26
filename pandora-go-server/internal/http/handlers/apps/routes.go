package apps

import (
	"encoding/json"
	"net/http"

	"pandora-go-server/internal/httpx"
	appsuc "pandora-go-server/internal/usecases/apps"
)

// Handler concentra as entradas HTTP da secao Apps.
type Handler struct {
	apps appsuc.UseCase
}

// NewHandler cria o facade HTTP usado pelo compositor raiz.
func NewHandler(apps appsuc.UseCase) Handler {
	return Handler{apps: apps}
}

// Register registra as rotas consumidas pelas telas atuais de dashboard/apps.
func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler, admin func(http.Handler) http.Handler) {
	mux.Handle("POST /integra", protected(http.HandlerFunc(h.integraCadastro)))
	mux.Handle("GET /integra/promotorias/{promotoria}", protected(http.HandlerFunc(h.integraPromotorias)))
	mux.Handle("GET /integra/promotorias/", protected(http.HandlerFunc(h.integraPromotorias)))
	mux.Handle("POST /integra/demandas/", protected(http.HandlerFunc(h.integraDemandas)))

	mux.Handle("GET /cacafantasmas/orgao/municipal/{orgao}", protected(http.HandlerFunc(h.cacaFantasmasOrgao)))
	mux.Handle("GET /cacafantasmas/cdugestora/{cdugestora}", protected(http.HandlerFunc(h.cacaFantasmasAnalise)))
	mux.Handle("GET /dna/cnpj/{cnpj}", protected(http.HandlerFunc(h.dnaCNPJ)))
	mux.Handle("GET /painelcovid/tabelageral/{uf}", protected(http.HandlerFunc(h.painelCovidUF)))
	mux.Handle("GET /nepotismo/orgao", protected(http.HandlerFunc(h.inpOrgao)))
	mux.Handle("GET /nepotismo/cpf", protected(http.HandlerFunc(h.inpCPF)))
	mux.Handle("GET /mapaconsumo/", protected(http.HandlerFunc(h.mapaConsumo)))

	mux.Handle("GET /relacionamentos/lista/{lista}", protected(http.HandlerFunc(h.relacionamentosLista)))
	mux.Handle("GET /relacionamentos/pessoa", protected(http.HandlerFunc(h.relacionamentosPessoa)))
	mux.Handle("GET /relacionamentos/telefone", protected(http.HandlerFunc(h.relacionamentosTelefone)))
	mux.Handle("GET /relacionamentos/empresa", protected(http.HandlerFunc(h.relacionamentosEmpresa)))
	mux.Handle("GET /relacionamentos/orgao", protected(http.HandlerFunc(h.relacionamentosOrgao)))
	mux.Handle("GET /relacionamentos/endereco", protected(http.HandlerFunc(h.relacionamentosEndereco)))

	mux.Handle("GET /faccoes", protected(http.HandlerFunc(h.faccoesLista)))
	mux.Handle("GET /faccoes/", protected(http.HandlerFunc(h.faccoesLista)))
	mux.Handle("GET /faccoes/faccionado/cpf/{cpf}", protected(http.HandlerFunc(h.faccoesFaccionadoCPF)))
	mux.Handle("GET /faccoes/faccionado/depen/cpf/{cpf}", protected(http.HandlerFunc(h.faccoesFaccionadoDepenCPF)))
	mux.Handle("GET /faccoes/faccionado/rg/{rg}", protected(http.HandlerFunc(h.faccoesFaccionadoRG)))
	mux.Handle("GET /faccoes/faccionado/depen/rg/{rg}", protected(http.HandlerFunc(h.faccoesFaccionadoDepenRG)))
	mux.Handle("GET /faccoes/faccionado/nome/{nome}", protected(http.HandlerFunc(h.faccoesFaccionadoNome)))
	mux.Handle("GET /faccoes/faccionado/depen/nome/{nome}", protected(http.HandlerFunc(h.faccoesFaccionadoDepenNome)))
	mux.Handle("GET /faccoes/faccionado/nomemae/{nomemae}", protected(http.HandlerFunc(h.faccoesFaccionadoNomeMae)))
	mux.Handle("GET /faccoes/faccionado/depen/nomemae/{nomemae}", protected(http.HandlerFunc(h.faccoesFaccionadoDepenNomeMae)))
	mux.Handle("GET /faccoes/faccionado/nomepai/{nomepai}", protected(http.HandlerFunc(h.faccoesFaccionadoNomePai)))
	mux.Handle("GET /faccoes/faccionado/depen/nomepai/{nomepai}", protected(http.HandlerFunc(h.faccoesFaccionadoDepenNomePai)))
	mux.Handle("GET /faccoes/faccionado/alcunha/{alcunha}", protected(http.HandlerFunc(h.faccoesFaccionadoAlcunha)))
	mux.Handle("GET /faccoes/faccionado/imagens/cpf/{cpf}", protected(http.HandlerFunc(h.faccoesImagensCPF)))
	mux.Handle("GET /faccoes/faccionado/depen/imagens/cpf/{cpf}", protected(http.HandlerFunc(h.faccoesImagensDepenCPF)))
	mux.Handle("GET /faccoes/membros/idfaccao/{id}", protected(http.HandlerFunc(h.faccoesMembros)))
	mux.Handle("GET /faccoes/semvalidacao", protected(http.HandlerFunc(h.faccoesSemValidacao)))
	mux.Handle("GET /faccoes/faccionados/semvalidacao", protected(http.HandlerFunc(h.faccionadosSemValidacao)))
	mux.Handle("POST /faccoes", admin(http.HandlerFunc(h.faccoesCriaFaccao)))
	mux.Handle("POST /faccoes/faccionado", admin(http.HandlerFunc(h.faccoesCriaFaccionado)))
	mux.Handle("PATCH /faccoes/validacao/faccao/{idFaccao}", admin(http.HandlerFunc(h.faccoesValidaFaccao)))
	mux.Handle("DELETE /faccoes/validacao/faccao/{idFaccao}", admin(http.HandlerFunc(h.faccoesRejeitaFaccao)))
	mux.Handle("PATCH /faccoes/validacao/faccionado/{idFaccionado}", admin(http.HandlerFunc(h.faccoesValidaFaccionado)))
	mux.Handle("DELETE /faccoes/validacao/faccionado/{idFaccionado}", admin(http.HandlerFunc(h.faccoesRejeitaFaccionado)))

	mux.Handle("GET /tiporank/uf", protected(http.HandlerFunc(h.tipoRankUF)))
	mux.Handle("GET /tiporank/uf/{uf}", protected(http.HandlerFunc(h.tipoRankMunicipios)))
	mux.Handle("GET /tiporank/uf/{uf}/municipio/{municipio}", protected(http.HandlerFunc(h.tipoRankMunicipio)))
	mux.Handle("POST /ariel/foto", protected(http.HandlerFunc(h.arielFoto)))
	mux.Handle("GET /simba/top/cpf/{cpf}", protected(http.HandlerFunc(h.simbaCPF)))
	mux.Handle("GET /simba/top/cnpj/{cnpj}", protected(http.HandlerFunc(h.simbaCNPJ)))
	mux.Handle("GET /yellowpages/cnpj/{cnpj}", protected(http.HandlerFunc(h.yellowPagesCNPJ)))
	mux.Handle("GET /yellowpages/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.yellowPagesRazaoSocial)))

	mux.Handle("GET /sefazml/", protected(http.HandlerFunc(h.sefazML)))
	mux.Handle("GET /sefazml/municipio/{municipio}", protected(http.HandlerFunc(h.sefazMLMunicipio)))
	mux.Handle("GET /sefazml/item/{idItem}", protected(http.HandlerFunc(h.sefazMLItem)))
	mux.Handle("GET /sefazml/topfornecedores/{top}", protected(http.HandlerFunc(h.sefazMLTopFornecedores)))
	mux.Handle("GET /sefazml/vendasfornecedor/", protected(http.HandlerFunc(h.sefazMLVendasFornecedor)))
	mux.Handle("GET /sefazml/produto/", protected(http.HandlerFunc(h.sefazMLProduto)))

	mux.Handle("GET /sadep/mandados/uf/{uf}", protected(http.HandlerFunc(h.sadepMandadosUF)))
	mux.Handle("GET /sadep/detalhamento/cpf/{cpf}", protected(http.HandlerFunc(h.sadepDetalhamentoCPF)))
	mux.Handle("GET /sadep/relatorio/mandados/uf/{uf}", protected(http.HandlerFunc(h.sadepRelatorioUF)))
	mux.Handle("GET /sadep/mandadosporuf/uf/{uf}", protected(http.HandlerFunc(h.sadepMandadosPorUF)))
	mux.Handle("GET /sadep/mandado/cpf/{cpf}", protected(http.HandlerFunc(h.sadepMandadoCPF)))
	mux.Handle("GET /sadep/geocode/endereco/{endereco}", protected(http.HandlerFunc(h.sadepGeocode)))
	mux.Handle("GET /sadep/pdfmandado/id/{id}/cookie/{cookie}", protected(http.HandlerFunc(h.sadepPDF)))

	mux.Handle("GET /relacionatipologias/{uf}", protected(http.HandlerFunc(h.relacionaTipologiaPF)))
	mux.Handle("GET /relacionatipologias/pj/{uf}", protected(http.HandlerFunc(h.relacionaTipologiaPJ)))
}

func (h Handler) writeRows(w http.ResponseWriter, rows []map[string]any, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if rows == nil {
		rows = []map[string]any{}
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: rows})
}

func (h Handler) writeCall(w http.ResponseWriter, fn func() ([]map[string]any, error)) {
	rows, err := fn()
	h.writeRows(w, rows, err)
}

func queryMap(r *http.Request) map[string]string {
	out := map[string]string{}
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			out[key] = values[0]
		}
	}
	return out
}

func readJSONMap(r *http.Request) map[string]any {
	defer r.Body.Close()
	payload := map[string]any{}
	_ = json.NewDecoder(r.Body).Decode(&payload)
	return payload
}
