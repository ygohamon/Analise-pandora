package pessoa

import (
	"context"
	"database/sql"
)

// LocalSISDEPENCPF consulta foto e dados prisionais SISDEPEN para as abas foto/preso.
// Chamado pelo IntegradoCPFUseCase como fonte local especifica.
func (m SQLRepository) LocalSISDEPENCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalSISDEPENSources()
	})
}

func (m pessoaIntegradoLocalModel) integradoLocalSISDEPENSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if prisional, ok := m.models.Table("SISDEPENBR", "PRISIONAL"); ok && prisional != "" {
		sources = append(sources, pessoaMapSource{
			sourceName: "sisdepen.foto",
			category:   "foto",
			query: `SELECT TOP 1000 foto as img, 'face' as tipo, ` + sqlLiteral(m.modelSigla("SISDEPENBR", "DEB")) + ` as fonte
FROM ` + prisional + `
WHERE cpf=@CPF`,
			args: oneCPFArg,
		})
	}
	if br, ok := m.models.Table("SISDEPENBR", "BR"); ok && br != "" {
		sources = append(sources, pessoaMapSource{
			sourceName: "sisdepen.preso",
			category:   "preso",
			query: `SELECT TOP 1000 *, ` + sqlLiteral(m.modelSigla("SISDEPENBR", "DEB")) + ` as fonte
FROM ` + br + `
WHERE cpf=@CPF`,
			args: func(cpf string) []any { return []any{sql.Named("CPF", cpf)} },
		})
	}
	if sis, ok := m.models.Table("SISDEPEN", "SIS"); ok && sis != "" {
		sources = append(sources, pessoaMapSource{
			sourceName: "sisdepen.sis",
			category:   "preso",
			query: `SELECT TOP 1000 *, ` + sqlLiteral(m.modelSigla("SISDEPEN", "DEP")) + ` as fonte
FROM ` + sis + `
WHERE cpf=@CPF`,
			args: func(cpf string) []any { return []any{sql.Named("CPF", cpf)} },
		})
	}
	return sources
}
