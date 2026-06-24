package utils

import "unicode"

func OnlyDigits(value string) string {
	out := make([]rune, 0, len(value))
	for _, r := range value {
		if unicode.IsDigit(r) {
			out = append(out, r)
		}
	}
	return string(out)
}

func NormalizeCPF(value string) string {
	return OnlyDigits(value)
}

func NormalizeCNPJ(value string) string {
	return OnlyDigits(value)
}
