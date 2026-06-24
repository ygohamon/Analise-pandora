package mappers

import "fmt"

// CredlinkPessoa mapeia o bloco principal Credlink para a aba pessoa.
// Chamado pela consulta integrada externa depois da chamada HTTP ao Credlink.
func CredlinkPessoa(payload map[string]any) []map[string]any {
	ccf := AsMap(credlinkRoot(payload)["consulta_ccf619"])
	row := CleanMap(map[string]any{
		"cpf":                        ccf["cpf"],
		"nome":                       ccf["nome_completo"],
		"nomeMae":                    ccf["nome_mae"],
		"nomePai":                    ccf["nome_pai"],
		"rg":                         ccf["identidade"],
		"dataNascimento":             ccf["dt_nascimento"],
		"sexo":                       ccf["sexo"],
		"estadoCivil":                ccf["estadocivil"],
		"naturalidade":               ccf["pais_nascimento"],
		"estadoNascimento":           ccf["estado_nascimento"],
		"cidadeNascimento":           ccf["cidade_nascimento"],
		"statusReceita":              ccf["statusReceita"],
		"ocupacaoPrincipal":          AsMap(credlinkRoot(payload)["trabalho"])["descricaocbo"],
		"escolaridade":               credlinkRoot(payload)["escolaridade"],
		"rendapresumida":             credlinkRoot(payload)["rendapresumida"],
		"pessoaPoliticamenteExposta": credlinkRoot(payload)["pessoa_politicamente_exposta"],
		"restricaoBancaria":          AsMap(AsMap(credlinkRoot(payload)["consulta_ccf619"])["restricoes_bancarias"]),
		"infoRestricao":              ccf["info_restricao"],
		"fonte":                      "CDLK",
	})
	if len(row) <= 1 {
		return nil
	}
	return []map[string]any{row}
}

// CredlinkEnderecos mapeia enderecos Credlink para a aba endereco.
func CredlinkEnderecos(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	items := append(ArrayOfMaps(AsMap(root["consulta_telefone_proprietario"])["telefone"]), ArrayOfMaps(AsMap(root["outros_enderecos"])["endereco"])...)
	out := []map[string]any{}
	for _, item := range items {
		row := CleanMap(map[string]any{
			"cpf":         FirstMapValue(item, "cpfcnpj", "cpf"),
			"nome":        item["nome"],
			"logradouro":  FirstMapValue(item, "endereco", "logradouro"),
			"numero":      item["numero"],
			"complemento": item["complemento"],
			"bairro":      item["bairro"],
			"cep":         item["cep"],
			"municipio":   FirstMapValue(item, "cidade", "municipio"),
			"uf":          item["uf"],
			"fonte":       "CDLK",
		})
		if len(row) > 1 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkTelefones mapeia telefones Credlink para a aba telefone.
func CredlinkTelefones(payload map[string]any) []map[string]any {
	items := ArrayOfMaps(AsMap(credlinkRoot(payload)["consulta_telefone_proprietario"])["telefone"])
	out := []map[string]any{}
	for _, item := range items {
		telefone := fmt.Sprint(item["telefone"])
		row := CleanMap(map[string]any{
			"cpf":       FirstMapValue(item, "cpf", "cpfcnpj"),
			"nome":      item["nome"],
			"ddd":       dddFromPhone(telefone),
			"telefone":  telefone,
			"operadora": item["operadora"],
			"whatsapp":  item["whatsapp"],
			"fonte":     "CDLK",
		})
		if len(row) > 1 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkParentesco mapeia parentes Credlink para a aba parentesco.
func CredlinkParentesco(payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, item := range ArrayOfMaps(AsMap(credlinkRoot(payload)["parentes"])["telefone"]) {
		row := CleanMap(map[string]any{
			"categoria": FirstMapValue(item, "grau_parentesco", "categoria"),
			"cpf":       FirstMapValue(item, "cpfcnpj", "cpf"),
			"nome":      item["nome"],
			"sexo":      item["sexo"],
			"idade":     FirstMapValue(item, "nasc", "idade"),
			"municipio": FirstMapValue(item, "cidade", "municipio"),
			"uf":        item["uf"],
			"fonte":     "CDLK",
		})
		if len(row) > 1 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkVizinhos mapeia vizinhos Credlink para a aba vizinho.
func CredlinkVizinhos(payload map[string]any) []map[string]any {
	return rowsFromCredlinkArray(AsMap(credlinkRoot(payload)["vizinhos"])["telefone"], "CDLK")
}

// CredlinkEmpresas mapeia sociedades Credlink para a aba empresa.
func CredlinkEmpresas(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	return rowsFromCredlinkArray(AsMap(root["dados_sociedades"])["sociedades"], "CDLK")
}

// CredlinkVeiculos mapeia veiculos Credlink para a aba veiculo.
func CredlinkVeiculos(payload map[string]any) []map[string]any {
	return rowsFromCredlinkArray(AsMap(credlinkRoot(payload)["veiculos"])["veiculo"], "CDLK")
}

// CredlinkEmails mapeia emails Credlink para a aba virtual.
func CredlinkEmails(payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, item := range ArrayOfMaps(credlinkRoot(payload)["consulta_emails_proprietario"]) {
		email := FirstMapValue(item, "email", "emails")
		row := CleanMap(map[string]any{
			"cpf":   FirstMapValue(item, "cpf", "cpfcnpj"),
			"email": email,
			"tipo":  "email",
			"fonte": "CDLK",
			"rank":  0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	if len(out) > 0 {
		return out
	}
	emails := AsMap(credlinkRoot(payload)["emails"])
	row := CleanMap(map[string]any{
		"email": FirstMapValue(emails, "email", "emails"),
		"tipo":  "email",
		"fonte": "CDLK",
		"rank":  0,
	})
	if len(row) > 2 {
		return []map[string]any{row}
	}
	return nil
}

// CredlinkObitos mapeia obitos Credlink para a aba obito.
func CredlinkObitos(payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(AsMap(credlinkRoot(payload)["obito"])["registro"]) {
		row := CleanMap(map[string]any{
			"obito_cpf":                     dado["nu_cpf"],
			"obito_dataLavratura":           dado["dt_lavrat"],
			"obito_dataNascimento":          dado["dt_nasc"],
			"obito_dataObito":               dado["dt_obito"],
			"obito_livro":                   dado["livro"],
			"obito_folha":                   dado["folha"],
			"obito_termo":                   dado["termo"],
			"obito_nome":                    dado["nomefalecido"],
			"obito_nomeMae":                 dado["nm_mae_falecido"],
			"obito_nomePai":                 dado["nm_pai_falecido"],
			"obito_cnpjServentia":           dado["id_cartorio"],
			"obito_nomeFantasia":            dado["nm_cartorio"],
			"obito_municipioServentia":      dado["cidade"],
			"obito_endereco":                dado["endereco_cartorio"],
			"obito_cep":                     dado["nu_cep"],
			"obito_numeroTelefonePrincipal": dado["telefone_cartorio"],
			"fonte":                         "CDLK",
			"tipo":                          "credilink",
			"rank":                          0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

func credlinkRoot(payload map[string]any) map[string]any {
	return AsMap(payload["credilink_webservice"])
}

func rowsFromCredlinkArray(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, item := range ArrayOfMaps(value) {
		item["fonte"] = fonte
		out = append(out, CleanMap(item))
	}
	return out
}

func dddFromPhone(phone string) string {
	digits := NormalizeDocument(phone)
	if len(digits) >= 10 {
		return digits[:2]
	}
	return ""
}
