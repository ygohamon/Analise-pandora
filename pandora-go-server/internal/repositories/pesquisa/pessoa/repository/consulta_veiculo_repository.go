package pessoa

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"pandora-go-server/internal/mappers"
)

func (m SQLRepository) VeiculosPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return m.veiculosPorCondicao(ctx, "nome", "NOME_PROPRIETARIO LIKE @VALOR", "PF.Nome LIKE @VALOR", "nome_proprietario LIKE @VALOR", sql.Named("VALOR", likeValue(nome)))
}

func (m SQLRepository) VeiculosPorChassi(ctx context.Context, chassi string) ([]map[string]any, error) {
	return m.veiculosPorCondicao(ctx, "chassi", "IDENTIFICACAO_VEICULO=@VALOR", "V.Chassi=@VALOR", "CHASSI=@VALOR", sql.Named("VALOR", strings.TrimSpace(chassi)))
}

func (m SQLRepository) VeiculosPorRenavam(ctx context.Context, renavam string) ([]map[string]any, error) {
	return m.veiculosPorCondicao(ctx, "renavam", "NUMERO_RENAVAM=@VALOR", "V.Renavam=@VALOR", "RENAVAM=@VALOR", sql.Named("VALOR", strings.TrimSpace(renavam)))
}

func (m SQLRepository) VeiculosPorPlaca(ctx context.Context, placa string) ([]map[string]any, error) {
	placa = strings.ToUpper(strings.TrimSpace(placa))
	rows, err := m.veiculosPorCondicao(ctx, "placa", "PLACA_VEICULO=@VALOR", "V.Placa=@VALOR", "PLACA=@VALOR", sql.Named("VALOR", placa))
	cortexRows, cortexErr := m.veiculosCortexPorPlaca(ctx, placa)
	if len(cortexRows) > 0 {
		rows = append(rows, cortexRows...)
	}
	if len(rows) > 0 {
		return rows, nil
	}
	if err != nil {
		return []map[string]any{}, err
	}
	return []map[string]any{}, cortexErr
}

// veiculosPorCondicao consulta Detran/Renavam para rotas especificas sem envolver o integrado.
func (m SQLRepository) veiculosPorCondicao(ctx context.Context, _ string, renavamWhere string, detranWhere string, sispesquisaWhere string, arg any) ([]map[string]any, error) {
	if m.db == nil {
		return []map[string]any{}, nil
	}
	out := []map[string]any{}
	var firstErr error
	if veiculo, ok := m.models.Table("BD_DETRAN", "VEICULO"); ok && veiculo != "" {
		pf, _ := m.models.Table("BD_RECEITA", "PF")
		joinPF := ""
		nomeSelect := "CAST(NULL AS varchar(255)) as nome"
		if pf != "" {
			joinPF = " LEFT OUTER JOIN " + pf + " PF ON V.CPF_CNPJ = PF.CPF"
			nomeSelect = "PF.Nome as nome"
		}
		query := `
SELECT TOP 1000 V.cpf_cnpj as cpf, ` + nomeSelect + `,
	V.Placa as placa, V.Chassi as chassi, V.Renavam as renavam,
	V.Ano_Fabricacao as anoFab, V.Ano_Modelo as anoMod, V.Municipio as municipio,
	'PB' as uf, V.Tipo_Veiculo as tipo, V.Marca_Modelo as marcaModelo, V.Cor as cor,
	V.Especie as especie, V.Combustivel as combustivel, TRY_CAST(V.Ultima_Atualizacao AS DATE) as dataAtualizacao,
	V.RESTRICAO_1 as restricao_1, V.RESTRICAO_2 as restricao_2, V.RESTRICAO_3 as restricao_3, V.RESTRICAO_4 as restricao_4,
	'completo' as tipoDado, V.Ano_Licenciamento as anoRegistro, ` + sqlLiteral(m.modelSigla("BD_DETRAN", "DET")) + ` as fonte
FROM ` + veiculo + ` V` + joinPF + `
WHERE ` + detranWhere
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, arg))
		if err == nil {
			out = append(out, rows...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if renavam, ok := m.models.Table("BD_RENAVAM", "RENAVAM"); ok && renavam != "" {
		query := `
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
WHERE ` + renavamWhere
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, arg))
		if err == nil {
			out = append(out, rows...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if sispesquisa, ok := m.models.Table("BD_SISPESQUISA_RENACH", "VEICULO"); ok && sispesquisa != "" {
		query := `
SELECT TOP 1000 PLACA as placa, CHASSI as chassi, TIPO_CHASSI as tipoChassi,
	RENAVAM as renavam, Ano_Fabricacao as anoFab, ANO_MOD as anoMod,
	Descricao_Tipo as tipo, Descricao_Marca_Modelo as marcaModelo,
	Categoria as especie, Especie as procedencia, COMBUSTIVEL as combustivel,
	Ultimo_Ano_Licenciamento as ultLicenciamento, Restricao_Gravame as situacao,
	Restricao_Tributaria as observacao, Restricao_Judicial as restricao,
	Restricao_Adm as restricao_, 'completo' as tipoDado,
	CASE WHEN isdate(Dt_Ultima_Atualizacao) = 1 THEN cast(Dt_Ultima_Atualizacao as date) ELSE NULL END AS dataAtualizacao,
	CPF_CNPJ_Proprietario as cpf, nome_proprietario as nome,
	` + sqlLiteral(m.modelSigla("BD_SISPESQUISA_RENACH", "DE2")) + ` as fonte
FROM ` + sispesquisa + `
WHERE ` + sispesquisaWhere
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, arg))
		if err == nil {
			out = append(out, splitVeiculoCpfCNPJ(rows)...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if len(out) > 0 {
		return out, nil
	}
	return []map[string]any{}, firstErr
}

func (m SQLRepository) veiculosCortexPorPlaca(ctx context.Context, placa string) ([]map[string]any, error) {
	ext := m.integradoExternoModel()
	cx := ext.cortexClient()
	if !cx.ok || cx.baseVeiculos == "" {
		return []map[string]any{}, nil
	}
	payload, err := cx.client.Get(ctx, cx.baseVeiculos+"/emplacamentos/placa/"+placa, "")
	return mappers.CortexVeiculoRows("", payload, cx.sigla), err
}

func splitVeiculoCpfCNPJ(rows []map[string]any) []map[string]any {
	for _, row := range rows {
		value := strings.TrimSpace(fmt.Sprint(row["cpf"]))
		if len(value) == 14 {
			row["cnpj"] = value
			delete(row, "cpf")
		}
	}
	return rows
}
