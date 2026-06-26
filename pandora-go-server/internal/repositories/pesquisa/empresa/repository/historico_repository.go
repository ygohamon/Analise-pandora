package empresa

import (
	"context"
	"database/sql"
)

// LocalHistoricoQuadroSocietarioCNPJ retorna historico societario por CNPJ.
func (m SQLRepository) LocalHistoricoQuadroSocietarioCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if proc, ok := m.table("CNE", "HISTORICO_PARTICIPACAO_PJ_EM_SOCIEDADES"); ok {
		rows, err := rowsToMaps(m.db.QueryContext(ctx, "EXEC "+proc+" @CNPJ", sql.Named("CNPJ", cnpj)))
		if err == nil {
			for _, row := range rows {
				row["tipo"] = "pj-pj"
				row["fonte"] = m.sigla("CNE", "CNE")
			}
			out = append(out, rows...)
		}
	}
	if proc, ok := m.table("CNE", "HISTORICO_SOCIOS_PF_E_PJ_EMPRESAS"); ok {
		rows, err := rowsToMaps(m.db.QueryContext(ctx, "EXEC "+proc+" @CNPJ", sql.Named("CNPJ", cnpj)))
		if err == nil {
			for _, row := range rows {
				row["tipo"] = "pj-pf"
				row["fonte"] = m.sigla("CNE", "CNE")
			}
			out = append(out, rows...)
		}
	}
	bdRows, err := m.historicoBDReceita(ctx, cnpj)
	if err == nil {
		out = append(out, bdRows...)
	}
	return out, nil
}

func (m SQLRepository) historicoBDReceita(ctx context.Context, cnpj string) ([]map[string]any, error) {
	socio, ok := m.table("BD_RECEITA", "SOCIO_HISTORICO")
	if !ok {
		return []map[string]any{}, nil
	}
	pj, _ := m.table("BD_RECEITA", "PJ")
	qual, _ := m.table("BD_RECEITA", "QUALIFICACAO_RESPONSAVEL")
	joinPJ := ""
	joinQual := ""
	if pj != "" {
		joinPJ = " LEFT OUTER JOIN " + pj + " PJ ON S.NUM_CNPJ_EMPRESA = PJ.CNPJ"
	}
	if qual != "" {
		joinQual = " LEFT OUTER JOIN " + qual + " Q ON S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio"
	}
	out := []map[string]any{}
	queryPF := `
SELECT TOP 1000
	S.NUM_CNPJ_EMPRESA as empresa_cnpj,
	PJ.RazaoSocial as empresa_razaoSocial,
	PJ.NomeFantasia as empresa_nomeFantasia,
	PJ.DataInicioAtividade as dataInicioAtividade,
	PJ.CpfResponsavel as cpfResponsavel,
	PJ.NomeResponsavel as nomeResponsavel,
	S.NUM_CPF as cpf,
	S.NOME as nome,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital,
	S.DATA_ENTRADA_SOCIEDADE as dataEntradaSociedade,
	S.DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade,
	Q.nm_qualificacao_responsavel_socio as vinculo,
	'pj-pf' as tipo,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S` + joinPJ + joinQual + `
WHERE S.IND_TIPO='PF' AND S.NUM_CNPJ_EMPRESA=@CNPJ`
	rows, err := rowsToMaps(m.db.QueryContext(ctx, queryPF, sql.Named("CNPJ", cnpj)))
	if err != nil {
		return out, err
	}
	out = append(out, rows...)
	queryPJ := `
SELECT TOP 1000
	S.NUM_CNPJ_EMPRESA as empresa_cnpj,
	PJ.RazaoSocial as empresa_razaoSocial,
	PJ.NomeFantasia as empresa_nomeFantasia,
	PJ.DataInicioAtividade as dataInicioAtividade,
	PJ.CpfResponsavel as cpfResponsavel,
	PJ.NomeResponsavel as nomeResponsavel,
	S.NUM_CNPJ as cnpj,
	S.NOME as razaoSocial,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital,
	S.DATA_ENTRADA_SOCIEDADE as dataEntradaSociedade,
	S.DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade,
	Q.nm_qualificacao_responsavel_socio as vinculo,
	'pj-pj' as tipo,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S` + joinPJ + joinQual + `
WHERE S.IND_TIPO='PJ' AND S.NUM_CNPJ_EMPRESA=@CNPJ`
	rows, err = rowsToMaps(m.db.QueryContext(ctx, queryPJ, sql.Named("CNPJ", cnpj)))
	if err != nil {
		return out, err
	}
	out = append(out, rows...)
	return out, nil
}
