package mappers

import (
	"fmt"
	"strings"
)

// ReceitaFederalEmpresaRows mapeia Receita online CNPJ para a aba empresa.
func ReceitaFederalEmpresaRows(payload map[string]any, fonte string) []map[string]any {
	row := CleanMap(map[string]any{
		"cnpj":                  payload["cnpj"],
		"razaoSocial":           payload["nomeEmpresarial"],
		"nomeFantasia":          payload["nomeFantasia"],
		"dataNascimento":        payload["dataNascimento"],
		"logradouro":            strings.TrimSpace(fmt.Sprintf("%v %v, n° %v", payload["tipoLogradouro"], payload["logradouro"], payload["numeroLogradouro"])),
		"complemento":           payload["complemento"],
		"bairro":                payload["bairro"],
		"municipio":             payload["nomeMunicipio"],
		"uf":                    payload["uf"],
		"cep":                   payload["cep"],
		"telefone":              strings.TrimSpace(fmt.Sprintf("(%v) %v", payload["ddD1"], payload["telefone1"])),
		"email":                 payload["email"],
		"cpfResponsavel":        payload["cpfResponsavel"],
		"nomeResponsavel":       payload["nomeResponsavel"],
		"cnaePrincipal":         payload["cnaePrincipal"],
		"dataAbertura":          payload["dataAbertura"],
		"situacaoCadastral":     payload["situacaoCadastral"],
		"dataSituacaoCadastral": payload["dataSituacaoCadastral"],
		"naturezaJuridica":      payload["naturezaJuridica"],
		"fonte":                 fonte,
		"rank":                  0,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}
