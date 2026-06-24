package mappers

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"unicode"
)

// PostProcessIntegratedGrouped consolida abas do integrado sem alterar o envelope HTTP.
// Chamado pelos fluxos local e externo antes de montar a lista final de abas.
func PostProcessIntegratedGrouped(grouped map[string][]any) {
	if rows := grouped["telefone"]; len(rows) > 0 {
		grouped["telefone"] = consolidateTelefones(rows)
	}
	if rows := grouped["endereco"]; len(rows) > 0 {
		grouped["endereco"] = consolidateEnderecos(rows)
	}
	trimGroupedStrings(grouped)
}

func consolidateTelefones(rows []any) []any {
	type group struct {
		base   map[string]any
		fontes []any
		count  int
		rank   int
	}
	groups := map[string]*group{}
	order := []string{}
	for _, item := range rows {
		row, ok := anyMap(item)
		if !ok {
			continue
		}
		ddd := NormalizeDocument(fmt.Sprint(row["ddd"]))
		telefone := NormalizeDocument(fmt.Sprint(row["telefone"]))
		if telefone == "" {
			continue
		}
		key := ddd + telefone
		rank := intValue(row["rank"], 999)
		if _, ok := groups[key]; !ok {
			copied := copyMap(row)
			groups[key] = &group{base: copied, rank: rank}
			order = append(order, key)
		}
		current := groups[key]
		current.count++
		current.fontes = appendUniqueAny(current.fontes, row["fonte"])
		if rank < current.rank {
			current.rank = rank
			current.base = copyMap(row)
		}
	}
	out := make([]any, 0, len(order))
	for _, key := range order {
		current := groups[key]
		current.base["rank"] = current.rank
		current.base["relevancia"] = current.count
		current.base["fonte"] = sortFonteList(current.fontes)
		out = append(out, current.base)
	}
	return out
}

func consolidateEnderecos(rows []any) []any {
	seen := map[string]struct{}{}
	positions := map[string]int{}
	out := []any{}
	for _, item := range rows {
		row, ok := anyMap(item)
		if !ok {
			continue
		}
		key := strings.Join([]string{
			NormalizeDocument(fmt.Sprint(FirstMapValue(row, "cpf", "cnpj"))),
			normalizeAddressPart(row["logradouro"]),
			normalizeAddressPart(row["numero"]),
			NormalizeDocument(fmt.Sprint(row["cep"])),
		}, "|")
		if _, ok := seen[key]; ok {
			idx := positions[key]
			if fonteAddressPriority(row["fonte"]) < fonteAddressPriority(out[idx].(map[string]any)["fonte"]) {
				out[idx] = row
			}
			continue
		}
		seen[key] = struct{}{}
		positions[key] = len(out)
		out = append(out, row)
	}
	return out
}

func trimGroupedStrings(grouped map[string][]any) {
	for _, rows := range grouped {
		for _, item := range rows {
			row, ok := anyMap(item)
			if !ok {
				continue
			}
			for key, value := range row {
				if text, ok := value.(string); ok {
					row[key] = strings.TrimSpace(text)
				}
			}
		}
	}
}

func normalizeAddressPart(value any) string {
	text := strings.ToUpper(strings.TrimSpace(fmt.Sprint(value)))
	builder := strings.Builder{}
	lastSpace := false
	for _, r := range text {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			builder.WriteRune(r)
			lastSpace = false
			continue
		}
		if !lastSpace {
			builder.WriteByte(' ')
			lastSpace = true
		}
	}
	return strings.Join(strings.Fields(builder.String()), " ")
}

func anyMap(value any) (map[string]any, bool) {
	row, ok := value.(map[string]any)
	return row, ok
}

func copyMap(row map[string]any) map[string]any {
	out := map[string]any{}
	for key, value := range row {
		out[key] = value
	}
	return out
}

func appendUniqueAny(values []any, value any) []any {
	if value == nil {
		return values
	}
	if nested, ok := value.([]any); ok {
		for _, item := range nested {
			values = appendUniqueAny(values, item)
		}
		return values
	}
	text := strings.TrimSpace(fmt.Sprint(value))
	if text == "" {
		return values
	}
	for _, existing := range values {
		if strings.TrimSpace(fmt.Sprint(existing)) == text {
			return values
		}
	}
	return append(values, text)
}

func sortFonteList(values []any) []any {
	out := append([]any{}, values...)
	sort.SliceStable(out, func(i, j int) bool {
		return fontePriority(out[i]) < fontePriority(out[j])
	})
	return out
}

func fontePriority(value any) int {
	text := strings.ToUpper(strings.TrimSpace(fmt.Sprint(value)))
	switch text {
	case "RF2":
		return 10
	case "RF4":
		return 20
	case "RF6":
		return 30
	case "RN1":
		return 40
	case "CORTEX":
		return 50
	case "CDLK":
		return 60
	}
	return 999
}

func fonteAddressPriority(value any) int {
	text := strings.ToUpper(strings.TrimSpace(fmt.Sprint(value)))
	switch text {
	case "RF4":
		return 10
	case "RF2":
		return 20
	case "RF6":
		return 30
	case "RN1":
		return 40
	case "CORTEX":
		return 50
	case "CDLK":
		return 60
	}
	return 999
}

func intValue(value any, fallback int) int {
	switch typed := value.(type) {
	case int:
		return typed
	case int64:
		return int(typed)
	case int32:
		return int(typed)
	case float64:
		return int(typed)
	case float32:
		return int(typed)
	case string:
		parsed, err := strconv.Atoi(strings.TrimSpace(typed))
		if err == nil {
			return parsed
		}
	}
	return fallback
}
