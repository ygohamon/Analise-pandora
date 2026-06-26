package empresa

import (
	"context"
	"fmt"
	"strings"

	jusbrasilapi "pandora-go-server/internal/integrations/jusbrasil"
	receitaapi "pandora-go-server/internal/integrations/receitaonline"
	tcuapi "pandora-go-server/internal/integrations/tcu"
	tjspapi "pandora-go-server/internal/integrations/tjsp"
	transparenciaapi "pandora-go-server/internal/integrations/transparencia"
	"pandora-go-server/internal/mappers"
)

// ReceitaExternoCNPJ consulta Receita online e retorna a aba empresa.
// Chamado pelo IntegradoEmpresaUseCase no fluxo externo.
func (m SQLRepository) ReceitaExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("RECEITA_FEDERAL_API")
	if !ok || !model.Ativado {
		return out, nil
	}
	payload, err := receitaapi.NewClient(model).ConsultarCNPJ(ctx, cnpj)
	if err != nil || payload == nil {
		return out, err
	}
	out["empresa"] = append(out["empresa"], mappers.ReceitaFederalEmpresaRows(payload, m.sigla("RECEITA_FEDERAL_API", "RFBON"))...)
	return out, nil
}

// SocioReceitaExternoCNPJ consulta socios da Receita online para historico societario.
// Chamado pelo IntegradoEmpresaUseCase no fluxo externo.
func (m SQLRepository) SocioReceitaExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("RECEITA_FEDERAL_API")
	if !ok || !model.Ativado {
		return out, nil
	}
	payload, err := receitaapi.NewClient(model).ConsultarCNPJ(ctx, cnpj)
	if err != nil || payload == nil {
		return out, err
	}
	out["historico_quadro_societario"] = append(out["historico_quadro_societario"], mappers.ReceitaFederalSocioRows(payload, m.sigla("RECEITA_FEDERAL_API", "RFBON"))...)
	return out, nil
}

// TransparenciaExternoCNPJ agrupa fontes do Portal da Transparencia por CNPJ.
func (m SQLRepository) TransparenciaExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("TRANSPARENCIA_CRAWLERS")
	if !ok || !model.Ativado {
		return out, nil
	}
	client := transparenciaapi.NewClient(model)
	if rows, err := client.GetArray(ctx, "api-de-dados/pessoa-juridica", map[string]string{"cnpj": cnpj}); err != nil {
		return out, err
	} else {
		out["empresa"] = append(out["empresa"], mappers.TransparenciaPessoaJuridicaRows(rows, cnpj)...)
	}
	if rows, err := client.GetArray(ctx, "api-de-dados/contratos/cpf-cnpj", map[string]string{"cpfCnpj": cnpj, "pagina": "1"}); err != nil {
		return out, err
	} else {
		out["contrato"] = append(out["contrato"], mappers.TransparenciaContratoRows(rows, cnpj)...)
	}
	if rows, err := client.GetArray(ctx, "api-de-dados/cartoes", map[string]string{"cpfCnpjFavorecido": cnpj, "pagina": "1"}); err != nil {
		return out, err
	} else {
		out["cartao_governo_federal"] = append(out["cartao_governo_federal"], mappers.TransparenciaCartaoRows(rows, cnpj)...)
	}
	if rows, err := client.GetArray(ctx, "api-de-dados/notas-fiscais", map[string]string{"cnpjEmitente": cnpj, "pagina": "1"}); err != nil {
		return out, err
	} else {
		out["nota_fiscal"] = append(out["nota_fiscal"], mappers.TransparenciaNotaFiscalRows(rows, cnpj)...)
	}
	for _, item := range []struct {
		endpoint string
		tipo     string
	}{
		{endpoint: "api-de-dados/renuncias-fiscais-empresas-habilitadas-beneficios-fiscais", tipo: "renuncia_beneficio_fiscal"},
		{endpoint: "api-de-dados/renuncias-fiscais-empresas-imunes-isentas", tipo: "renuncia_imune_isenta"},
		{endpoint: "api-de-dados/renuncias-valor", tipo: "renuncia_valor"},
	} {
		rows, err := client.GetArray(ctx, item.endpoint, map[string]string{"cnpj": cnpj, "pagina": "1"})
		if err != nil {
			return out, err
		}
		out["renuncia_fiscal"] = append(out["renuncia_fiscal"], mappers.TransparenciaRenunciaRows(rows, cnpj, item.tipo)...)
	}
	for _, item := range []struct {
		path  string
		query map[string]string
		tipo  string
	}{
		{path: "api-de-dados/acordos-leniencia", query: map[string]string{"cnpjSancionado": cnpj}, tipo: "acordo_leniencia"},
		{path: "api-de-dados/cnep", query: map[string]string{"codigoSancionado": cnpj}, tipo: "cnep"},
		{path: "api-de-dados/cepim", query: map[string]string{"cnpjSancionado": cnpj}, tipo: "cepim"},
		{path: "api-de-dados/ceis", query: map[string]string{"codigoSancionado": cnpj}, tipo: "ceis"},
	} {
		rows, err := client.GetArray(ctx, item.path, item.query)
		if err != nil {
			return out, err
		}
		out["processo"] = append(out["processo"], mappers.TransparenciaRows(rows, item.tipo)...)
	}
	return out, nil
}

// TCUExternoCNPJ agrupa acordaos/processos TCU por CNPJ na aba processo.
// Chamado pelo IntegradoEmpresaUseCase quando fontes abertas estiverem liberadas.
func (m SQLRepository) TCUExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("TCU_CRAWLERS")
	if !ok || !model.Ativado {
		return out, nil
	}
	client := tcuapi.NewClient(model)
	documento := formatCNPJ(cnpj)
	if rows, err := client.DocumentosResumidos(ctx, "acordao-completo", documento); err != nil {
		return out, err
	} else {
		out["processo"] = append(out["processo"], mappers.TCURows(rows, "acordao", m.sigla("TCU_CRAWLERS", "TCU"))...)
	}
	if rows, err := client.DocumentosResumidos(ctx, "processo", documento); err != nil {
		return out, err
	} else {
		out["processo"] = append(out["processo"], mappers.TCURows(rows, "processo", m.sigla("TCU_CRAWLERS", "TCU"))...)
	}
	if rows, err := client.Condenacoes(ctx, cnpj); err != nil {
		return out, err
	} else {
		out["processo"] = append(out["processo"], mappers.TCURows(rows, "condenacao", m.sigla("TCU_CRAWLERS", "TCU"))...)
	}
	return out, nil
}

// TJSPExternoCNPJ consulta processos CAEX/TJSP por CNPJ para a aba processo.
func (m SQLRepository) TJSPExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("WEBSERVICE_CAEX")
	if !ok || !model.Ativado {
		return out, nil
	}
	rows, err := tjspapi.NewClient(model).Processos(ctx, "cnpj", cnpj)
	if err != nil {
		return out, err
	}
	out["processo"] = append(out["processo"], mappers.TJSPProcessoRows(rows, model.Sigla)...)
	return out, nil
}

// JusbrasilExternoCNPJ respeita perfil Jusbrasil e retorna grupos judiciais externos.
func (m SQLRepository) JusbrasilExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := emptyEmpresaGroups()
	model, ok := m.models.Get("API_JUSBRASIL")
	if !ok || !model.Ativado {
		return out, nil
	}
	client := jusbrasilapi.NewClient(model)
	for _, item := range []struct {
		path string
		tipo string
	}{
		{path: "/background-check/lawsuits/criminal", tipo: "processos_criminais"},
		{path: "/background-check/lawsuits/civil", tipo: "processos_civis"},
		{path: "/background-check/lawsuits/labor", tipo: "processos_trabalhistas"},
	} {
		payload, err := client.Lawsuits(ctx, item.path, cnpj)
		if err != nil {
			return out, err
		}
		out["processo"] = append(out["processo"], mappers.JusbrasilLawsuitRows(payload, item.tipo)...)
	}
	for _, item := range []struct {
		path       string
		collection string
		category   string
		tipo       string
	}{
		{path: "/background-check/mp", collection: "mp", category: "processo", tipo: "jusbrasil_mp"},
		{path: "/background-check/bnmp", collection: "mandados", category: "mandado", tipo: "jusbrasil_bnmp"},
		{path: "/background-check/empregador-irregular", collection: "empregadores", category: "empregador", tipo: "jusbrasil_empregador_irregular"},
	} {
		payload, err := client.Simple(ctx, item.path, cnpj)
		if err != nil {
			return out, err
		}
		out[item.category] = append(out[item.category], mappers.JusbrasilSimpleRows(payload, item.collection, item.tipo)...)
	}
	return out, nil
}

func emptyEmpresaGroups() map[string][]map[string]any {
	return map[string][]map[string]any{}
}

func formatCNPJ(cnpj string) string {
	digits := strings.TrimSpace(cnpj)
	if len(digits) != 14 {
		return digits
	}
	return fmt.Sprintf("%s.%s.%s/%s-%s", digits[0:2], digits[2:5], digits[5:8], digits[8:12], digits[12:14])
}
