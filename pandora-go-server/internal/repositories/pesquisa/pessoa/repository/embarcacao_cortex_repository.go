package pessoa

import (
	"context"
	"net/url"
)

// consultaCortexEmbarcacaoCPF consulta embarcacoes Cortex para a aba embarcacao.
func (m pessoaIntegradoExternoModel) consultaCortexEmbarcacaoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	if cx.baseVeiculos == "" {
		return nil, nil
	}
	lista, err := cx.client.Get(ctx, cx.baseVeiculos+"/embarcacoes/idfProprietario/"+cpf, cpfUsuario)
	if err != nil || lista == nil {
		return nil, err
	}
	out := []map[string]any{}
	for _, item := range arrayOfMaps(lista) {
		inscricao := cleanText(item["numeroInscricaoEmbarcacao"])
		detalhes := []map[string]any{item}
		if inscricao != "" {
			if detalhe, err := cx.client.Get(ctx, cx.baseVeiculos+"/embarcacoes/numeroInscricao/"+url.PathEscape(inscricao), cpfUsuario); err == nil && detalhe != nil {
				detalhes = arrayOfMaps(detalhe)
			}
		}
		for _, dado := range detalhes {
			row := cleanMap(map[string]any{
				"cpf":            cpf,
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
				"fonte":          cx.sigla,
				"rank":           0,
			})
			if len(row) > 3 {
				out = append(out, row)
			}
		}
	}
	return out, nil
}
