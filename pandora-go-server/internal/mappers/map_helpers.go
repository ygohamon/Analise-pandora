package mappers

import (
	"fmt"
	"strings"
)

// AsMap converte valores JSON dinamicos para map sem panico.
func AsMap(value any) map[string]any {
	if typed, ok := value.(map[string]any); ok {
		return typed
	}
	return map[string]any{}
}

// ArrayOfMaps normaliza objetos/arrays JSON para uma lista de mapas.
func ArrayOfMaps(value any) []map[string]any {
	switch typed := value.(type) {
	case []any:
		out := make([]map[string]any, 0, len(typed))
		for _, item := range typed {
			if mapped := AsMap(item); len(mapped) > 0 {
				out = append(out, mapped)
			}
		}
		return out
	case map[string]any:
		return []map[string]any{typed}
	default:
		return nil
	}
}

// CleanMap remove valores nulos/vazios preservando os nomes das chaves.
func CleanMap(row map[string]any) map[string]any {
	out := map[string]any{}
	for key, value := range row {
		if value == nil {
			continue
		}
		text := strings.TrimSpace(fmt.Sprint(value))
		if text == "" || text == "<nil>" || text == "null" || text == "undefined" {
			continue
		}
		out[key] = value
	}
	return out
}

// FirstMapValue retorna o primeiro valor nao vazio entre as chaves informadas.
func FirstMapValue(row map[string]any, keys ...string) any {
	for _, key := range keys {
		if value, ok := row[key]; ok && value != nil && strings.TrimSpace(fmt.Sprint(value)) != "" {
			return value
		}
	}
	return nil
}
