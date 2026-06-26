package pessoa

import (
	"fmt"
	"strconv"
	"strings"
)

// cleanText normaliza valores dinamicos para comparacoes internas de repositories.
func cleanText(value any) string {
	switch typed := value.(type) {
	case float64:
		return cleanTextString(strconv.FormatFloat(typed, 'f', -1, 64))
	case float32:
		return cleanTextString(strconv.FormatFloat(float64(typed), 'f', -1, 32))
	case int:
		return strconv.Itoa(typed)
	case int64:
		return strconv.FormatInt(typed, 10)
	case int32:
		return strconv.FormatInt(int64(typed), 10)
	case jsonNumber:
		return cleanTextString(typed.String())
	}
	return cleanTextString(fmt.Sprint(value))
}

type jsonNumber interface {
	String() string
}

func cleanTextString(value string) string {
	text := strings.TrimSpace(value)
	switch strings.ToLower(text) {
	case "", "<nil>", "null", "undefined":
		return ""
	default:
		return text
	}
}
