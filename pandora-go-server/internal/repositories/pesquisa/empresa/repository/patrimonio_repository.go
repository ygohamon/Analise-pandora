package empresa

import (
	"context"
	"database/sql"
)

// LocalVeiculoCNPJ retorna veiculos vinculados ao CNPJ.
func (m SQLRepository) LocalVeiculoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if veiculo, ok := m.table("BD_DETRAN", "VEICULO"); ok {
		query := `
SELECT TOP 1000 V.cpf_cnpj as cnpj, CAST(NULL AS varchar(255)) as nome,
	V.Placa as placa, V.Chassi as chassi, V.Renavam as renavam,
	V.Ano_Fabricacao as anoFab, V.Ano_Modelo as anoMod, V.Municipio as municipio,
	'PB' as uf, V.Tipo_Veiculo as tipo, V.Marca_Modelo as marcaModelo, V.Cor as cor,
	V.Especie as especie, V.Combustivel as combustivel, TRY_CAST(V.Ultima_Atualizacao AS DATE) as dataAtualizacao,
	V.RESTRICAO_1 as restricao_1, V.RESTRICAO_2 as restricao_2, V.RESTRICAO_3 as restricao_3, V.RESTRICAO_4 as restricao_4,
	'completo' as tipoDado, V.Ano_Licenciamento as anoRegistro, 'BD_DETRAN' as fonte
FROM ` + veiculo + ` V
WHERE V.cpf_cnpj=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if renavam, ok := m.table("BD_RENAVAM", "RENAVAM"); ok {
		query := `
SELECT TOP 1000 IDENTIFICACAO_PROPRIETARIO as cnpj, NOME_PROPRIETARIO as nome,
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
WHERE IDENTIFICACAO_PROPRIETARIO=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

// LocalAeronaveCNPJ retorna aeronaves vinculadas ao CNPJ.
func (m SQLRepository) LocalAeronaveCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	rab, ok := m.table("BD_RAB", "RAB")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000
	CASE WHEN CPF_CNPJ = @CNPJ THEN 'proprietario' WHEN CPF_CNPJ2 = @CNPJ THEN 'operador' ELSE NULL END as tipo,
	PROPRIETARIO as proprietario,
	OUTROS_PROPRIETARIOS as outros_proprietarios,
	UF as uf,
	CPF_CNPJ as cpf_cnpj,
	CPF_CNPJ2 as cpf_cnpj2,
	OPERADOR as operador,
	OUTROS_OPERADORES as outros_operadores,
	UF_OPERADOR as uf_operador,
	MARCA as marca,
	MATRICULA as matricula,
	DT_MATRICULA as dt_matricula,
	NUM_SERIE as num_serie,
	CATEGORIA as categoria,
	CD_TIPO as cd_tipo,
	MODELO as modelo,
	NOME_FABRICANTE as fabricante,
	CLASSE as classe,
	PMD as pmd,
	NR_TRIPULACAO_MIN as tripulacao_min,
	NR_PASSAGEIROS_MAX as passageiros_max,
	ASSENTOS as assentos,
	ANO_FABRICACAO as ano_fabricacao,
	VAL_SEG as dt_seg,
	VAL_CA as val_ca,
	DATA_CANC as dt_can,
	MOTIVO as motivo,
	CD_INTERDICAO as cd_interdicao,
	MARCA_NAC1 as marca_nac_1,
	MARCA_NAC2 as marca_nac_2,
	MARCA_NAC3 as marca_nac_3,
	MARCA_EST as marca_est,
	DESCRICAO_GRAVAME as descricao_gravame,
	` + sqlLiteral(m.sigla("BD_RAB", "RAB")) + ` as fonte
FROM ` + rab + `
WHERE CPF_CNPJ=@CNPJ OR CPF_CNPJ2=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}

// LocalEmbarcacaoCNPJ retorna embarcacoes e notas fiscais nauticas vinculadas ao CNPJ.
func (m SQLRepository) LocalEmbarcacaoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if embarcacoes, ok := m.table("BD_EMBARCACOES", "EMBARCACOES"); ok {
		fonte := sqlLiteral(m.modelVar("BD_EMBARCACOES", "FONTE_EMB", m.sigla("BD_EMBARCACOES", "EMB")))
		query := `
SELECT TOP 1000
	TRIM(CPF_CNPJ) as cpfCnpj,
	NOME_PESSOA as nome,
	TIPO_PESSOA_FISICA_JURIDICA as tipoPessoa,
	DS_NOME_EMBARCACAO as embarcacao,
	TIPO_EMBARCACAO as descricao,
	ANO_CONSTRUCAO as anoConstrucao,
	CAST(CAST(NR_COMPRIMENTO AS money)/10000 AS FLOAT) as comprimento,
	CONSTRUTOR_CASCO as constCasco,
	NR_INSCRICAO as inscricao,
	SITUACAO_EMBARCACAO as situacao,
	DT_INSCRICAO_EMB as dataInscricao,
	DT_VALIDADE_DOC_EMB as dataValidade,
	ORGAO_INSCRICAO as orgaoInscricao,
	DS_CIDADE_ORGAO as cidadeOrgao,
	DATA_AQUISICAO as dataAquisicao,
	ULT_LOCAL_AQUISICAO_PROP_ATUAL as localAquisicao,
	CASE WHEN ULT_VALOR_AQUISICAO_PROP_ATUAL = ',00' THEN NULL ELSE CAST(CAST(ULT_VALOR_AQUISICAO_PROP_ATUAL AS money)/100 AS FLOAT) END as valor,
	ANO_MES_CARGA as dataCarga,
	` + fonte + ` as fonte
FROM ` + embarcacoes + `
WHERE CPF_CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if fisco, ok := m.table("BD_EMBARCACOES", "FISCO"); ok {
		pj, _ := m.table("BD_RECEITA", "PJ")
		joinPJ := ""
		nome := "CAST(NULL AS varchar(255)) as nome"
		if pj != "" {
			joinPJ = " LEFT OUTER JOIN " + pj + " PJ ON E.CPF_CNPJ = PJ.CNPJ"
			nome = "TRIM(PJ.RazaoSocial) as nome"
		}
		query := `
SELECT TOP 1000
	TRIM(E.CPF_CNPJ) as cpfCnpj,
	` + nome + `,
	TRIM(E.Descricao) as descricao,
	E.Valor as valor,
	E.DataEmissaNFe as dataAquisicao,
	` + sqlLiteral(m.modelVar("BD_EMBARCACOES", "FONTE_FISCO", "N1")) + ` as fonte
FROM ` + fisco + ` E` + joinPJ + `
WHERE E.CPF_CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}
