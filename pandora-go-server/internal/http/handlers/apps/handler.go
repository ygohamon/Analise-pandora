package apps

import (
	"net/http"

	"pandora-go-server/internal/auth"
	"pandora-go-server/internal/middleware"
)

func (h Handler) integraCadastro(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.IntegraCadastro(r.Context(), readJSONMap(r)) })
}

func (h Handler) integraPromotorias(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.IntegraPromotorias(r.Context(), r.PathValue("promotoria"))
	})
}

func (h Handler) integraDemandas(w http.ResponseWriter, r *http.Request) {
	payload := readJSONMap(r)
	email, _ := payload["email"].(string)
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.IntegraDemandas(r.Context(), email) })
}

func (h Handler) cacaFantasmasOrgao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.CacaFantasmasOrgao(r.Context(), r.PathValue("orgao")) })
}

func (h Handler) cacaFantasmasAnalise(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.CacaFantasmasAnalise(r.Context(), r.PathValue("cdugestora"), queryMap(r))
	})
}

func (h Handler) dnaCNPJ(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.DNACNPJ(r.Context(), r.PathValue("cnpj")) })
}

func (h Handler) painelCovidUF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.PainelCovidUF(r.Context(), r.PathValue("uf")) })
}

func (h Handler) inpOrgao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.INPOrgao(r.Context(), queryMap(r)) })
}

func (h Handler) inpCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.INPCPF(r.Context(), r.URL.Query().Get("cpf")) })
}

func (h Handler) mapaConsumo(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.MapaConsumo(r.Context(), queryMap(r)) })
}

func (h Handler) relacionamentosLista(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Relacionamentos(r.Context(), "lista", r.PathValue("lista"), queryMap(r))
	})
}

func (h Handler) relacionamentosPessoa(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Relacionamentos(r.Context(), "pessoa", "", queryMap(r))
	})
}

func (h Handler) relacionamentosTelefone(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Relacionamentos(r.Context(), "telefone", "", queryMap(r))
	})
}

func (h Handler) relacionamentosEmpresa(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Relacionamentos(r.Context(), "empresa", "", queryMap(r))
	})
}

func (h Handler) relacionamentosOrgao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Relacionamentos(r.Context(), "orgao", "", queryMap(r)) })
}

func (h Handler) relacionamentosEndereco(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Relacionamentos(r.Context(), "endereco", "", queryMap(r))
	})
}

func (h Handler) faccoesLista(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "lista", "") })
}

func (h Handler) faccoesFaccionadoCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "cpf", r.PathValue("cpf")) })
}

func (h Handler) faccoesFaccionadoDepenCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "depen_cpf", r.PathValue("cpf")) })
}

func (h Handler) faccoesFaccionadoRG(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "rg", r.PathValue("rg")) })
}

func (h Handler) faccoesFaccionadoDepenRG(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "depen_rg", r.PathValue("rg")) })
}

func (h Handler) faccoesFaccionadoNome(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "nome", r.PathValue("nome")) })
}

func (h Handler) faccoesFaccionadoDepenNome(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "depen_nome", r.PathValue("nome"))
	})
}

func (h Handler) faccoesFaccionadoNomeMae(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "nomemae", r.PathValue("nomemae"))
	})
}

func (h Handler) faccoesFaccionadoDepenNomeMae(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "depen_nomemae", r.PathValue("nomemae"))
	})
}

func (h Handler) faccoesFaccionadoNomePai(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "nomepai", r.PathValue("nomepai"))
	})
}

func (h Handler) faccoesFaccionadoDepenNomePai(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "depen_nomepai", r.PathValue("nomepai"))
	})
}

func (h Handler) faccoesFaccionadoAlcunha(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Faccoes(r.Context(), "alcunha", r.PathValue("alcunha"))
	})
}

func (h Handler) faccoesImagensCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "imagens", r.PathValue("cpf")) })
}

func (h Handler) faccoesImagensDepenCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "imagens", r.PathValue("cpf")) })
}

func (h Handler) faccoesMembros(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "membros", r.PathValue("id")) })
}

func (h Handler) faccoesSemValidacao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "semvalidacao", "") })
}

func (h Handler) faccionadosSemValidacao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Faccoes(r.Context(), "faccionados_semvalidacao", "") })
}

func (h Handler) faccoesCriaFaccao(w http.ResponseWriter, r *http.Request) {
	payload := readJSONMap(r)
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "create_faccao", "", currentUserID(r), payload)
	})
}

func (h Handler) faccoesCriaFaccionado(w http.ResponseWriter, r *http.Request) {
	payload := readJSONMap(r)
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "create_faccionado", "", currentUserID(r), payload)
	})
}

func (h Handler) faccoesValidaFaccao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "validate_faccao", r.PathValue("idFaccao"), currentUserID(r), nil)
	})
}

func (h Handler) faccoesRejeitaFaccao(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "reject_faccao", r.PathValue("idFaccao"), currentUserID(r), nil)
	})
}

func (h Handler) faccoesValidaFaccionado(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "validate_faccionado", r.PathValue("idFaccionado"), currentUserID(r), nil)
	})
}

func (h Handler) faccoesRejeitaFaccionado(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.FaccoesMutation(r.Context(), "reject_faccionado", r.PathValue("idFaccionado"), currentUserID(r), nil)
	})
}

func (h Handler) tipoRankUF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.TipoRankUF(r.Context()) })
}

func (h Handler) tipoRankMunicipios(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.TipoRankMunicipio(r.Context(), r.PathValue("uf"), r.URL.Query().Get("municipio"))
	})
}

func (h Handler) tipoRankMunicipio(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.TipoRankMunicipio(r.Context(), r.PathValue("uf"), r.PathValue("municipio"))
	})
}

func (h Handler) arielFoto(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.ArielFoto(r.Context(), readJSONMap(r)) })
}

func (h Handler) simbaCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.SimbaTop(r.Context(), "cpf", r.PathValue("cpf")) })
}

func (h Handler) simbaCNPJ(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.SimbaTop(r.Context(), "cnpj", r.PathValue("cnpj")) })
}

func (h Handler) yellowPagesCNPJ(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.YellowPages(r.Context(), "cnpj", r.PathValue("cnpj")) })
}

func (h Handler) yellowPagesRazaoSocial(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.YellowPages(r.Context(), "razaosocial", r.PathValue("razaosocial"))
	})
}

func (h Handler) sefazML(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.SefazML(r.Context(), "", "", queryMap(r)) })
}

func (h Handler) sefazMLMunicipio(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.SefazML(r.Context(), "municipio", r.PathValue("municipio"), queryMap(r))
	})
}

func (h Handler) sefazMLItem(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.SefazML(r.Context(), "item", r.PathValue("idItem"), queryMap(r))
	})
}

func (h Handler) sefazMLTopFornecedores(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.SefazML(r.Context(), "topfornecedores", r.PathValue("top"), queryMap(r))
	})
}

func (h Handler) sefazMLVendasFornecedor(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.SefazML(r.Context(), "vendasfornecedor", "", queryMap(r))
	})
}

func (h Handler) sefazMLProduto(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.SefazML(r.Context(), "produto", "", queryMap(r)) })
}

func (h Handler) sadepMandadosUF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "uf", r.PathValue("uf")) })
}

func (h Handler) sadepDetalhamentoCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.Sadep(r.Context(), "detalhamento_cpf", r.PathValue("cpf"))
	})
}

func (h Handler) sadepRelatorioUF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "relatorio_uf", r.PathValue("uf")) })
}

func (h Handler) sadepMandadosPorUF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "mandadosporuf", r.PathValue("uf")) })
}

func (h Handler) sadepMandadoCPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "mandado_cpf", r.PathValue("cpf")) })
}

func (h Handler) sadepGeocode(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "geocode", r.PathValue("endereco")) })
}

func (h Handler) sadepPDF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) { return h.apps.Sadep(r.Context(), "pdf", r.PathValue("id")) })
}

func (h Handler) relacionaTipologiaPF(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.RelacionaTipologia(r.Context(), false, r.PathValue("uf"))
	})
}

func (h Handler) relacionaTipologiaPJ(w http.ResponseWriter, r *http.Request) {
	h.writeCall(w, func() ([]map[string]any, error) {
		return h.apps.RelacionaTipologia(r.Context(), true, r.PathValue("uf"))
	})
}

func currentUserID(r *http.Request) int64 {
	id := auth.UserIDFromClaims(middleware.ClaimsFromContext(r.Context()))
	var out int64
	for _, ch := range id {
		if ch < '0' || ch > '9' {
			return 0
		}
		out = out*10 + int64(ch-'0')
	}
	return out
}
