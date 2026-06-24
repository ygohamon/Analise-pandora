package empresa

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	cortexapi "pandora-go-server/internal/integrations/cortex"
	credlinkapi "pandora-go-server/internal/integrations/credlink"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/types"
)

// CortexExternoCNPJ consulta uma unica vez o endpoint Cortex de pessoa juridica.
func (m SQLRepository) CortexExternoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) (map[string][]map[string]any, error) {
	out := map[string][]map[string]any{}
	if !options.Cortex {
		return out, nil
	}
	model, ok := m.models.Get("WEBSERVICE_CORTEX")
	if !ok || !model.Ativado {
		return out, nil
	}
	basePessoas := strings.TrimRight(strings.TrimSpace(fmt.Sprint(model.Vars["CORTEX_URL_PESSOAS"])), "/")
	if basePessoas == "" {
		return out, nil
	}
	fonte := strings.TrimSpace(model.Sigla)
	if fonte == "" {
		fonte = "CTX"
	}
	payload, err := cortexapi.NewClient(model).Get(ctx, basePessoas+"/pessoajuridica/"+cnpj, options.CPFUsuario)
	if err != nil || payload == nil {
		return out, err
	}
	dado := mappers.AsMap(payload)
	out["empresa"] = append(out["empresa"], mappers.CortexEmpresaJuridicaRows(dado, fonte)...)
	out["endereco"] = append(out["endereco"], mappers.CortexEmpresaEnderecoRows(dado, fonte)...)
	out["telefone"] = append(out["telefone"], mappers.CortexEmpresaTelefoneRows(dado, fonte)...)
	out["historico_quadro_societario"] = append(out["historico_quadro_societario"], mappers.CortexEmpresaSocioPFRows(dado, fonte)...)
	out["contador"] = append(out["contador"], mappers.CortexEmpresaContadorRows(dado, fonte)...)
	out["atividadeeconomica"] = append(out["atividadeeconomica"], mappers.CortexEmpresaAtividadeEconomicaRows(dado, fonte)...)
	baseVeiculos := strings.TrimRight(strings.TrimSpace(fmt.Sprint(model.Vars["CORTEX_URL_VEICULOS"])), "/")
	if baseVeiculos != "" {
		client := cortexapi.NewClient(model)
		if payload, err := client.Get(ctx, baseVeiculos+"/emplacamentos/proprietario/"+cnpj, options.CPFUsuario); err == nil && payload != nil {
			out["veiculo"] = append(out["veiculo"], cortexEmpresaVeiculoRows(cnpj, payload, fonte)...)
		}
		if rows, err := cortexEmpresaEmbarcacaoRows(ctx, client, baseVeiculos, cnpj, options.CPFUsuario, fonte); err == nil {
			out["embarcacao"] = append(out["embarcacao"], rows...)
		}
	}
	return out, nil
}

// CredlinkExternoCNPJ consulta uma unica vez o endpoint completo Credlink para CNPJ.
func (m SQLRepository) CredlinkExternoCNPJ(ctx context.Context, cnpj string) (map[string][]map[string]any, error) {
	out := map[string][]map[string]any{}
	model, ok := m.models.Get("CREDLINK")
	if !ok || !model.Ativado {
		return out, nil
	}
	payload, err := credlinkapi.NewClient(model).Completo(ctx, cnpj)
	if err != nil || payload == nil {
		return out, err
	}
	out["empresa"] = append(out["empresa"], mappers.CredlinkEmpresaDetalhada(payload)...)
	out["telefone"] = append(out["telefone"], mappers.CredlinkEmpresaTelefones(payload)...)
	out["virtual"] = append(out["virtual"], mappers.CredlinkEmpresaVirtual(payload)...)
	out["endereco"] = append(out["endereco"], mappers.CredlinkEmpresaEnderecos(payload)...)
	out["veiculo"] = append(out["veiculo"], mappers.CredlinkEmpresaVeiculos(payload)...)
	out["historico_quadro_societario"] = append(out["historico_quadro_societario"], mappers.CredlinkEmpresaHistoricoSocietario(payload)...)
	out["atividadeeconomica"] = append(out["atividadeeconomica"], mappers.CredlinkEmpresaAtividadeEconomica(payload)...)
	return out, nil
}

// cortexEmpresaVeiculoRows mapeia o endpoint Cortex de veiculos para a aba veiculo por CNPJ.
func cortexEmpresaVeiculoRows(cnpj string, value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range mappers.ArrayOfMaps(value) {
		row := mappers.CleanMap(map[string]any{
			"cnpj":                        cnpj,
			"placa":                       dado["placa"],
			"chassi":                      dado["chassi"],
			"proprietario":                dado["nomeProprietario"],
			"nome":                        dado["nomeProprietario"],
			"possuidor":                   dado["nomePossuidor"],
			"tipoDocumentoFaturado":       dado["tipoDocumentoFaturado"],
			"numeroIdentificacaoFaturado": dado["numeroIdentificacaoFaturado"],
			"ufFatura":                    dado["ufFatura"],
			"numeroMotor":                 dado["numeroMotor"],
			"renavam":                     dado["renavam"],
			"anoFab":                      dado["anoFabricacao"],
			"anoMod":                      dado["anoModelo"],
			"municipio":                   dado["municipioPlaca"],
			"uf":                          dado["ufEmplacamento"],
			"tipo":                        dado["tipoVeiculo"],
			"marcaModelo":                 dado["marcaModelo"],
			"cor":                         dado["cor"],
			"especie":                     dado["especie"],
			"combustivel":                 dado["combustivel"],
			"dataAtualizacao":             dado["dataAtualizacaoVeiculo"],
			"dataInicioPosse":             dado["dataEmplacamento"],
			"ufEmplacamento":              dado["ufEmplacamento"],
			"anoRegistro":                 firstChars(dado["dataAtualizacaoVeiculo"], 4),
			"responsavel":                 dado["nomeProprietario"],
			"restricao_1":                 dado["restricaoVeiculo1"],
			"restricao_2":                 dado["restricaoVeiculo2"],
			"restricao_3":                 dado["restricaoVeiculo3"],
			"restricao_4":                 dado["restricaoVeiculo4"],
			"situacao":                    dado["situacaoVeiculo"],
			"tipoDado":                    "completo",
			"fonte":                       fonte,
			"rank":                        0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

func cortexEmpresaEmbarcacaoRows(ctx context.Context, client cortexapi.Client, baseVeiculos string, cnpj string, cpfUsuario string, fonte string) ([]map[string]any, error) {
	lista, err := client.Get(ctx, baseVeiculos+"/embarcacoes/idfProprietario/"+cnpj, cpfUsuario)
	if err != nil || lista == nil {
		return nil, err
	}
	out := []map[string]any{}
	for _, item := range mappers.ArrayOfMaps(lista) {
		inscricao := strings.TrimSpace(fmt.Sprint(item["numeroInscricaoEmbarcacao"]))
		detalhes := []map[string]any{item}
		if inscricao != "" {
			if detalhe, err := client.Get(ctx, baseVeiculos+"/embarcacoes/numeroInscricao/"+url.PathEscape(inscricao), cpfUsuario); err == nil && detalhe != nil {
				detalhes = mappers.ArrayOfMaps(detalhe)
			}
		}
		for _, dado := range detalhes {
			row := mappers.CleanMap(map[string]any{
				"cnpj":           cnpj,
				"nome":           dado["nomePessoaFisicaJuridica"],
				"cpfCnpj":        dado["identificacaoProprietario"],
				"tipoPessoa":     dado["tipoPessoaFisicaJuridica"],
				"embarcacao":     dado["nomeEmbarcacao"],
				"descricao":      dado["tipoEmbarcacao"],
				"anoConstrucao":  dado["anoContrucao"],
				"comprimento":    dado["comprimentoEmbarcacao"],
				"inscricao":      dado["numeroInscricaoEmbarcacao"],
				"situacao":       dado["situacaoEmbarcacao"],
				"dataInscricao":  dado["dataInscricaoEmbarcacao"],
				"dataValidade":   dado["dataValidadeTituloEmbarcacao"],
				"orgaoInscricao": dado["orgaoInscricao"],
				"cidadeOrgao":    dado["municipioLocalizacaoOrganizacaoMilitarMarinha"],
				"dataAquisicao":  dado["dataAquisicao"],
				"localAquisicao": dado["ultimoLocalAquisicaoProprietarioAtual"],
				"valor":          dado["ultimoValorAquisicaoProprietarioAtual"],
				"fonte":          fonte,
				"rank":           0,
			})
			if len(row) > 3 {
				out = append(out, row)
			}
		}
	}
	return out, nil
}

func firstChars(value any, size int) string {
	text := strings.TrimSpace(fmt.Sprint(value))
	if len(text) < size {
		return ""
	}
	return text[:size]
}
