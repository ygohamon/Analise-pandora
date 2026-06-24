package mappers

import (
	"fmt"
	"strings"
)

// CortexEmpresaJuridicaRows mapeia o endpoint Cortex pessoajuridica para a aba empresa.
func CortexEmpresaJuridicaRows(dado map[string]any, fonte string) []map[string]any {
	row := CleanMap(map[string]any{
		"cnpj":                  dado["cnpj"],
		"razaoSocial":           dado["razaoSocial"],
		"nomeFantasia":          dado["nomeFantasia"],
		"dataInicioAtividade":   dado["dataInicioAtividade"],
		"municipio":             dado["municipio"],
		"uf":                    dado["uf"],
		"matriz":                dado["indicadorMatrizFilial"],
		"situacaoCadastral":     dado["situacaoCadastral"],
		"dataSituacaoCadastral": dado["dataSituacaoCadastral"],
		"porte":                 dado["porteEmpresa"],
		"naturezaJuridica":      dado["naturezaJuridica"],
		"cnaeFiscal":            dado["cnaeFiscal"],
		"cnaeSecundario":        dado["cnaeSecundario"],
		"capitalSocial":         strings.TrimLeft(fmt.Sprint(dado["capitalSocialEmpresa"]), "0"),
		"cpfResponsavel":        dado["cpfResponsavel"],
		"nomeResponsavel":       dado["nomeResponsavel"],
		"fonte":                 fonte,
		"rank":                  0,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}

// CortexEmpresaAtividadeEconomicaRows reaproveita pessoajuridica para a aba atividadeeconomica.
func CortexEmpresaAtividadeEconomicaRows(dado map[string]any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, row := range []map[string]any{
		{
			"cnpj":      dado["cnpj"],
			"cnae":      FirstMapValue(dado, "codigoCnaeFiscal", "cnaeFiscal"),
			"descricao": dado["cnaeFiscal"],
			"fonte":     fonte,
			"rank":      0,
		},
		{
			"cnpj":      dado["cnpj"],
			"cnae":      FirstMapValue(dado, "codigoCnaeSecundario", "cnaeSecundario"),
			"descricao": dado["cnaeSecundario"],
			"fonte":     fonte,
			"rank":      0,
		},
	} {
		clean := CleanMap(row)
		if len(clean) > 2 {
			out = append(out, clean)
		}
	}
	return out
}

// CortexEmpresaEnderecoRows reaproveita pessoajuridica para a aba endereco.
func CortexEmpresaEnderecoRows(dado map[string]any, fonte string) []map[string]any {
	row := CleanMap(map[string]any{
		"cnpj":           dado["cnpj"],
		"razaoSocial":    dado["razaoSocial"],
		"tipoLogradouro": dado["tipoLogradouro"],
		"logradouro":     dado["logradouro"],
		"numero":         dado["numeroLogradouro"],
		"complemento":    dado["complementoLogradouro"],
		"bairro":         dado["bairro"],
		"cep":            dado["cep"],
		"municipio":      dado["municipio"],
		"uf":             dado["uf"],
		"fonte":          fonte,
		"rank":           0,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}

// CortexEmpresaTelefoneRows reaproveita pessoajuridica para a aba telefone.
func CortexEmpresaTelefoneRows(dado map[string]any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, telefone := range []any{dado["telefone1"], dado["telefone2"]} {
		row := CleanMap(map[string]any{
			"cnpj":        dado["cnpj"],
			"razaoSocial": dado["razaoSocial"],
			"ddd":         "",
			"telefone":    telefone,
			"fonte":       fonte,
			"rank":        0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CortexEmpresaSocioPFRows mapeia socios PF do payload Cortex para historico_quadro_societario.
func CortexEmpresaSocioPFRows(dado map[string]any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, socio := range ArrayOfMaps(dado["cnpjSocio"]) {
		row := CleanMap(map[string]any{
			"cnpj":                      dado["cnpj"],
			"razaoSocial":               dado["razaoSocial"],
			"cpf":                       socio["numeroCPF"],
			"nome":                      socio["nomeSocio"],
			"percCapital":               socio["percentualCapitalSocial"],
			"tipoSocio":                 socio["identificadorSocio"],
			"vinculo":                   socio["qualificacaoSocio"],
			"dataEntradaSociedade":      socio["dataEntradaSociedade"],
			"paisSocio":                 socio["paisSocioEstrangeiro"],
			"cpfRepresentanteLegal":     socio["cpfRepresentanteLegal"],
			"nomeRepresentanteLegal":    socio["nomeRepresentanteLegal"],
			"qualificacaoRepresentante": socio["qualificacaoRepresentanteLegal"],
			"tipo":                      "pj-pf",
			"fonte":                     fonte,
			"rank":                      0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// CortexEmpresaContadorRows mapeia contadores do payload Cortex para a aba contador.
func CortexEmpresaContadorRows(dado map[string]any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, contador := range ArrayOfMaps(dado["cnpjContador"]) {
		row := CleanMap(map[string]any{
			"cnpj":        dado["cnpj"],
			"cpf":         contador["numeroCPFContador"],
			"nome":        contador["nomeContador"],
			"crc":         contador["numeroRegistroContadorPF"],
			"ufCRC":       contador["ufCRCContador"],
			"razaoSocial": dado["razaoSocial"],
			"fonte":       fonte,
			"rank":        0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkEmpresaDetalhada mapeia o bloco principal Credlink para a aba empresa.
func CredlinkEmpresaDetalhada(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	ccf := AsMap(root["consulta_ccf619"])
	dados := AsMap(root["dados_empresa"])
	row := CleanMap(map[string]any{
		"cnpj":                      ccf["cpf"],
		"razaoSocial":               FirstMapValue(ccf, "nome_completo", "razao_social"),
		"nomeFantasia":              dados["nome_fantasia"],
		"dataInicioAtividade":       dados["data_abertura"],
		"municipio":                 dados["cidade"],
		"uf":                        dados["uf"],
		"matriz":                    dados["matriz_filial"],
		"situacaoCadastral":         ccf["statusReceita"],
		"dataSituacaoCadastral":     dados["datasituacaocadastral"],
		"porte":                     dados["porte_empresa"],
		"naturezaJuridica":          dados["natureza"],
		"descricaoNaturezaJuridica": dados["desc_naturesa"],
		"cnaeFiscal":                dados["ramo_atividade"],
		"descricaoCnae":             dados["desc_ramo_atividade"],
		"cnaeSecundario":            dados["cnaes_secundarios"],
		"capitalSocial":             strings.TrimLeft(fmt.Sprint(dados["capital_social"]), "0"),
		"faturamentoPresumido":      dados["faturamento_presumido"],
		"logradouro":                dados["endereco"],
		"numero":                    dados["numero"],
		"complemento":               dados["complemento"],
		"bairro":                    dados["bairro"],
		"cep":                       dados["cep"],
		"email":                     dados["email_empresa"],
		"mei":                       dados["mei"],
		"socios":                    root["socios"],
		"outrosEnderecos":           AsMap(root["outros_enderecos"])["endereco"],
		"iptu":                      AsMap(root["iptu"])["imovel"],
		"emails":                    AsMap(root["consulta_emails_proprietario"])["emails"],
		"infoRestricao":             ccf["info_restricao"],
		"restricoesBancarias":       ccf["restricoes_bancarias"],
		"restricoesLojistas":        ccf["restricoes_lojistas"],
		"chequesPreDatados":         ccf["cheques_pre_datados"],
		"alertas":                   ccf["alertas"],
		"fonte":                     "CDLK",
		"rank":                      1,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}

// CredlinkEmpresaEnderecos mapeia enderecos do Credlink para a aba endereco.
func CredlinkEmpresaEnderecos(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	ccf := AsMap(root["consulta_ccf619"])
	dados := AsMap(root["dados_empresa"])
	out := []map[string]any{}
	base := CleanMap(map[string]any{
		"cnpj":        ccf["cpf"],
		"nome":        FirstMapValue(ccf, "nome_completo", "razao_social"),
		"logradouro":  dados["endereco"],
		"numero":      dados["numero"],
		"complemento": dados["complemento"],
		"bairro":      dados["bairro"],
		"cep":         dados["cep"],
		"municipio":   dados["cidade"],
		"uf":          dados["uf"],
		"fonte":       "CDLK",
		"rank":        1,
	})
	if len(base) > 2 {
		out = append(out, base)
	}
	items := append(ArrayOfMaps(AsMap(root["consulta_telefone_proprietario"])["telefone"]), ArrayOfMaps(AsMap(root["outros_enderecos"])["endereco"])...)
	for _, item := range items {
		row := CleanMap(map[string]any{
			"cnpj":        FirstMapValue(item, "cpfcnpj", "cnpj"),
			"nome":        item["nome"],
			"logradouro":  FirstMapValue(item, "endereco", "logradouro"),
			"numero":      item["numero"],
			"complemento": item["complemento"],
			"bairro":      item["bairro"],
			"cep":         item["cep"],
			"municipio":   FirstMapValue(item, "cidade", "municipio"),
			"uf":          item["uf"],
			"fonte":       "CDLK",
			"rank":        1,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkEmpresaTelefones mapeia telefones do Credlink para a aba telefone.
func CredlinkEmpresaTelefones(payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, item := range ArrayOfMaps(AsMap(credlinkRoot(payload)["consulta_telefone_proprietario"])["telefone"]) {
		telefone := fmt.Sprint(item["telefone"])
		row := CleanMap(map[string]any{
			"cnpj":      FirstMapValue(item, "cpfcnpj", "cnpj"),
			"nome":      item["nome"],
			"ddd":       dddFromPhone(telefone),
			"telefone":  telefone,
			"operadora": item["operadora"],
			"whatsapp":  item["whatsapp"],
			"fonte":     "CDLK",
			"rank":      1,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkEmpresaVirtual mapeia emails do Credlink para a aba virtual.
func CredlinkEmpresaVirtual(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	ccf := AsMap(root["consulta_ccf619"])
	out := []map[string]any{}
	seen := map[string]bool{}
	addEmail := func(email any) {
		for _, value := range splitCredlinkEmails(email) {
			key := strings.ToLower(value)
			if seen[key] {
				continue
			}
			seen[key] = true
			out = append(out, CleanMap(map[string]any{
				"cnpj":  ccf["cpf"],
				"email": value,
				"tipo":  "email",
				"fonte": "CDLK",
				"rank":  1,
			}))
		}
	}
	addEmail(AsMap(root["dados_empresa"])["email_empresa"])
	for _, item := range ArrayOfMaps(root["consulta_emails_proprietario"]) {
		addEmail(FirstMapValue(item, "email", "emails"))
	}
	addEmail(FirstMapValue(AsMap(root["consulta_emails_proprietario"]), "email", "emails"))
	addEmail(FirstMapValue(AsMap(root["emails"]), "email", "emails"))
	return out
}

func splitCredlinkEmails(value any) []string {
	raw := strings.TrimSpace(fmt.Sprint(value))
	if raw == "" || strings.EqualFold(raw, "<nil>") {
		return nil
	}
	parts := strings.FieldsFunc(raw, func(r rune) bool {
		return r == ',' || r == ';' || r == '\n' || r == '\r' || r == '\t'
	})
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		email := strings.TrimSpace(part)
		if email != "" {
			out = append(out, strings.ToLower(email))
		}
	}
	return out
}

// CredlinkEmpresaVeiculos mapeia veiculos Credlink para a aba veiculo.
func CredlinkEmpresaVeiculos(payload map[string]any) []map[string]any {
	return rowsFromCredlinkArray(AsMap(credlinkRoot(payload)["veiculos"])["veiculo"], "CDLK")
}

// CredlinkEmpresaHistoricoSocietario mapeia socios Credlink para historico_quadro_societario.
func CredlinkEmpresaHistoricoSocietario(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	ccf := AsMap(root["consulta_ccf619"])
	out := []map[string]any{}
	for _, item := range ArrayOfMaps(root["socios"]) {
		row := CleanMap(map[string]any{
			"cnpj":                 ccf["cpf"],
			"razaoSocial":          FirstMapValue(ccf, "nome_completo", "razao_social"),
			"cpf":                  FirstMapValue(item, "cpfsocio", "cpf"),
			"nome":                 FirstMapValue(item, "nomesocio", "nome"),
			"dataEntradaSociedade": FirstMapValue(item, "entradasociedade", "dtiniciosocio"),
			"dataSaidaSociedade":   FirstMapValue(item, "datasociedade", "dataSaidaSociedade"),
			"percCapital":          FirstMapValue(item, "participacaosociedade", "percCapital"),
			"vinculo":              FirstMapValue(item, "desccargosociedade", "cargosociedade", "vinculo"),
			"tipo":                 "pj-pf",
			"fonte":                "CDLK",
			"rank":                 1,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// CredlinkEmpresaAtividadeEconomica mapeia ramo/CNAE Credlink para atividadeeconomica.
func CredlinkEmpresaAtividadeEconomica(payload map[string]any) []map[string]any {
	root := credlinkRoot(payload)
	dados := AsMap(root["dados_empresa"])
	row := CleanMap(map[string]any{
		"cnpj":           AsMap(root["consulta_ccf619"])["cpf"],
		"cnae":           dados["ramo_atividade"],
		"descricao":      dados["desc_ramo_atividade"],
		"cnaeSecundario": dados["cnaes_secundarios"],
		"fonte":          "CDLK",
		"rank":           1,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}
