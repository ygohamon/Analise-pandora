package pessoa

import (
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/types"
)

func dedupePessoas(rows []types.PessoaSimplificada) []types.PessoaSimplificada {
	return mappers.DedupePessoas(rows)
}

func dedupeAnyRows(rows []any) []any {
	return mappers.DedupeAnyRows(rows)
}

func normalizeComparable(value string) string {
	return mappers.NormalizeComparable(value)
}

func normalizeDocument(value string) string {
	return mappers.NormalizeDocument(value)
}

func maskCPF(cpf string) string {
	return mappers.MaskCPF(cpf)
}
