package pessoa

func normalizeParentescoRows(rows []map[string]any) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, cleanMap(map[string]any{
			"nivel":     firstPresent(row, "nivel", "NIVEL"),
			"categoria": firstPresent(row, "categoria", "CATEGORIA"),
			"cpf":       firstPresent(row, "cpf", "CPF2", "CPF"),
			"nome":      firstPresent(row, "nome", "NOME2", "NOME"),
			"sexo":      firstPresent(row, "sexo", "SEXO"),
			"idade":     firstPresent(row, "idade", "IDADE"),
			"municipio": firstPresent(row, "municipio", "Municipio", "MUNICIPIO"),
			"uf":        firstPresent(row, "uf", "UF"),
			"fonte":     "BD_RELACAO",
		}))
	}
	return out
}

func firstPresent(row map[string]any, keys ...string) any {
	for _, key := range keys {
		if value, ok := row[key]; ok {
			return value
		}
	}
	return nil
}

func (m pessoaIntegradoLocalModel) integradoLocalRelationshipSources() []pessoaMapSource {
	sources := m.integradoLocalParentescoSources()
	return append(sources, m.integradoLocalVizinhoSources()...)
}

func (m pessoaIntegradoLocalModel) integradoLocalParentescoSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if proc, ok := m.models.Table("BD_RELACIONAMENTO", "USP_PARENTESCOS"); ok && proc != "" {
		sources = append(sources, pessoaMapSource{
			category: "parentesco",
			query: `
EXEC ` + proc + ` @CPF, NULL, NULL`,
			args:      oneCPFArg,
			normalize: normalizeParentescoRows,
		})
	}
	return sources
}
