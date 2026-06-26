package pessoa

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"pandora-go-server/internal/types"
)

// pessoaMapSource descreve uma consulta especifica reaproveitada pelo integrado local.
type pessoaMapSource struct {
	sourceName string
	category   string
	query      string
	args       func(string) []any
	run        func(context.Context, string) ([]map[string]any, error)
	timeout    time.Duration
	normalize  func([]map[string]any) []map[string]any
}

// SimplificadoCPF reaproveita as mesmas fontes basicas usadas pela aba pessoa do integrado.

func (m pessoaStore) queryMaps(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	return rowsToMaps(m.db.QueryContext(ctx, query, args...))
}

func pessoasToAny(rows []types.PessoaSimplificada) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}

func mapsToAny(rows []map[string]any) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}

func collectPessoaRows(ctx context.Context, cpf string, fns ...func(context.Context, string) ([]types.PessoaSimplificada, error)) []types.PessoaSimplificada {
	out := []types.PessoaSimplificada{}
	for _, fn := range fns {
		rows, err := fn(ctx, cpf)
		if err == nil {
			out = append(out, rows...)
		}
	}
	return out
}

func oneCPFArg(cpf string) []any {
	return []any{sql.Named("CPF", cpf)}
}

func cpf14Arg(cpf string) []any {
	return []any{sql.Named("CPF14", "000"+cpf)}
}

func onlyDigits(value string) string {
	var b strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func textSearch(value string) string {
	parts := strings.Fields(strings.TrimSpace(value))
	if len(parts) == 0 {
		return value
	}
	return `"` + strings.Join(parts, "*\" AND \"") + `*"`
}
