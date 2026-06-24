package empresa

import (
	"context"
	"database/sql"
	"strings"
)

// LocalFilialCNPJ consulta filiais locais da Receita Nova para a aba filial.
func (m SQLRepository) LocalFilialCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	pj, ok := m.table("BD_RECEITANOVO", "PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla("BD_RECEITANOVO", "RF4")) + ` as fonte
FROM ` + pj + `
WHERE CNPJ_Matriz=@CNPJ OR CNPJ=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}

// LocalEmpenhoCNPJ consulta empenhos SAGRES municipais e estaduais por CNPJ.
func (m SQLRepository) LocalEmpenhoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, key := range []string{"SM_EMPENHOS_PAGOS", "SE_EMPENHOS_PAGOS"} {
		table, ok := m.table("BD_SAGRES", key)
		if !ok || table == "" {
			continue
		}
		query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla("BD_SAGRES", "TCEPB")) + ` as fonte
FROM ` + table + `
WHERE CNPJ=@CNPJ OR cpf_cnpj=@CNPJ OR CredorDocumento=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

// LocalEmpregadorCNPJ consulta estatisticas RAIS e empregados por CNPJ.
func (m SQLRepository) LocalEmpregadorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	rais, ok := m.table("BD_RAIS", "RAIS")
	if !ok {
		return []map[string]any{}, nil
	}
	out := []map[string]any{}
	statsQuery := `
WITH BASE AS (
	SELECT
		ANO_RAIS as ano,
		CO_CNPJ_CEI as cnpj,
		CO_CPF as cpf,
		` + salarioAnualRAIS() + ` as salarioAnual,
		` + mesesTrabalhadosRAIS() + ` as mesesTrabalhados
	FROM ` + rais + `
	WHERE CO_CNPJ_CEI=@CNPJ
), BASE_MEDIA AS (
	SELECT
		ano,
		cnpj,
		cpf,
		salarioAnual,
		mesesTrabalhados,
		CASE WHEN mesesTrabalhados = 0 THEN 0 ELSE salarioAnual / mesesTrabalhados END as mediaSalarial
	FROM BASE
)
SELECT TOP 1000
	ano,
	MIN(cnpj) as cnpj,
	COUNT(*) as qtdVinculos,
	SUM(salarioAnual) as folhaAnual,
	AVG(CAST(mesesTrabalhados AS FLOAT)) as mediaMesesTrabalhados,
	AVG(mediaSalarial) as mediaSalarial,
	MIN(NULLIF(mediaSalarial, 0)) as menorMediaSalarial,
	MAX(mediaSalarial) as maiorMediaSalarial,
	` + sqlLiteral(m.sigla("BD_RAIS", "RAIS")) + ` as fonte
FROM BASE_MEDIA
GROUP BY ano
ORDER BY ano`
	if rows, err := rowsToMaps(m.db.QueryContext(ctx, statsQuery, sql.Named("CNPJ", cnpj))); err == nil {
		out = append(out, rows...)
	} else {
		return out, err
	}
	empregadosQuery := `
SELECT TOP 1000
	MAX(CO_CPF) as cpf,
	NO_PARTIC_RAIS as nome,
	MAX(CO_PIS) as pis,
	MAX(DA_NASCIMENTO_RAIS_DMA_ORIG) as dataNascimento,
	CONCAT(MAX(CO_CTPS_NUMERO), '-', MAX(CO_CTPS_SERIE)) as ctps,
	MAX(DA_ADMISSAO_RAIS_DMA_ORIG) as dataAdmissao,
	MAX(DA_DESLIGAMENTO_RAIS_DM) as dataDesligamento,
	MAX(QT_HORA_SEMANA_RAIS) as qtdHorasSemana,
	MAX(ANO_RAIS) as ano,
	'colaborador' as tipo,
	` + sqlLiteral(m.sigla("BD_RAIS", "RAIS")) + ` as fonte
FROM ` + rais + `
WHERE CO_CNPJ_CEI=@CNPJ
GROUP BY NO_PARTIC_RAIS
ORDER BY nome`
	rows, err := rowsToMaps(m.db.QueryContext(ctx, empregadosQuery, sql.Named("CNPJ", cnpj)))
	if err != nil {
		return out, err
	}
	out = append(out, rows...)
	return out, nil
}

func salarioAnualRAIS() string {
	cols := []string{
		"VA_REMUNERACAO_JAN_RAIS", "VA_REMUNERACAO_FEV_RAIS", "VA_REMUNERACAO_MAR_RAIS",
		"VA_REMUNERACAO_ABR_RAIS", "VA_REMUNERACAO_MAI_RAIS", "VA_REMUNERACAO_JUN_RAIS",
		"VA_REMUNERACAO_JUL_RAIS", "VA_REMUNERACAO_AGO_RAIS", "VA_REMUNERACAO_SET_RAIS",
		"VA_REMUNERACAO_OUT_RAIS", "VA_REMUNERACAO_NOV_RAIS", "VA_REMUNERACAO_DEZ_RAIS",
		"VA_13SA", "VA_13SF",
	}
	parts := []string{}
	for _, col := range cols {
		parts = append(parts, "ISNULL(TRY_CAST(REPLACE("+col+", ',', '.') AS FLOAT), 0)")
	}
	return strings.Join(parts, " + ")
}

func mesesTrabalhadosRAIS() string {
	cols := []string{
		"VA_REMUNERACAO_JAN_RAIS", "VA_REMUNERACAO_FEV_RAIS", "VA_REMUNERACAO_MAR_RAIS",
		"VA_REMUNERACAO_ABR_RAIS", "VA_REMUNERACAO_MAI_RAIS", "VA_REMUNERACAO_JUN_RAIS",
		"VA_REMUNERACAO_JUL_RAIS", "VA_REMUNERACAO_AGO_RAIS", "VA_REMUNERACAO_SET_RAIS",
		"VA_REMUNERACAO_OUT_RAIS", "VA_REMUNERACAO_NOV_RAIS", "VA_REMUNERACAO_DEZ_RAIS",
	}
	parts := []string{}
	for _, col := range cols {
		parts = append(parts, "CASE WHEN ISNULL(TRY_CAST(REPLACE("+col+", ',', '.') AS FLOAT), 0) <> 0 THEN 1 ELSE 0 END")
	}
	return strings.Join(parts, " + ")
}

// LocalTipologiaCNPJ consulta matrizes de tipologia PJ.
func (m SQLRepository) LocalTipologiaCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, model := range []string{"BD_TIPOLOGIAS", "TIPOLOGIAS", "BD_TIPOLOGIAS_TCE"} {
		table, ok := m.table(model, "PJ")
		if !ok || table == "" {
			continue
		}
		query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla(model, "TIPO")) + ` as fonte
FROM ` + table + `
WHERE CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if lic, ok := m.table("BD_TIPOLOGIAS_TCE", "LICITACOES"); ok {
		query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla("BD_TIPOLOGIAS_TCE", "TCESP")) + ` as fonte
FROM ` + lic + `
WHERE CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

// LocalOperacaoCNPJ consulta operacoes GAECO quando a base estiver configurada.
func (m SQLRepository) LocalOperacaoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	alvos, ok := m.table("BD_GAECO", "ALVOS_PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	operacoes, _ := m.table("BD_GAECO", "OPERACOES")
	join := ""
	selectOperacao := "CAST(NULL AS varchar(255)) as nomeOperacao, CAST(NULL AS date) as dataOperacao"
	if operacoes != "" {
		join = " LEFT OUTER JOIN " + operacoes + " O ON A.ID_OPERACAO = O.ID"
		selectOperacao = "O.OPERACAO as nomeOperacao, O.DATA as dataOperacao"
	}
	query := `SELECT TOP 1000 ` + selectOperacao + `, A.DOCUMENTO as cnpj, ` + sqlLiteral(m.sigla("BD_GAECO", "GAECO")) + ` as fonte
FROM ` + alvos + ` A` + join + `
WHERE A.DOCUMENTO=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}

// LocalProcessoCNPJ consulta condenacoes/CEIS locais e deixa TJSP externo no client proprio.
func (m SQLRepository) LocalProcessoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	ceis, ok := m.table("BD_CONDENACOES", "CEIS")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla("BD_CONDENACOES", "CEIS")) + ` as fonte
FROM ` + ceis + `
WHERE CNPJ=@CNPJ OR CPF_CNPJ=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}

// LocalImovelCNPJ consulta DOI ja existente e ITBI por CNPJ.
func (m SQLRepository) LocalImovelCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if rows, err := m.localDOICNPJ(ctx, cnpj); err == nil {
		out = append(out, rows...)
	}
	if fn, ok := m.table("BD_PREFEITURA", "FUNCAO_BD_STAR"); ok {
		query := `SELECT TOP 1000 proprietarioAnterior, cpfCnPJAnterior, nome, cpfCnpj,
	tipoLogradouro, logradouro, numero, bloco, apto, bairro, cep,
	natureza, transacao, valorMercado, valorAvaliacao, areaPrivTotal, valorMetro,
	dtAvaliacao, dtLancamento, fonte
FROM ` + fn + `(@CNPJ)
ORDER BY proprietarioAnterior, dtLancamento`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

func (m SQLRepository) localDOICNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	doi, ok := m.table("BD_DOI", "DOI")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `SELECT TOP 1000 *, 'BD_DOI' as fonte
FROM ` + doi + `
WHERE CPF_CNPJ_ADQUIRENTE=@CNPJ OR CPF_CNPJ_ALIENANTE=@CNPJ OR CNPJ_CARTORIO=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}

// LocalEleitoralCNPJ consulta doacoes e fornecedores eleitorais por CNPJ.
func (m SQLRepository) LocalEleitoralCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, key := range []string{"VW_TSE_DOACOES_FEITAS_PESSOAS", "VW_TSE_FORNECEDORES_CANDIDATO"} {
		table, ok := m.table("ELEITORAL", key)
		if !ok || table == "" {
			continue
		}
		query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla("ELEITORAL", "TSE")) + ` as fonte
FROM ` + table + `
WHERE cpf=@CNPJ OR cnpj=@CNPJ OR documento=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

// LocalAjuntaCNPJ consulta bases AJUNTA e AJUNTA MPVirtual por CNPJ.
func (m SQLRepository) LocalAjuntaCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, cfg := range []struct{ model, key string }{{"BD_AJUNTA", "PJ"}, {"BD_AJUNTA_MPVIRTUAL", "PJ"}} {
		table, ok := m.table(cfg.model, cfg.key)
		if !ok || table == "" {
			continue
		}
		query := `SELECT TOP 1000 *, ` + sqlLiteral(m.sigla(cfg.model, "AJUNTA")) + ` as fonte
FROM ` + table + `
WHERE nu_CNPJ=@CNPJ OR CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}

// LocalCartorioCNPJ consulta atos cartorarios por CNPJ.
func (m SQLRepository) LocalCartorioCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	table, ok := m.table("BD_CARTORIOS", "BD_ATOS_CARTORIOS_BR_JP_CPF_CNPJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `SELECT TOP 1000 Data_Ato as data_ato, Tipo_Ato_Natureza_e_Valor as tipo_ato_natureza_e_valor,
	Cartorio as cartorio, Municipio_UF as municipio_uf, Livro as livro, Folha as folha,
	Nome_Parte as nome_parte, CPF_CNPJ_Parte as cpf_cnpj_parte, Qualidade as qualidade,
	num_Partes as num_partes, num_Atos as num_atos, ` + sqlLiteral(m.sigla("BD_CARTORIOS", "CART")) + ` as fonte
FROM ` + table + `
WHERE CPF_CNPJ_Parte=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}
