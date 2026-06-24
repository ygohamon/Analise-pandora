package empresa

import (
	"context"
	"database/sql"
)

// LocalVirtualCNPJ retorna emails e contatos virtuais vinculados ao CNPJ.
func (m SQLRepository) LocalVirtualCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	if pj, ok := m.table("BD_RECEITA", "PJ"); ok {
		query := `
SELECT DISTINCT TOP 1000 CNPJ as cnpj, LOWER(CorreioEletronico) as email, 'email' as tipo,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + `
WHERE CNPJ=@CNPJ AND CorreioEletronico IS NOT NULL AND CorreioEletronico <> ''`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	if email, ok := m.table("BD_VIRTUAL", "EMAIL"); ok {
		query := `
SELECT DISTINCT TOP 1000 CPF_CNPJ as cnpj, LOWER(EMAIL) as email, 'email' as tipo, fonte
FROM ` + email + `
WHERE CPF_CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}
