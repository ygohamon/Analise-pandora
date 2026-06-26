package pessoa

import "context"

// VeiculosPorCPF consulta veiculos por CPF para rotas especificas e reuso futuro do integrado.
func (m SQLRepository) VeiculosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	if m.db == nil {
		return nil, nil
	}
	return m.integradoLocalModel().veiculosPorCPF(ctx, cpf)
}

func (m pessoaIntegradoLocalModel) veiculosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	out := []map[string]any{}
	var firstErr error
	for _, source := range m.integradoLocalVehicleSources() {
		rows, err := m.queryMaps(ctx, source.query, source.args(cpf)...)
		if err != nil {
			if firstErr == nil {
				firstErr = err
			}
			continue
		}
		out = append(out, rows...)
	}
	if len(out) > 0 {
		return out, nil
	}
	return nil, firstErr
}

func (m pessoaIntegradoLocalModel) integradoLocalVehicleSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if veiculo, ok := m.models.Table("BD_DETRAN", "VEICULO"); ok && veiculo != "" {
		pf, _ := m.models.Table("BD_RECEITA", "PF")
		joinPF := ""
		nomeSelect := "CAST(NULL AS varchar(255)) as nome"
		if pf != "" {
			joinPF = " LEFT OUTER JOIN " + pf + " PF ON V.CPF_CNPJ = PF.CPF"
			nomeSelect = "PF.Nome as nome"
		}
		sources = append(sources, pessoaMapSource{
			category: "veiculo",
			query: `
SELECT TOP 1000 V.cpf_cnpj as cpf, ` + nomeSelect + `,
	V.Placa as placa, V.Chassi as chassi, V.Renavam as renavam,
	V.Ano_Fabricacao as anoFab, V.Ano_Modelo as anoMod, V.Municipio as municipio,
	'PB' as uf, V.Tipo_Veiculo as tipo, V.Marca_Modelo as marcaModelo, V.Cor as cor,
	V.Especie as especie, V.Combustivel as combustivel, TRY_CAST(V.Ultima_Atualizacao AS DATE) as dataAtualizacao,
	V.RESTRICAO_1 as restricao_1, V.RESTRICAO_2 as restricao_2, V.RESTRICAO_3 as restricao_3, V.RESTRICAO_4 as restricao_4,
	'completo' as tipoDado, V.Ano_Licenciamento as anoRegistro, 'BD_DETRAN' as fonte
FROM ` + veiculo + ` V` + joinPF + `
WHERE V.cpf_cnpj=@CPF`,
			args: oneCPFArg,
		})
	}
	if renavam, ok := m.models.Table("BD_RENAVAM", "RENAVAM"); ok && renavam != "" {
		sources = append(sources, pessoaMapSource{
			category: "veiculo",
			query: `
SELECT TOP 1000 IDENTIFICACAO_PROPRIETARIO as cpf, NOME_PROPRIETARIO as nome,
	IDENTIFICACAO_VEICULO as chassi, PLACA_VEICULO as placa, NUMERO_RENAVAM as renavam,
	DS_SITUACAO as situacao, NM_MUNICIPIO as municipio, UNIDADE_FEDERACAO_JURISDICAO_VEICULO as uf,
	DS_CODIGO_TIPO_VEICULO as tipo, DS_MARCA_MODELO as marcaModelo, DS_COR as cor,
	ANO_FABRICACAO_VEICULO as anoFab, ANO_MODELO_VEICULO as anoMod,
	NOME_PROPRIETARIO as proprietario, NOME_POSSUIDO as possuidor,
	TRY_CONVERT(DATE, DATA_ATUALIZACAO_VEICULO, 103) as dataAtualizacao,
	DS_RESTRICAO1 as restricao_1, DS_RESTRICAO2 as restricao_2, DS_RESTRICAO3 as restricao_3, DS_RESTRICAO4 as restricao_4,
	'completo' as tipoDado, YEAR(TRY_CONVERT(DATE, DATA_ATUALIZACAO_VEICULO, 103)) as anoRegistro,
	'BD_RENAVAM' as fonte
FROM ` + renavam + `
WHERE IDENTIFICACAO_PROPRIETARIO=@CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
