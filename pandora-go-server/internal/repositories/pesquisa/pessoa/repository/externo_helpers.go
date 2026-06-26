package pessoa

import (
	"fmt"
	"strings"

	"pandora-go-server/internal/mappers"
)

func nonZeroYear(value any) any {
	text := strings.TrimSpace(fmt.Sprint(value))
	if text == "" || text == "0" || text == "0000" || text == "<nil>" {
		return nil
	}
	return value
}

func firstChars(value any, size int) string {
	text := strings.TrimSpace(fmt.Sprint(value))
	if len(text) < size {
		return ""
	}
	return text[:size]
}

func asMap(value any) map[string]any {
	return mappers.AsMap(value)
}

func arrayOfMaps(value any) []map[string]any {
	return mappers.ArrayOfMaps(value)
}

func cleanMap(row map[string]any) map[string]any {
	return mappers.CleanMap(row)
}

func firstMapValue(row map[string]any, keys ...string) any {
	return mappers.FirstMapValue(row, keys...)
}

func dddFromPhone(phone string) string {
	digits := normalizeDocument(phone)
	if len(digits) >= 10 {
		return digits[:2]
	}
	return ""
}

func modelVar(vars map[string]any, key string) string {
	if vars == nil {
		return ""
	}
	return strings.TrimSpace(fmt.Sprint(vars[key]))
}
