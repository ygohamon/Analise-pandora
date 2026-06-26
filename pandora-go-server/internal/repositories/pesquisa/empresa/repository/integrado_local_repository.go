package empresa

import (
	"context"
	"database/sql"
)

// LocalEmpresaCNPJ retorna a aba empresa do integrado local.
func (m SQLRepository) LocalEmpresaCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return m.SimplificadoCNPJ(ctx, cnpj)
}

// LocalAtividadeEconomicaCNPJ retorna CNAEs locais vinculados ao CNPJ.
func (m SQLRepository) LocalAtividadeEconomicaCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if pj, ok := m.table("BD_RECEITA", "PJ"); ok {
		cnae, _ := m.table("BD_RECEITA", "CNAE")
		join := ""
		desc := "CAST(NULL AS varchar(255)) as descricao"
		if cnae != "" {
			join = " LEFT OUTER JOIN " + cnae + " C ON PJ.CnaeFiscal = C.CdCNAE"
			desc = "C.DsCNAE as descricao"
		}
		query := `
SELECT TOP 1000 PJ.CNPJ as cnpj, PJ.CnaeFiscal as cnae, ` + desc + `,
	'principal' as tipo, ` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + ` PJ` + join + `
WHERE PJ.CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if pj, ok := m.table("BD_RECEITANOVO", "PJ"); ok {
		query := `
SELECT TOP 1000 CNPJ as cnpj, CnaeFiscal as cnae, CAST(NULL AS varchar(255)) as descricao,
	'principal' as tipo, ` + sqlLiteral(m.sigla("BD_RECEITANOVO", "RF4")) + ` as fonte
FROM ` + pj + `
WHERE CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}
