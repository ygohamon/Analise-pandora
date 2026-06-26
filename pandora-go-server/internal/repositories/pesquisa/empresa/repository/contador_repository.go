package empresa

import (
	"context"
	"database/sql"
)

// LocalContadorCNPJ retorna contadores PF/PJ vinculados ao CNPJ.
func (m SQLRepository) LocalContadorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	contador, ok := m.table("BD_RECEITA", "CONTADOR")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000
	NUM_CNPJ_EMPRESA AS cnpj,
	NUM_CPF AS cpf,
	NOME AS nome,
	CASE WHEN NUM_REGISTRO_CRC = 0 THEN NULL ELSE NUM_REGISTRO_CRC END AS crc,
	CASE WHEN SIGLA_UF_CRC = '' THEN NULL ELSE SIGLA_UF_CRC END AS ufCRC,
	IND_TIPO as tipo,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + contador + `
WHERE NUM_CNPJ_EMPRESA=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}
