package empresa

import (
	"context"
	"database/sql"
)

// LocalSocioPFCNPJ retorna socios pessoa fisica da empresa.
func (m SQLRepository) LocalSocioPFCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return m.sociosPorTipo(ctx, cnpj, "PF")
}

// LocalSocioPJCNPJ retorna socios pessoa juridica da empresa.
func (m SQLRepository) LocalSocioPJCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return m.sociosPorTipo(ctx, cnpj, "PJ")
}

func (m SQLRepository) sociosPorTipo(ctx context.Context, cnpj string, tipo string) ([]map[string]any, error) {
	socio, ok := m.table("BD_RECEITA", "SOCIO_HISTORICO")
	if !ok {
		return []map[string]any{}, nil
	}
	qual, _ := m.table("BD_RECEITA", "QUALIFICACAO_RESPONSAVEL")
	joinQual := ""
	vinculo := "CAST(NULL AS varchar(255)) as vinculo"
	if qual != "" {
		joinQual = " LEFT OUTER JOIN " + qual + " Q ON S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio"
		vinculo = "Q.nm_qualificacao_responsavel_socio as vinculo"
	}
	docSelect := "S.NUM_CPF as cpf, CAST(NULL AS varchar(14)) as cnpjSocio, CAST(NULL AS varchar(14)) as socioCnpj"
	whereTipo := "S.IND_TIPO='PF'"
	if tipo == "PJ" {
		docSelect = "CAST(NULL AS varchar(11)) as cpf, S.NUM_CNPJ as cnpjSocio, S.NUM_CNPJ as socioCnpj"
		whereTipo = "S.IND_TIPO='PJ'"
	}
	query := `
SELECT TOP 1000
	S.NUM_CNPJ_EMPRESA as cnpj,
	S.NOME as nome,
	CASE WHEN S.IND_TIPO='PJ' THEN S.NOME ELSE NULL END as razaoSocial,
	` + docSelect + `,
	CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
	CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as percCapital,
	` + vinculo + `,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S` + joinQual + `
WHERE S.NUM_CNPJ_EMPRESA=@CNPJ AND ` + whereTipo
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}
