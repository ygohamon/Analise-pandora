package empresa

import (
	"context"
	"database/sql"
)

// TelefonesPorRazaoSocial consulta telefones de empresas por texto de razao social.
func (m SQLRepository) TelefonesPorRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000 CNPJ as cnpj, TRIM(RazaoSocial) as razaoSocial,
	CAST(NULL AS varchar(8)) as ddd, DddTelefone1 as telefone,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + `
WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL) AND DddTelefone1 IS NOT NULL AND DddTelefone1 <> ''
UNION ALL
SELECT TOP 1000 CNPJ as cnpj, TRIM(RazaoSocial) as razaoSocial,
	CAST(NULL AS varchar(8)) as ddd, DddTelefone2 as telefone,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pj + `
WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL) AND DddTelefone2 IS NOT NULL AND DddTelefone2 <> ''`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("RAZAOSOCIAL", textSearch(razaoSocial))))
}

// TelefonesPorTelefone consulta proprietarios PJ a partir do numero informado.
func (m SQLRepository) TelefonesPorTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	rows, err := m.SimplificadoTelefone(ctx, telefone)
	if err != nil {
		return nil, err
	}
	out := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		item := map[string]any{}
		for key, value := range row {
			item[key] = value
		}
		item["telefone"] = telefone
		out = append(out, item)
	}
	return out, nil
}
