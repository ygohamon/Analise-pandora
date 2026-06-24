package pessoa

import (
	"context"

	jusbrasilapi "pandora-go-server/internal/integrations/jusbrasil"
	seeuapi "pandora-go-server/internal/integrations/seeu"
	tjspapi "pandora-go-server/internal/integrations/tjsp"
	transparenciaapi "pandora-go-server/internal/integrations/transparencia"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/modelconfig"
)

// ExternoTJSPCPF consulta processos CAEX/TJSP por CPF para a aba processo.
// Chamado pelo IntegradoCPFUseCase no fluxo externo.
func (m SQLRepository) ExternoTJSPCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	model, ok := m.models.Get("WEBSERVICE_CAEX")
	if !ok || !model.Ativado {
		return []map[string]any{}, nil
	}
	rows, err := tjspapi.NewClient(model).Processos(ctx, "cpf", cpf)
	if err != nil {
		return nil, err
	}
	return mappers.TJSPProcessoRows(rows, model.Sigla), nil
}

// ExternoTransparenciaServidorCPF consulta servidor federal e retorna aba empregador.
// Chamado pelo IntegradoCPFUseCase quando fontes abertas estiverem liberadas.
func (m SQLRepository) ExternoTransparenciaServidorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	model, ok := m.models.Get("TRANSPARENCIA_CRAWLERS")
	if !ok || !model.Ativado {
		return []map[string]any{}, nil
	}
	rows, err := transparenciaapi.NewClient(model).GetArray(ctx, "api-de-dados/servidores", map[string]string{"cpf": cpf})
	if err != nil {
		return nil, err
	}
	return mappers.TransparenciaServidorRows(rows, cpf), nil
}

// ExternoTransparenciaCPF consulta fontes abertas JSON do Portal da Transparencia.
// Chamado pelo IntegradoCPFUseCase para pessoa, PEP, viagens, contratos, cartoes, beneficios e sancoes.
func (m SQLRepository) ExternoTransparenciaCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	model, ok := m.models.Get("TRANSPARENCIA_CRAWLERS")
	if !ok || !model.Ativado {
		return []SourceResult{}, nil
	}
	client := transparenciaapi.NewClient(model)
	out := []SourceResult{}
	add := func(name, category string, rows []map[string]any, err error) {
		out = append(out, SourceResult{Name: name, Category: category, Rows: rows, Err: err})
	}
	rows, err := client.GetArray(ctx, "api-de-dados/pessoa-fisica", map[string]string{"cpf": cpf})
	add("transparencia.pessoa_fisica", "pessoa", mappers.TransparenciaPessoaFisicaRows(rows, cpf), err)
	rows, err = client.GetArray(ctx, "api-de-dados/peps", map[string]string{"cpf": cpf})
	add("transparencia.pep", "pep", mappers.TransparenciaPEPRows(rows, cpf), err)
	rows, err = client.GetArray(ctx, "api-de-dados/viagens-por-cpf", map[string]string{"cpf": cpf, "pagina": "1"})
	add("transparencia.viagem", "viagem", mappers.TransparenciaViagemRows(rows, cpf), err)
	rows, err = client.GetArray(ctx, "api-de-dados/contratos/cpf-cnpj", map[string]string{"cpfCnpj": cpf, "pagina": "1"})
	add("transparencia.contrato", "contrato", mappers.TransparenciaContratoRows(rows, cpf), err)
	rows, err = client.GetArray(ctx, "api-de-dados/cartoes", map[string]string{"cpfCnpjFavorecido": cpf, "pagina": "1"})
	add("transparencia.cartao_favorecido", "cartao_governo_federal", mappers.TransparenciaCartaoRows(rows, cpf), err)
	rows, err = client.GetArray(ctx, "api-de-dados/cartoes", map[string]string{"cpfPortador": cpf, "pagina": "1"})
	add("transparencia.cartao_portador", "cartao_governo_federal", mappers.TransparenciaCartaoRows(rows, cpf), err)
	for _, item := range []struct {
		name     string
		endpoint string
		query    map[string]string
		tipo     string
	}{
		{name: "transparencia.bpc", endpoint: "api-de-dados/bpc-por-cpf-ou-nis", query: map[string]string{"codigo": cpf}, tipo: "bpc"},
		{name: "transparencia.auxilio_emergencial", endpoint: "api-de-dados/auxilio-emergencial-por-cpf-ou-nis", query: map[string]string{"codigoBeneficiario": cpf}, tipo: "auxilio_emergencial"},
		{name: "transparencia.seguro_defeso", endpoint: "api-de-dados/seguro-defeso-codigo", query: map[string]string{"codigo": cpf}, tipo: "seguro_defeso"},
		{name: "transparencia.garantia_safra", endpoint: "api-de-dados/safra-codigo-por-cpf-ou-nis", query: map[string]string{"codigo": cpf}, tipo: "garantia_safra"},
		{name: "transparencia.peti", endpoint: "api-de-dados/peti-por-cpf-ou-nis", query: map[string]string{"codigo": cpf}, tipo: "peti"},
	} {
		rows, err = client.GetArray(ctx, item.endpoint, item.query)
		add(item.name, "beneficio", mappers.TransparenciaBeneficioRows(rows, item.tipo), err)
	}
	for _, item := range []struct {
		name     string
		endpoint string
		query    map[string]string
		tipo     string
	}{
		{name: "transparencia.cnep", endpoint: "api-de-dados/cnep", query: map[string]string{"codigoSancionado": cpf}, tipo: "cnep"},
		{name: "transparencia.ceaf", endpoint: "api-de-dados/ceaf", query: map[string]string{"cpfSancionado": cpf}, tipo: "ceaf"},
		{name: "transparencia.ceis", endpoint: "api-de-dados/ceis", query: map[string]string{"codigoSancionado": cpf}, tipo: "ceis"},
	} {
		rows, err = client.GetArray(ctx, item.endpoint, item.query)
		add(item.name, "processo", mappers.TransparenciaRows(rows, item.tipo), err)
	}
	return out, nil
}

// ExternoJusbrasilCPF respeita o perfil Jusbrasil e retorna fontes judiciais externas.
// Chamado pelo IntegradoCPFUseCase para preencher processos e mandados.
func (m SQLRepository) ExternoJusbrasilCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	out := []SourceResult{}
	model, ok := m.models.Get("API_JUSBRASIL")
	if ok && model.Ativado {
		client := jusbrasilapi.NewClient(model)
		for _, item := range []struct {
			name string
			path string
			tipo string
		}{
			{name: "jusbrasil.processos_criminais", path: "/background-check/lawsuits/criminal", tipo: "processos_criminais"},
			{name: "jusbrasil.processos_civis", path: "/background-check/lawsuits/civil", tipo: "processos_civis"},
			{name: "jusbrasil.processos_trabalhistas", path: "/background-check/lawsuits/labor", tipo: "processos_trabalhistas"},
		} {
			payload, err := client.Lawsuits(ctx, item.path, cpf)
			out = append(out, SourceResult{Name: item.name, Category: "processo", Rows: mappers.JusbrasilLawsuitRows(payload, item.tipo), Err: err})
		}
		for _, item := range []struct {
			name       string
			path       string
			collection string
			category   string
			tipo       string
		}{
			{name: "jusbrasil.mp", path: "/background-check/mp", collection: "mp", category: "processo", tipo: "jusbrasil_mp"},
			{name: "jusbrasil.bnmp", path: "/background-check/bnmp", collection: "mandados", category: "mandado", tipo: "jusbrasil_bnmp"},
			{name: "jusbrasil.empregador_irregular", path: "/background-check/empregador-irregular", collection: "empregadores", category: "empregador", tipo: "jusbrasil_empregador_irregular"},
		} {
			payload, err := client.Simple(ctx, item.path, cpf)
			out = append(out, SourceResult{Name: item.name, Category: item.category, Rows: mappers.JusbrasilSimpleRows(payload, item.collection, item.tipo), Err: err})
		}
	}
	if legacy := modelForLegacyJusbrasil(m); legacy.Ativado {
		rows, err := jusbrasilapi.NewClient(legacy).BNMPMandados(ctx, "CPF", cpf)
		out = append(out, SourceResult{Name: "jusbrasil.bnmp.mandado", Category: "mandado", Rows: mappers.JusbrasilBNMPMandadoRows(rows), Err: err})
	}
	return out, nil
}

func modelForLegacyJusbrasil(m SQLRepository) modelconfig.Model {
	if model, ok := m.models.Get("WEBSERVICE_JUSBRASIL"); ok && model.Ativado {
		return model
	}
	return modelconfig.Model{}
}

// ExternoSEEUCPF respeita o perfil SEEU e retorna processo/sentenciado por CPF.
// Chamado pelo IntegradoCPFUseCase apenas quando o perfil habilita SEEU.
func (m SQLRepository) ExternoSEEUCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	model, ok := m.models.Get("WEBSERVICE_SEEU")
	if !ok || !model.Ativado {
		return []SourceResult{}, nil
	}
	nome := ""
	if pessoas, err := m.SimplificadoCPF(ctx, cpf); err == nil && len(pessoas) > 0 {
		if pessoas[0].Nome != nil {
			nome = *pessoas[0].Nome
		}
	}
	if nome == "" {
		return []SourceResult{}, nil
	}
	rows, err := seeuapi.NewClient(model).ListarSentenciadoPorFiltro(ctx, nome, cpf)
	if err != nil {
		return nil, err
	}
	return []SourceResult{
		{Name: "seeu.pessoa", Category: "processo", Rows: mappers.SEEURows(rows, "processo", model.Sigla)},
		{Name: "seeu.sentenciado", Category: "sentenciado", Rows: mappers.SEEURows(rows, "sentenciado", model.Sigla)},
	}, nil
}
