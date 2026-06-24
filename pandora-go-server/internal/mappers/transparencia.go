package mappers

import (
	"fmt"
	"time"
)

// TransparenciaRows adiciona metadados padrao mantendo o payload original.
func TransparenciaRows(rows []map[string]any, tipo string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(item)
		row["tipo"] = tipo
		row["fonte"] = "transparencia"
		row["rank"] = 0
		row["dataConsulta"] = time.Now().Format(time.RFC3339)
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaServidorRows mapeia servidor federal para a aba empregador/servidor.
func TransparenciaServidorRows(rows []map[string]any, cpf string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		servidor := AsMap(item["servidor"])
		cargo := firstMap(ArrayOfMaps(item["fichasCargoEfetivo"]))
		funcao := firstMap(ArrayOfMaps(item["fichasFuncao"]))
		row := CleanMap(map[string]any{
			"id":                     servidor["id"],
			"cpf":                    cpf,
			"situacao":               servidor["situacao"],
			"funcao":                 AsMap(servidor["funcao"])["descricaoFuncaoCargo"],
			"orgaoSuperiorLotacao":   cargo["orgaoSuperiorLotacao"],
			"uorgLotacao":            cargo["uorgLotacao"],
			"orgaoServidorLotacao":   cargo["orgaoServidorLotacao"],
			"dataIngressoOrgao":      cargo["dataIngressoOrgao"],
			"orgaoServidorExercicio": cargo["orgaoServidorExercicio"],
			"uorgExercicio":          cargo["uorgExercicio"],
			"jornadaTrabalho":        cargo["jornadaTrabalho"],
			"cargo":                  cargo["cargo"],
			"classeCargo":            cargo["classeCargo"],
			"dataIngressoCargo":      cargo["dataIngressoCargo"],
			"funcaoAtividade":        funcao["atividade"],
			"dataIngressoFuncao":     funcao["dataIngressoFuncao"],
			"fonte":                  "transparencia",
			"tipo":                   "servidor",
			"rank":                   0,
			"dataConsulta":           time.Now().Format(time.RFC3339),
		})
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaPessoaFisicaRows mapeia pessoa-fisica para a aba pessoa.
func TransparenciaPessoaFisicaRows(rows []map[string]any, cpf string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		pessoa := firstNonEmptyMap(item, "pessoa", "beneficiario", "favorecido", "sancionado", "servidor")
		municipio := firstNonEmptyMap(item, "municipio")
		if len(municipio) == 0 {
			municipio = AsMap(pessoa["municipio"])
		}
		row := CleanMap(map[string]any{
			"id":           item["id"],
			"cpf":          cpf,
			"nome":         FirstMapValue(item, "nome", "nomePessoa"),
			"nis":          item["nis"],
			"municipio":    FirstMapValue(municipio, "nomeIBGE", "nome"),
			"uf":           FirstMapValue(AsMap(municipio["uf"]), "sigla"),
			"fonte":        "transparencia",
			"tipo":         "pessoa_fisica",
			"rank":         0,
			"dataConsulta": time.Now().Format(time.RFC3339),
		})
		if row["nome"] == nil {
			row["nome"] = pessoa["nome"]
		}
		if row["uf"] == nil {
			row["uf"] = municipio["uf"]
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaPessoaJuridicaRows mapeia pessoa-juridica para a aba empresa.
func TransparenciaPessoaJuridicaRows(rows []map[string]any, cnpj string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		pessoa := firstNonEmptyMap(item, "pessoa", "pessoaJuridica")
		municipio := firstNonEmptyMap(item, "municipio")
		if len(municipio) == 0 {
			municipio = AsMap(pessoa["municipio"])
		}
		row := CleanMap(map[string]any{
			"id":           item["id"],
			"cnpj":         cnpj,
			"razaoSocial":  FirstMapValue(item, "razaoSocial", "nomeEmpresa"),
			"nomeFantasia": item["nomeFantasia"],
			"municipio":    FirstMapValue(municipio, "nomeIBGE", "nome"),
			"uf":           FirstMapValue(AsMap(municipio["uf"]), "sigla"),
			"fonte":        "transparencia",
			"tipo":         "pessoa_juridica",
			"rank":         0,
			"dataConsulta": time.Now().Format(time.RFC3339),
		})
		if row["razaoSocial"] == nil {
			row["razaoSocial"] = FirstMapValue(pessoa, "nome", "razaoSocial")
		}
		if row["uf"] == nil {
			row["uf"] = municipio["uf"]
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaPEPRows mapeia PEP do Portal da Transparencia para a aba pep.
func TransparenciaPEPRows(rows []map[string]any, cpf string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		pessoa := firstNonEmptyMap(item, "pessoa")
		orgao := firstNonEmptyMap(item, "orgao", "orgaoSuperior", "orgaoEntidade")
		row := CleanMap(map[string]any{
			"id":              item["id"],
			"cpf":             cpf,
			"nome":            FirstMapValue(item, "nome"),
			"siglaFuncao":     item["siglaFuncao"],
			"descricaoFuncao": FirstMapValue(item, "descricaoFuncao", "funcao"),
			"nivelFuncao":     item["nivelFuncao"],
			"orgao":           FirstMapValue(orgao, "nome", "nomeOrgao"),
			"dataInicio":      FirstMapValue(item, "dataInicioExercicio", "dataInicio"),
			"dataFim":         FirstMapValue(item, "dataFimExercicio", "dataFim"),
			"fonte":           "transparencia",
			"tipo":            "pep",
			"rank":            0,
			"dataConsulta":    time.Now().Format(time.RFC3339),
		})
		if row["nome"] == nil {
			row["nome"] = pessoa["nome"]
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaViagemRows mapeia viagens por CPF para a aba viagem.
func TransparenciaViagemRows(rows []map[string]any, cpf string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(map[string]any{
			"id":               item["id"],
			"numeroProposta":   item["numeroProposta"],
			"cpf":              cpf,
			"nome":             FirstMapValue(item, "nomePessoa"),
			"cargo":            item["cargo"],
			"orgaoSolicitante": FirstMapValue(AsMap(item["orgaoSolicitante"]), "nome"),
			"destinos":         joinNomeList(item["destinos"]),
			"dataInicio":       FirstMapValue(item, "dataInicioViagem", "dataInicio"),
			"dataFim":          FirstMapValue(item, "dataFimViagem", "dataFim"),
			"situacao":         FirstMapValue(AsMap(item["situacao"]), "descricao"),
			"valorTotal":       FirstMapValue(item, "valorTotalViagem", "valorTotal"),
			"fonte":            "transparencia",
			"tipo":             "viagem",
			"rank":             0,
			"dataConsulta":     time.Now().Format(time.RFC3339),
		})
		if row["nome"] == nil {
			row["nome"] = AsMap(item["pessoa"])["nome"]
		}
		if row["orgaoSolicitante"] == nil {
			row["orgaoSolicitante"] = item["orgaoSolicitante"]
		}
		if row["situacao"] == nil {
			row["situacao"] = item["situacao"]
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaContratoRows mapeia contratos para a aba contrato.
func TransparenciaContratoRows(rows []map[string]any, documento string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		fornecedor := firstNonEmptyMap(item, "fornecedor", "pessoa")
		orgao := firstNonEmptyMap(item, "orgao", "orgaoSuperior", "orgaoEntidade")
		row := CleanMap(map[string]any{
			"id":                 item["id"],
			"numero":             item["numero"],
			"objeto":             item["objeto"],
			"fornecedor":         FirstMapValue(fornecedor, "nome", "razaoSocial"),
			"cpfCnpjFornecedor":  FirstMapValue(fornecedor, "codigo", "cpfCnpjFornecedor"),
			"orgao":              orgao["nome"],
			"unidadeGestora":     AsMap(item["unidadeGestora"])["nome"],
			"dataAssinatura":     item["dataAssinatura"],
			"dataInicioVigencia": item["dataInicioVigencia"],
			"dataFimVigencia":    item["dataFimVigencia"],
			"valorInicialCompra": item["valorInicialCompra"],
			"valorFinalCompra":   item["valorFinalCompra"],
			"fonte":              "transparencia",
			"tipo":               "contrato",
			"rank":               0,
			"dataConsulta":       time.Now().Format(time.RFC3339),
		})
		if row["cpfCnpjFornecedor"] == nil {
			row["cpfCnpjFornecedor"] = documento
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaCartaoRows mapeia cartoes para a aba cartao_governo_federal.
func TransparenciaCartaoRows(rows []map[string]any, documento string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		estabelecimento := AsMap(item["estabelecimento"])
		municipio := firstNonEmptyMap(item, "municipio")
		if len(municipio) == 0 {
			municipio = AsMap(estabelecimento["municipio"])
		}
		unidade := AsMap(item["unidadeGestora"])
		orgaoVinculado := AsMap(unidade["orgaoVinculado"])
		row := CleanMap(map[string]any{
			"id":                  item["id"],
			"dataTransacao":       item["dataTransacao"],
			"valor":               item["valorTransacao"],
			"favorecido":          FirstMapValue(AsMap(item["favorecido"]), "nome"),
			"cpfCnpjFavorecido":   documento,
			"portador":            FirstMapValue(AsMap(item["portador"]), "nome"),
			"tipoCartao":          AsMap(item["tipoCartao"])["descricao"],
			"estabelecimento":     FirstMapValue(estabelecimento, "razaoSocialReceita", "nome"),
			"cnpjEstabelecimento": estabelecimento["codigoFormatado"],
			"municipio":           FirstMapValue(municipio, "nomeIBGE", "nome"),
			"uf":                  FirstMapValue(AsMap(municipio["uf"]), "sigla"),
			"unidadeGestora":      unidade["nome"],
			"orgaoVinculado":      orgaoVinculado["nome"],
			"orgaoMaximo":         AsMap(orgaoVinculado["orgaoMaximo"])["sigla"],
			"fonte":               "transparencia",
			"tipo":                "cartao_gov_federal",
			"rank":                0,
			"dataConsulta":        time.Now().Format(time.RFC3339),
		})
		if row["favorecido"] == nil {
			row["favorecido"] = FirstMapValue(item, "nomeFavorecido")
		}
		if row["portador"] == nil {
			row["portador"] = FirstMapValue(item, "nomePortador")
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaNotaFiscalRows mapeia notas fiscais para a aba nota_fiscal.
func TransparenciaNotaFiscalRows(rows []map[string]any, cnpj string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(map[string]any{
			"id":               item["id"],
			"chave":            item["chave"],
			"numero":           item["numero"],
			"serie":            item["serie"],
			"dataEmissao":      item["dataEmissao"],
			"cnpjEmitente":     cnpj,
			"nomeEmitente":     FirstMapValue(AsMap(item["emitente"]), "nome"),
			"cnpjDestinatario": FirstMapValue(AsMap(item["destinatario"]), "codigo"),
			"nomeDestinatario": FirstMapValue(AsMap(item["destinatario"]), "nome"),
			"valorNotaFiscal":  FirstMapValue(item, "valorNotaFiscal", "valor"),
			"situacao":         FirstMapValue(AsMap(item["situacao"]), "descricao"),
			"fonte":            "transparencia",
			"tipo":             "nota_fiscal",
			"rank":             0,
			"dataConsulta":     time.Now().Format(time.RFC3339),
		})
		if row["nomeEmitente"] == nil {
			row["nomeEmitente"] = item["nomeEmitente"]
		}
		if row["cnpjDestinatario"] == nil {
			row["cnpjDestinatario"] = item["cnpjDestinatario"]
		}
		if row["nomeDestinatario"] == nil {
			row["nomeDestinatario"] = item["nomeDestinatario"]
		}
		if row["situacao"] == nil {
			row["situacao"] = item["situacao"]
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaRenunciaRows mapeia renuncias fiscais para a aba renuncia_fiscal.
func TransparenciaRenunciaRows(rows []map[string]any, cnpj string, tipo string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		pessoa := firstNonEmptyMap(item, "pessoa", "pessoaJuridica")
		municipio := firstNonEmptyMap(item, "municipio")
		if len(municipio) == 0 {
			municipio = AsMap(pessoa["municipio"])
		}
		row := CleanMap(map[string]any{
			"id":           item["id"],
			"cnpj":         cnpj,
			"razaoSocial":  FirstMapValue(item, "razaoSocial", "nomeEmpresa"),
			"uf":           FirstMapValue(item, "uf"),
			"municipio":    FirstMapValue(item, "municipio"),
			"tributo":      FirstMapValue(item, "tributo", "tipoTributo"),
			"beneficio":    FirstMapValue(item, "beneficio", "tipoBeneficio"),
			"ano":          item["ano"],
			"valor":        FirstMapValue(item, "valor", "valorRenuncia"),
			"fonte":        "transparencia",
			"tipo":         tipo,
			"rank":         0,
			"dataConsulta": time.Now().Format(time.RFC3339),
		})
		if row["razaoSocial"] == nil {
			row["razaoSocial"] = pessoa["nome"]
		}
		if row["municipio"] == nil {
			row["municipio"] = FirstMapValue(municipio, "nomeIBGE", "nome")
		}
		if row["uf"] == nil {
			row["uf"] = FirstMapValue(AsMap(municipio["uf"]), "sigla")
		}
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// TransparenciaBeneficioRows preserva beneficios do Portal em formato tabular.
func TransparenciaBeneficioRows(rows []map[string]any, tipo string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(item)
		normalizaMunicipioTransparencia(row)
		row["tipo"] = tipo
		row["fonte"] = "transparencia"
		row["rank"] = 0
		row["dataConsulta"] = time.Now().Format(time.RFC3339)
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// normalizaMunicipioTransparencia evita enviar objetos aninhados para colunas tabulares do front.
func normalizaMunicipioTransparencia(row map[string]any) {
	municipio := AsMap(row["municipio"])
	if len(municipio) == 0 {
		return
	}
	row["municipio"] = FirstMapValue(municipio, "nomeIBGE", "nome")
	if row["municipio"] == nil {
		delete(row, "municipio")
	}
	if row["uf"] == nil {
		if uf := FirstMapValue(AsMap(municipio["uf"]), "sigla"); uf != nil {
			row["uf"] = uf
			return
		}
		if uf := municipio["uf"]; uf != nil {
			row["uf"] = uf
		}
	}
}

func firstMap(rows []map[string]any) map[string]any {
	if len(rows) == 0 {
		return map[string]any{}
	}
	return rows[0]
}

func firstNonEmptyMap(row map[string]any, keys ...string) map[string]any {
	for _, key := range keys {
		if mapped := AsMap(row[key]); len(mapped) > 0 {
			return mapped
		}
	}
	return map[string]any{}
}

func joinNomeList(value any) any {
	rows := ArrayOfMaps(value)
	if len(rows) == 0 {
		return value
	}
	out := ""
	for _, row := range rows {
		text := FirstMapValue(row, "nome")
		if text == nil {
			continue
		}
		if out != "" {
			out += ", "
		}
		out += fmt.Sprint(text)
	}
	return out
}
