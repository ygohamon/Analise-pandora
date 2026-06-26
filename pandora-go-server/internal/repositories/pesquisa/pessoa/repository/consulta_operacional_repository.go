package pessoa

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/types"
)

// EnderecosPorCPF reaproveita as fontes locais de endereco usadas pelo integrado.
func (m SQLRepository) EnderecosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	results, err := m.LocalEnderecoCPF(ctx, cpf)
	rows := flattenSourceRows(results)
	for _, result := range m.CortexPessoaBaseCPF(ctx, cpf, types.SearchOptions{Cortex: true}) {
		if result.Category == "endereco" && result.Err == nil {
			rows = append(rows, result.Rows...)
		}
	}
	return rows, err
}

// EmbarcacoesPorCPF reaproveita as fontes locais de patrimonio nautico usadas pelo integrado.
func (m SQLRepository) EmbarcacoesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	rows, err := m.rowsFromLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return filterSourcesByCategory(local.integradoLocalTransportPropertySources(), "embarcacao")
	})
	return rows, err
}

func (m SQLRepository) EmbarcacoesPorNome(ctx context.Context, embarcacao string) ([]map[string]any, error) {
	return m.embarcacoesPorCampo(ctx, "DS_NOME_EMBARCACAO", embarcacao, true)
}

func (m SQLRepository) EmbarcacoesPorInscricao(ctx context.Context, inscricao string) ([]map[string]any, error) {
	return m.embarcacoesPorCampo(ctx, "NR_INSCRICAO", inscricao, false)
}

// AeronavesPorCPF reaproveita as fontes locais de aeronave usadas pelo integrado.
func (m SQLRepository) AeronavesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	rows, err := m.rowsFromLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return filterSourcesByCategory(local.integradoLocalTransportPropertySources(), "aeronave")
	})
	return rows, err
}

func (m SQLRepository) AeronavesPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return m.aeronavesPorCondicao(ctx, `
WHERE PROPRIETARIO LIKE @VALOR OR OPERADOR LIKE @VALOR OR OUTROS_PROPRIETARIOS LIKE @VALOR OR OUTROS_OPERADORES LIKE @VALOR`, sql.Named("VALOR", likeValue(nome)))
}

func (m SQLRepository) AeronavesPorMatricula(ctx context.Context, matricula string) ([]map[string]any, error) {
	return m.aeronavesPorCondicao(ctx, `WHERE MATRICULA LIKE @VALOR`, sql.Named("VALOR", likeValue(matricula)))
}

// ObitosPorCPF reaproveita a fonte SISOBI local usada pela aba obito.
func (m SQLRepository) ObitosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	rows, err := m.rowsFromLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return filterSourcesByCategory(local.integradoLocalRegistrySources(), "obito")
	})
	if cortexRows, cortexErr := m.CortexObitoCPF(ctx, cpf, types.SearchOptions{Cortex: true}); cortexErr == nil {
		rows = append(rows, cortexRows...)
	}
	if credlink, credlinkErr := m.IntegradoCredlinkCompletoCPF(ctx, cpf); credlinkErr == nil && credlink != nil {
		rows = append(rows, mappers.CredlinkObitos(credlink)...)
	}
	if len(rows) > 0 {
		return rows, nil
	}
	return []map[string]any{}, err
}

func (m SQLRepository) ObitosPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	obito, ok := m.models.Table("BD_SISOBI", "OBITO")
	if !ok || obito == "" || m.db == nil {
		return []map[string]any{}, nil
	}
	query := `
SELECT DISTINCT TOP 1000 CPF as obito_cpf, FALECIDO as obito_nome, MAE as obito_nomeMae,
	DT_NASC as obito_dataNascimento, DT_OBITO as obito_dataObito,
	UPPER(MUNICIPIO) as obito_municipioServentia, UF as obito_ufServentia,
	CARTORIO as obito_nomeFantasia, NR_LIVRO as obito_livro, NR_FOLHA as obito_folha,
	NR_TERMO as obito_termo, 'BD_SISOBI' as fonte
FROM ` + obito + `
WHERE CONTAINS(FALECIDO, @NOME)`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("NOME", textSearch(nome))))
}

func (m SQLRepository) rowsFromLocalSources(ctx context.Context, value string, sources func(pessoaIntegradoLocalModel) []pessoaMapSource) ([]map[string]any, error) {
	if m.db == nil {
		return []map[string]any{}, nil
	}
	local := m.integradoLocalModel()
	out := []map[string]any{}
	var firstErr error
	for _, source := range sources(local) {
		rows, err := local.queryMaps(ctx, source.query, source.args(value)...)
		if err != nil {
			if firstErr == nil {
				firstErr = err
			}
			continue
		}
		out = append(out, rows...)
	}
	if len(out) > 0 {
		return out, nil
	}
	return []map[string]any{}, firstErr
}

func filterSourcesByCategory(sources []pessoaMapSource, category string) []pessoaMapSource {
	out := []pessoaMapSource{}
	for _, source := range sources {
		if source.category == category {
			out = append(out, source)
		}
	}
	return out
}

func flattenSourceRows(results []SourceResult) []map[string]any {
	out := []map[string]any{}
	for _, result := range results {
		for _, row := range result.Rows {
			item := map[string]any{}
			for key, value := range row {
				item[key] = value
			}
			if _, ok := item["fonte"]; !ok && result.Name != "" {
				item["fonte"] = result.Name
			}
			out = append(out, item)
		}
	}
	return out
}

func likeValue(value string) string {
	return "%" + strings.TrimSpace(value) + "%"
}
