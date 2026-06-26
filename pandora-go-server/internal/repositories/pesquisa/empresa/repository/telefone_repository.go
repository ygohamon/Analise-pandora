package empresa

import (
	"context"
	"database/sql"
)

// LocalTelefoneCNPJ retorna telefones locais da empresa para a aba telefone.
func (m SQLRepository) LocalTelefoneCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if pj, ok := m.table("BD_RECEITA", "PJ"); ok {
		query := `
SELECT TOP 1000 CNPJ as cnpj, TRIM(RazaoSocial) as nome,
	CAST(NULL AS varchar(8)) as ddd, DddTelefone1 as telefone,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + `
WHERE CNPJ=@CNPJ AND DddTelefone1 IS NOT NULL AND DddTelefone1 <> ''
UNION ALL
SELECT TOP 1000 CNPJ as cnpj, TRIM(RazaoSocial) as nome,
	CAST(NULL AS varchar(8)) as ddd, DddTelefone2 as telefone,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + `
WHERE CNPJ=@CNPJ AND DddTelefone2 IS NOT NULL AND DddTelefone2 <> ''`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if tel, ok := m.table("BD_TELEFONE", "TELEFONE"); ok {
		query := `
SELECT TOP 1000 cpf_cnpj as cnpj, CAST(NULL AS varchar(255)) as nome,
	CAST(NULL AS varchar(8)) as ddd, telefone, fonte
FROM ` + tel + `
WHERE cpf_cnpj=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}
