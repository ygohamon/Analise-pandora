package empresa

import "pandora-go-server/internal/mappers"

// dedupeRows remove repeticoes sem considerar fonte/rank, igual ao fluxo simplificado de pessoa.
func dedupeRows(rows []map[string]any) []map[string]any {
	items := make([]any, 0, len(rows))
	for _, row := range rows {
		items = append(items, row)
	}
	deduped := mappers.DedupeAnyRows(items)
	out := make([]map[string]any, 0, len(deduped))
	for _, item := range deduped {
		if row, ok := item.(map[string]any); ok {
			out = append(out, row)
		}
	}
	return out
}
