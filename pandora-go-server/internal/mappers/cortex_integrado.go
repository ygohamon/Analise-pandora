package mappers

import (
	"fmt"
	"strings"
)

// CortexPessoaFisicaRows mapeia pessoa fisica do Cortex para a aba pessoa do integrado.
// Chamado pelo repository externo de pessoa apos a chamada HTTP ao Cortex.
func CortexPessoaFisicaRows(dado map[string]any, fonte string) []map[string]any {
	row := CleanMap(map[string]any{
		"cpf":                  dado["numeroCPF"],
		"nome":                 dado["nomeCompleto"],
		"nomeMae":              dado["nomeMae"],
		"municipio":            dado["municipio"],
		"uf":                   dado["uf"],
		"dataNascimento":       dado["dataNascimento"],
		"sexo":                 dado["sexo"],
		"situacaoCadastral":    dado["situacaoCadastral"],
		"residenteExterior":    dado["identificadorResidenteExterior"],
		"nomePaisExterior":     dado["paisResidencia"],
		"estrangeiro":          dado["indicadorEstrangeiro"],
		"naturezaOcupacao":     dado["naturezaOcupacao"],
		"ocupacaoPrincipal":    dado["ocupacaoPrincipal"],
		"anoExercicioOcupacao": nonZeroYear(dado["anoExercicioOcupacao"]),
		"anoObito":             nonZeroYear(dado["anoObito"]),
		"fonte":                strings.ToLower(fonte),
		"rank":                 8,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}

// CortexEnderecoRows mapeia endereco Cortex para a aba endereco do integrado.
func CortexEnderecoRows(dado map[string]any, fonte string) []map[string]any {
	row := CleanMap(map[string]any{
		"cpf":            dado["numeroCPF"],
		"nome":           dado["nomeCompleto"],
		"tipoLogradouro": dado["tipoLogradouro"],
		"logradouro":     dado["logradouro"],
		"numero":         dado["numeroLogradouro"],
		"complemento":    dado["complementoLogradouro"],
		"bairro":         dado["bairro"],
		"cep":            dado["cep"],
		"municipio":      dado["municipio"],
		"uf":             dado["uf"],
		"anoRegistro":    firstChars(dado["dataAtualizacao"], 4),
		"fonte":          strings.ToLower(fonte),
		"rank":           0,
	})
	if len(row) <= 2 {
		return nil
	}
	return []map[string]any{row}
}

// CortexTelefoneRows mapeia telefone Cortex para a aba telefone do integrado.
func CortexTelefoneRows(dado map[string]any, fonte string) []map[string]any {
	telefone := strings.TrimLeft(NormalizeDocument(fmt.Sprint(dado["telefone"])), "0")
	if telefone == "" {
		return nil
	}
	row := CleanMap(map[string]any{
		"cpf":         dado["numeroCPF"],
		"nome":        dado["nomeCompleto"],
		"ddd":         strings.TrimLeft(NormalizeDocument(fmt.Sprint(dado["ddd"])), "0"),
		"telefone":    telefone,
		"anoRegistro": firstChars(dado["dataAtualizacao"], 4),
		"fonte":       strings.ToLower(fonte),
		"rank":        0,
	})
	return []map[string]any{row}
}

// CortexEmpresasResponsavelRows mapeia empresas em que o CPF aparece como responsavel.
func CortexEmpresasResponsavelRows(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		row := CleanMap(map[string]any{
			"cnpj":                dado["cnpj"],
			"razaoSocial":         dado["razaoSocial"],
			"nomeFantasia":        dado["nomeFantasia"],
			"dataInicioAtividade": dado["dataInicioAtividade"],
			"municipio":           dado["municipio"],
			"uf":                  dado["uf"],
			"vinculo":             "responsavel",
			"fonte":               fonte,
			"rank":                0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CortexEmpresasContadorRows mapeia empresas vinculadas ao CPF como contador.
func CortexEmpresasContadorRows(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		row := CleanMap(map[string]any{
			"cnpj":         dado["numeroCNPJ"],
			"razaoSocial":  dado["razaoSocial"],
			"nomeFantasia": dado["nomeFantasia"],
			"municipio":    dado["municipio"],
			"uf":           dado["ufSgl"],
			"vinculo":      "contador",
			"fonte":        fonte,
			"rank":         0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CortexQuadroSocietarioRows mapeia quadro societario Cortex para historico_quadro_societario.
func CortexQuadroSocietarioRows(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		row := CleanMap(map[string]any{
			"cnpj":                 dado["numeroCNPJ"],
			"razaoSocial":          dado["razaoSocial"],
			"nomeFantasia":         dado["nomeFantasia"],
			"cpf":                  dado["numeroCPF"],
			"nome":                 dado["nomeSocio"],
			"vinculo":              dado["qualificacaoSocio"],
			"dataEntradaSociedade": dado["dataEntradaSociedade"],
			"tipo":                 "pf",
			"fonte":                fonte,
			"rank":                 0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// CortexCondutorRows mapeia RENACH/Cortex para a aba condutor.
func CortexCondutorRows(value any) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		individuo := AsMap(dado["individuo"])
		historico := AsMap(dado["historicoEmissao"])
		documento := map[string]any{}
		if docs := ArrayOfMaps(dado["documento"]); len(docs) > 0 {
			documento = docs[0]
		}
		row := CleanMap(map[string]any{
			"cpf":                        dado["cpf"],
			"nome":                       individuo["nome"],
			"nomeMae":                    individuo["nomeMae"],
			"nomePai":                    individuo["nomePai"],
			"sexo":                       individuo["sexo"],
			"dataNascimento":             individuo["dataNascimento"],
			"municipioNaturalidade":      individuo["municipioNaturalidade"],
			"ufNaturalidade":             individuo["ufNaturalidade"],
			"nacionalidade":              individuo["nacionalidade"],
			"numeroRegistro":             dado["numeroRegistro"],
			"numeroFormularioCnh":        dado["numeroFormularioCnh"],
			"numeroFormularioRenach":     dado["numeroFormularioRenach"],
			"numeroControleCondutor":     dado["numeroControleCondutor"],
			"numeroPgu":                  dado["numeroPgu"],
			"numeroListaImpedimento":     dado["numeroListaImpedimento"],
			"permissionario":             dado["permissionario"],
			"ufDominio":                  dado["ufDominio"],
			"ufSolicitanteTransferencia": dado["ufSolicitanteTransferencia"],
			"categoriaAtual":             historico["categoriaAtual"],
			"categoriaAutorizada":        historico["categoriaAutorizada"],
			"categoriaRebaixada":         historico["categoriaRebaixada"],
			"situacaoCnh":                historico["situacaoCnh"],
			"situacaoAnteriorCnh":        historico["situacaoAnteriorCnh"],
			"dataPrimeiraHabilitacao":    historico["dataPrimeiraHabilitacao"],
			"dataEmissaoCnh":             historico["dataEmissaoCnh"],
			"dataValidadeCnh":            historico["dataValidadeCnh"],
			"dataSituacaoCnh":            historico["dataSituacaoCnh"],
			"localEmissao":               historico["localEmissao"],
			"ufEmissao":                  historico["ufEmissao"],
			"ufPrimeiraHabilitacao":      historico["ufPrimeiraHabilitacao"],
			"numeroSeguranca":            historico["numeroSeguranca"],
			"observacoesCnh":             FirstMapValue(historico, "obervacoesCnh", "observacoesCnh"),
			"tipoDocumento":              documento["tipoDocumento"],
			"numeroDocumento":            documento["numeroDocumento"],
			"orgaoEmissaoDocumento":      documento["orgaoEmissao"],
			"ufOrgaoEmissorDocumento":    documento["ufOrgaoEmissor"],
			"dataCadastramento":          dado["dataCadastramento"],
			"dataUltimaAtualizacao":      dado["dataUltimaAtualizacao"],
			"codigoUltimaAtualizacao":    dado["codigoUltimaAtualizacao"],
			"logradouro":                 individuo["logradouro"],
			"numero":                     individuo["numero"],
			"complemento":                individuo["complemento"],
			"bairro":                     individuo["bairro"],
			"cep":                        individuo["cep"],
			"municipioEndereco":          individuo["municipioEndereco"],
			"ufEndereco":                 individuo["ufEndereco"],
			"fonte":                      "cortex.renach",
			"rank":                       0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// CortexCasamentoRows mapeia SIRC casamento para parentesco.
func CortexCasamentoRows(cpf string, value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, certidao := range ArrayOfMaps(value) {
		for _, conjuge := range ArrayOfMaps(certidao["conjuge"]) {
			documentos := []string{}
			for _, doc := range ArrayOfMaps(conjuge["documento"]) {
				partes := []string{}
				if tipo := cleanText(doc["tipoDocumento"]); tipo != "" {
					partes = append(partes, tipo)
				}
				if numero := cleanText(doc["numeroDocumento"]); numero != "" {
					partes = append(partes, numero)
				}
				if len(partes) > 0 {
					documentos = append(documentos, strings.Join(partes, " "))
				}
			}
			row := CleanMap(map[string]any{
				"categoria":                "Cônjuge",
				"cpf":                      conjuge["cpfConjuge"],
				"nome":                     conjuge["nomeConjuge"],
				"sexo":                     conjuge["sexoConjuge"],
				"dataNascimento":           conjuge["dataNascimentoConjuge"],
				"nomeMae":                  conjuge["nomeMaeConjuge"],
				"nomePai":                  conjuge["nomePaiConjuge"],
				"municipio":                conjuge["municipioNaturalidadeConjuge"],
				"uf":                       conjuge["ufNaturalidadeConjuge"],
				"documento":                strings.Join(documentos, " | "),
				"metodoBuscaCpf":           conjuge["metodoBuscaCpf"],
				"cpfConsultado":            cpf,
				"numeroMatriculaCasamento": certidao["numeroMatricula"],
				"dataCasamento":            certidao["dataCasamento"],
				"dataLavraturaCasamento":   certidao["dataLavratura"],
				"dataOperacaoCasamento":    certidao["dataOperacao"],
				"cartorioCasamento":        certidao["cartorioCasamento"],
				"municipioCasamento":       certidao["municipioCasamento"],
				"ufCasamento":              certidao["ufCasamento"],
				"tipoOperacaoCasamento":    certidao["tipoOperacao"],
				"fonte":                    strings.ToLower(fonte) + ".sirc",
				"rank":                     0,
			})
			if len(row) > 3 {
				out = append(out, row)
			}
		}
	}
	return out
}

// CortexObitoRows mapeia SIRC obito para a aba obito.
func CortexObitoRows(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, registro := range ArrayOfMaps(value) {
		serventia := AsMap(registro["serventia"])
		row := CleanMap(map[string]any{
			"obito_id":                       registro["id"],
			"obito_cpf":                      registro["cpf"],
			"obito_dataLavratura":            registro["dataLavratura"],
			"obito_dataNascimento":           registro["dataNascimento"],
			"obito_dataObito":                registro["dataObito"],
			"obito_dataOperacao":             registro["dataOperacao"],
			"obito_documentos":               registro["documentos"],
			"obito_idServentia":              registro["idServentia"],
			"obito_matricula":                registro["matricula"],
			"obito_metodoBuscaCpf":           registro["metodoBuscaCpf"],
			"obito_municipioNaturalidade":    registro["municipioNaturalidade"],
			"obito_municipioObito":           registro["municipioObito"],
			"obito_nome":                     registro["nome"],
			"obito_nomeMae":                  registro["nomeMae"],
			"obito_nomePai":                  registro["nomePai"],
			"obito_cnpjServentia":            serventia["cnpjServentia"],
			"obito_nomeFantasia":             serventia["nomeFantasia"],
			"obito_razaoSocial":              serventia["razaoSocial"],
			"obito_ufServentia":              serventia["ufServentia"],
			"obito_municipioServentia":       serventia["municipioServentia"],
			"obito_bairro":                   serventia["bairro"],
			"obito_endereco":                 serventia["endereco"],
			"obito_numero":                   serventia["numero"],
			"obito_complemento":              serventia["complemento"],
			"obito_cep":                      serventia["cep"],
			"obito_distrito":                 serventia["distrito"],
			"obito_subDistrito":              serventia["subDistrito"],
			"obito_fax":                      serventia["fax"],
			"obito_site":                     serventia["site"],
			"obito_emailServentia":           serventia["emailServentia"],
			"obito_numeroTelefonePrincipal":  serventia["numeroTelefonePrincipal"],
			"obito_numeroTelefoneSecundario": serventia["numeroTelefoneSecundario"],
			"obito_dataInicioAtividades":     serventia["dataInicioAtividades"],
			"obito_dataExclusao":             serventia["dataExclusao"],
			"obito_dataAtualizacao":          serventia["dataAtualizacao"],
			"obito_sexo":                     registro["sexo"],
			"obito_tipoOperacao":             registro["tipoOperacao"],
			"obito_ufNaturalidade":           registro["ufNaturalidade"],
			"obito_ufObito":                  registro["ufObito"],
			"fonte":                          fonte,
			"tipo":                           "cortex",
			"rank":                           0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// CortexAmadorRows mapeia dados de amador do Cortex para a aba amador.
func CortexAmadorRows(value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		row := CleanMap(map[string]any{
			"bairroEnderecoAmador":                    dado["bairroEnderecoAmador"],
			"categoriaHabilitacaoAmador":              dado["categoriaHabilitacaoAmador"],
			"celularAmador":                           dado["celularAmador"],
			"cepEnderecoAmador":                       dado["cepEnderecoAmador"],
			"codigoBarras":                            dado["codigoBarras"],
			"cpfAmador":                               dado["cpfAmador"],
			"dataEmissaoCarteiraAmador":               dado["dataEmissaoCarteiraAmador"],
			"dataNascimento":                          dado["dataNascimento"],
			"dataValidadeCarteiraAmador":              dado["dataValidadeCarteiraAmador"],
			"emailAmador":                             dado["emailAmador"],
			"enderecoAmador":                          dado["enderecoAmador"],
			"id":                                      dado["id"],
			"motivoEmissaoCarteiraAmador":             dado["motivoEmissaoCarteiraAmador"],
			"municipioEnderecoAmador":                 dado["municipioEnderecoAmador"],
			"nomeAmador":                              dado["nomeAmador"],
			"numeroIdentidadeAmador":                  dado["numeroIdentidadeAmador"],
			"numeroInscricaoAmadorFormatoAnterior":    dado["numeroInscricaoAmadorFormatoAnterior"],
			"numeroInscricaoAmadorVersaoAtualSistema": dado["numeroInscricaoAmadorVersaoAtualSistema"],
			"orgaoEmissorIdentidade":                  dado["orgaoEmissorIdentidade"],
			"situacaoCarteiraAmador":                  dado["situacaoCarteiraAmador"],
			"statusDataValidade":                      dado["statusDataValidade"],
			"telefoneAmador":                          dado["telefoneAmador"],
			"ufEnderecoAmador":                        dado["ufEnderecoAmador"],
			"fonte":                                   fonte,
			"rank":                                    0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

// CortexVeiculoRows mapeia veiculos Cortex para a aba veiculo.
func CortexVeiculoRows(cpf string, value any, fonte string) []map[string]any {
	out := []map[string]any{}
	for _, dado := range ArrayOfMaps(value) {
		row := CleanMap(map[string]any{
			"cpf":                         cpf,
			"placa":                       dado["placa"],
			"chassi":                      dado["chassi"],
			"proprietario":                dado["nomeProprietario"],
			"nome":                        dado["nomeProprietario"],
			"possuidor":                   dado["nomePossuidor"],
			"tipoDocumentoFaturado":       dado["tipoDocumentoFaturado"],
			"numeroIdentificacaoFaturado": dado["numeroIdentificacaoFaturado"],
			"ufFatura":                    dado["ufFatura"],
			"numeroMotor":                 dado["numeroMotor"],
			"renavam":                     dado["renavam"],
			"anoFab":                      dado["anoFabricacao"],
			"anoMod":                      dado["anoModelo"],
			"municipio":                   dado["municipioPlaca"],
			"uf":                          dado["ufEmplacamento"],
			"tipo":                        dado["tipoVeiculo"],
			"marcaModelo":                 dado["marcaModelo"],
			"cor":                         dado["cor"],
			"especie":                     dado["especie"],
			"combustivel":                 dado["combustivel"],
			"dataAtualizacao":             dado["dataAtualizacaoVeiculo"],
			"dataInicioPosse":             dado["dataEmplacamento"],
			"ufEmplacamento":              dado["ufEmplacamento"],
			"anoRegistro":                 firstChars(dado["dataAtualizacaoVeiculo"], 4),
			"responsavel":                 dado["nomeProprietario"],
			"restricao_1":                 dado["restricaoVeiculo1"],
			"restricao_2":                 dado["restricaoVeiculo2"],
			"restricao_3":                 dado["restricaoVeiculo3"],
			"restricao_4":                 dado["restricaoVeiculo4"],
			"situacao":                    dado["situacaoVeiculo"],
			"tipoDado":                    "completo",
			"fonte":                       fonte,
			"rank":                        0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

func nonZeroYear(value any) any {
	text := strings.TrimSpace(fmt.Sprint(value))
	if text == "" || text == "0" || text == "0000" || strings.EqualFold(text, "<nil>") {
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

func cleanText(value any) string {
	text := strings.TrimSpace(fmt.Sprint(value))
	if text == "" || strings.EqualFold(text, "<nil>") {
		return ""
	}
	return text
}
