package utils

import (
	"database/sql"
	"strings"
)

func NilIfBlank(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func SQLStringPtr(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return NilIfBlank(value.String)
}

func SQLDatePtr(value sql.NullTime) *string {
	if !value.Valid {
		return nil
	}
	formatted := value.Time.Format("2006-01-02")
	return &formatted
}

func SQLBoolPtr(value sql.NullBool) *bool {
	if !value.Valid {
		return nil
	}
	return &value.Bool
}

func UpperSexo(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	switch strings.TrimSpace(value.String) {
	case "1", "M", "MASCULINO":
		v := "MASCULINO"
		return &v
	case "2", "F", "FEMININO":
		v := "FEMININO"
		return &v
	default:
		return NilIfBlank(value.String)
	}
}
