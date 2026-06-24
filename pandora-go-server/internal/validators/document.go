package validators

import "pandora-go-server/internal/utils"

func ValidCPF(value string) bool {
	cpf := utils.NormalizeCPF(value)
	if len(cpf) != 11 {
		return false
	}

	digits := make([]int, 11)
	for i, r := range cpf {
		digits[i] = int(r - '0')
	}

	allEqual := true
	for i := 1; i < len(digits); i++ {
		if digits[i] != digits[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return false
	}

	sum := 0
	for i := 0; i < 9; i++ {
		sum += digits[i] * (10 - i)
	}
	check := 11 - (sum % 11)
	if check >= 10 {
		check = 0
	}
	if digits[9] != check {
		return false
	}

	sum = 0
	for i := 0; i < 10; i++ {
		sum += digits[i] * (11 - i)
	}
	check = 11 - (sum % 11)
	if check >= 10 {
		check = 0
	}
	return digits[10] == check
}

func ValidCNPJ(value string) bool {
	cnpj := utils.NormalizeCNPJ(value)
	if len(cnpj) != 14 {
		return false
	}

	digits := make([]int, 14)
	for i, r := range cnpj {
		digits[i] = int(r - '0')
	}

	allEqual := true
	for i := 1; i < len(digits); i++ {
		if digits[i] != digits[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return false
	}

	weightsA := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	weightsB := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	return cnpjCheckDigit(digits[:12], weightsA) == digits[12] &&
		cnpjCheckDigit(digits[:13], weightsB) == digits[13]
}

func cnpjCheckDigit(digits []int, weights []int) int {
	sum := 0
	for i, digit := range digits {
		sum += digit * weights[i]
	}
	remainder := sum % 11
	if remainder < 2 {
		return 0
	}
	return 11 - remainder
}
