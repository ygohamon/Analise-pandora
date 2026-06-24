package mappers

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

// DedupePessoas remove duplicidades cadastrais preservando a primeira fonte.
func DedupePessoas(rows []types.PessoaSimplificada) []types.PessoaSimplificada {
	out := make([]types.PessoaSimplificada, 0, len(rows))
	seen := map[string]struct{}{}
	for _, row := range rows {
		key := pessoaKey(row)
		if key == "" {
			out = append(out, row)
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, row)
	}
	return out
}

// DedupeAnyRows remove duplicidades de linhas dinamicas do integrado.
func DedupeAnyRows(rows []any) []any {
	out := make([]any, 0, len(rows))
	seen := map[string]struct{}{}
	for _, row := range rows {
		key := canonicalAnyKey(row)
		if key == "" {
			out = append(out, row)
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, row)
	}
	return out
}

// NormalizeComparable gera chave estavel para comparacao textual.
func NormalizeComparable(value string) string {
	value = strings.TrimSpace(strings.ToLower(value))
	value = strings.Join(strings.Fields(value), " ")
	if value == "<nil>" || value == "null" || value == "undefined" {
		return ""
	}
	return value
}

// NormalizeDocument remove mascara de documentos para comparacao.
func NormalizeDocument(value string) string {
	digits := utils.OnlyDigits(value)
	if digits == "" {
		return NormalizeComparable(value)
	}
	return digits
}

// MaskCPF oculta CPF em logs preservando o formato usado pelo servidor.
func MaskCPF(cpf string) string {
	digits := utils.OnlyDigits(cpf)
	if len(digits) != 11 {
		return "***"
	}
	return digits[:3] + ".***.***-" + digits[9:]
}

// MaskCNPJ oculta CNPJ em logs sem expor o documento completo.
func MaskCNPJ(cnpj string) string {
	digits := utils.OnlyDigits(cnpj)
	if len(digits) != 14 {
		return "***"
	}
	return digits[:2] + ".***.***/****-" + digits[12:]
}

func pessoaKey(row types.PessoaSimplificada) string {
	values := map[string]string{
		"cpf":            normalizeDocumentPtr(row.CPF),
		"nome":           normalizeComparablePtr(row.Nome),
		"nomeMae":        normalizeComparablePtr(row.NomeMae),
		"dataNascimento": normalizeComparablePtr(row.DataNascimento),
		"municipio":      normalizeComparablePtr(row.Municipio),
		"uf":             normalizeComparablePtr(row.UF),
		"sexo":           normalizeComparablePtr(row.Sexo),
	}
	return stableMapKey(values)
}

func canonicalAnyKey(value any) string {
	raw, err := json.Marshal(value)
	if err != nil {
		return fmt.Sprint(value)
	}
	var decoded any
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return string(raw)
	}
	return canonicalValueKey(decoded)
}

func canonicalValueKey(value any) string {
	switch typed := value.(type) {
	case map[string]any:
		normalized := map[string]string{}
		for key, item := range typed {
			if ignoreDedupeField(key) || item == nil {
				continue
			}
			if strings.Contains(strings.ToLower(key), "cpf") || strings.Contains(strings.ToLower(key), "cnpj") {
				normalized[key] = NormalizeDocument(fmt.Sprint(item))
			} else {
				normalized[key] = NormalizeComparable(fmt.Sprint(item))
			}
		}
		return stableMapKey(normalized)
	case []any:
		parts := make([]string, 0, len(typed))
		for _, item := range typed {
			parts = append(parts, canonicalValueKey(item))
		}
		sort.Strings(parts)
		return strings.Join(parts, "|")
	default:
		return NormalizeComparable(fmt.Sprint(typed))
	}
}

func ignoreDedupeField(key string) bool {
	switch strings.ToLower(strings.TrimSpace(key)) {
	case "fonte", "rank", "grupo", "index", "id":
		return true
	default:
		return false
	}
}

func stableMapKey(values map[string]string) string {
	keys := make([]string, 0, len(values))
	for key, value := range values {
		if strings.TrimSpace(value) != "" {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)
	if len(keys) == 0 {
		return ""
	}
	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+"="+values[key])
	}
	return strings.Join(parts, "&")
}

func normalizeComparablePtr(value *string) string {
	if value == nil {
		return ""
	}
	return NormalizeComparable(*value)
}

func normalizeDocumentPtr(value *string) string {
	if value == nil {
		return ""
	}
	return NormalizeDocument(*value)
}
