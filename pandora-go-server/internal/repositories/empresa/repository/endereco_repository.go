package empresa

import (
	"context"
	"database/sql"
)

// LocalEnderecoCNPJ retorna enderecos locais da empresa para a aba endereco.
func (m SQLRepository) LocalEnderecoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, source := range []struct {
		model string
		table string
	}{
		{"BD_RECEITA", "PJ"},
		{"BD_RECEITANOVO", "PJ"},
		{"BD_RECEITAFULL", "PJ"},
	} {
		table, ok := m.table(source.model, source.table)
		if !ok {
			continue
		}
		query := `
SELECT TOP 1000
	CNPJ as cnpj, TRIM(RazaoSocial) as nome, TRIM(TipoLogradouro) as tipoLogradouro,
	TRIM(Logradouro) as logradouro, NumeroLogradouro as numero, TRIM(Complemento) as complemento,
	TRIM(Bairro) as bairro, TRIM(CEP) as cep, TRIM(Municipio) as municipio, TRIM(UF) as uf,
	` + sqlLiteral(m.sigla(source.model, source.model)) + ` as fonte
FROM ` + table + `
WHERE CNPJ=@CNPJ`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out, nil
}
