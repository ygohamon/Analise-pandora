package empresa

import (
	"context"
	"database/sql"
)

// LocalRIFCNPJ retorna indicador RIF quando o perfil permite a consulta.
func (m SQLRepository) LocalRIFCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	investigados, ok := m.table("BD_RIF", "INVESTIGADOS")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1 CPF_CNPJ as cnpj, COUNT(*) as qtd, 'BD_RIF' as fonte
FROM ` + investigados + `
WHERE CPF_CNPJ=@CNPJ
GROUP BY CPF_CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}
