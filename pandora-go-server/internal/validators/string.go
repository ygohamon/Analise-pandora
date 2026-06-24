package validators

import (
	"net/mail"
	"strings"
)

func Required(value string) bool {
	return strings.TrimSpace(value) != ""
}

func MinWords(value string, min int) bool {
	fields := strings.Fields(value)
	return len(fields) >= min
}

func ValidEmail(value string) bool {
	_, err := mail.ParseAddress(strings.TrimSpace(value))
	return err == nil
}
