package mappers

import (
	"fmt"
	"strings"
	"time"
)

// JusbrasilLawsuitRows mapeia processos Jusbrasil para a aba processo.
func JusbrasilLawsuitRows(payload map[string]any, tipoRegistro string) []map[string]any {
	out := []map[string]any{}
	identificacao := AsMap(payload["identificacao"])
	for _, processo := range ArrayOfMaps(payload["processos"]) {
		row := CleanMap(map[string]any{
			"nome_consultado":             payload["nome"],
			"documento_consultado":        identificacao["valor"],
			"tipo_documento_consultado":   identificacao["tipo"],
			"tipo":                        "jusbrasil_processo",
			"jusbrasil_tipo_registro":     tipoRegistro,
			"tipo_processo":               processo["tipo_processo"],
			"processo_principal":          processo["processo_principal"],
			"data_ultima_atualizacao":     processo["data_ultima_atualizacao"],
			"data_andamento_mais_recente": processo["data_andamento_mais_recente"],
			"confianca_associacao":        processo["confianca_associacao"],
			"valor_causa":                 processo["valor_causa"],
			"natureza":                    processo["natureza"],
			"classe_processual":           processo["classe_processual"],
			"assunto":                     processo["assunto"],
			"ano_do_processo":             processo["ano_do_processo"],
			"ano_distribuicao":            processo["ano_distribuicao"],
			"polo_passivo":                processo["polo_passivo"],
			"tribunal":                    processo["tribunal"],
			"uf":                          FirstMapValue(processo, "UF", "uf"),
			"comarca":                     processo["comarca"],
			"papel":                       processo["papel"],
			"forum":                       processo["forum"],
			"nome_na_capa":                processo["nome_na_capa"],
			"numero_processo":             processo["numero_processo"],
			"link":                        processo["link"],
			"status_data":                 AsMap(processo["status"])["data"],
			"status_inferido":             AsMap(processo["status"])["inferido"],
			"status_normalizado":          AsMap(processo["status"])["normalizado"],
			"status_tribunal":             AsMap(processo["status"])["tribunal"],
			"tipificacao_identificada":    processo["tipificacao_identificada"],
			"partes":                      processo["partes"],
			"advogados":                   processo["advogados"],
			"processos_relacionados":      processo["processos_relacionados"],
			"dataConsulta":                time.Now().Format(time.RFC3339),
			"fonte":                       "jusbrasil",
			"rank":                        0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// JusbrasilSimpleRows mapeia MP/BNMP/empregador irregular para a aba indicada.
func JusbrasilSimpleRows(payload map[string]any, collectionKey string, tipo string) []map[string]any {
	if tipo == "jusbrasil_bnmp" {
		return jusbrasilBNMPRows(payload, collectionKey, tipo)
	}
	out := []map[string]any{}
	identificacao := AsMap(payload["identificacao"])
	for _, item := range ArrayOfMaps(payload[collectionKey]) {
		row := CleanMap(item)
		row["nome_consultado"] = payload["nome"]
		row["documento_consultado"] = identificacao["valor"]
		row["tipo_documento_consultado"] = identificacao["tipo"]
		row["tipo"] = tipo
		row["fonte"] = "jusbrasil"
		row["rank"] = 0
		row["dataConsulta"] = time.Now().Format(time.RFC3339)
		if len(row) > 4 {
			out = append(out, row)
		}
	}
	return out
}

// JusbrasilBNMPMandadoRows mapeia o endpoint /bnmp legado para a aba mandado.
func JusbrasilBNMPMandadoRows(rows []map[string]any) []map[string]any {
	payload := map[string]any{"mandados": mapsToAnyForMapper(rows)}
	return jusbrasilBNMPRows(payload, "mandados", "jusbrasil_bnmp")
}

// jusbrasilBNMPRows converte BNMP/Jusbrasil para o mesmo shape que a tela de mandado usa.
func jusbrasilBNMPRows(payload map[string]any, collectionKey string, tipo string) []map[string]any {
	out := []map[string]any{}
	identificacao := AsMap(payload["identificacao"])
	for _, item := range ArrayOfMaps(payload[collectionKey]) {
		warrant := AsMap(FirstMapValue(item, "warrant", "mandado"))
		if len(warrant) == 0 {
			warrant = item
		}
		row := CleanMap(map[string]any{
			"nome":                      firstText(item["name"], item["personName"], payload["nome"]),
			"nomeMae":                   firstText(item["motherName"], item["nomeMae"]),
			"nomePai":                   firstText(item["fatherName"], item["nomePai"]),
			"dataNascimento":            firstText(item["birthDate"], item["dataNascimento"]),
			"sexo":                      firstText(item["gender"], item["sexo"]),
			"naturalidade":              firstText(item["birthCity"], item["birthPlace"], item["naturalidade"]),
			"corRaca":                   firstText(item["race"], item["corRaca"]),
			"tipoPessoa":                firstText(item["personType"], item["tipoPessoa"]),
			"mandadoPrisao":             []map[string]any{jusbrasilBNMPMandado(warrant)},
			"contramandado":             []any{},
			"foto":                      []any{},
			"nome_consultado":           payload["nome"],
			"documento_consultado":      identificacao["valor"],
			"tipo_documento_consultado": identificacao["tipo"],
			"tipo":                      tipo,
			"fonte":                     "jusbrasil",
			"rank":                      0,
			"dataConsulta":              time.Now().Format(time.RFC3339),
		})
		if mandados, ok := row["mandadoPrisao"].([]map[string]any); ok && len(mandados) > 0 && len(mandados[0]) > 0 {
			out = append(out, row)
		}
	}
	return out
}

func jusbrasilBNMPMandado(warrant map[string]any) map[string]any {
	return CleanMap(map[string]any{
		"numeroProcesso":               firstText(warrant["processNumber"], warrant["numeroProcesso"]),
		"numeroPeca":                   firstText(warrant["warrantNumber"], warrant["numeroPeca"]),
		"status":                       firstText(warrant["status"]),
		"orgaoJudiciario":              firstText(warrant["courtName"], warrant["orgaoJudiciario"]),
		"tipoPeca":                     firstText(warrant["warrantType"], warrant["tipoPeca"]),
		"especiePrisao":                firstText(warrant["prisonType"], warrant["especiePrisao"]),
		"municipioCustodia":            firstText(warrant["custodyCity"], warrant["municipioCustodia"]),
		"ufCustodia":                   firstText(warrant["custodyState"], warrant["ufCustodia"]),
		"dataExpedicao":                firstText(warrant["issuedAt"], warrant["dataExpedicao"]),
		"dataValidade":                 firstText(warrant["expiresAt"], warrant["dataValidade"]),
		"tipificacaoPenal":             jusbrasilBNMPOffenses(warrant),
		"linkMandadoPrisao":            firstText(warrant["link"], warrant["url"], warrant["linkMandadoPrisao"]),
		"regimePrisional":              firstText(warrant["prisonRegime"], warrant["regimePrisional"]),
		"sinteseDecisao":               firstText(warrant["decisionSummary"], warrant["sinteseDecisao"]),
		"observacao":                   firstText(warrant["observation"], warrant["observacao"]),
		"nomeMagistrado":               firstText(warrant["judgeName"], warrant["nomeMagistrado"]),
		"numeroPrazoPrisao":            firstText(warrant["prisonTerm"], warrant["numeroPrazoPrisao"]),
		"tempoPenaAno":                 warrant["tempoPenaAno"],
		"tempoPenaMes":                 warrant["tempoPenaMes"],
		"tempoPenaDia":                 warrant["tempoPenaDia"],
		"nomeEstabelecimentoPrisional": firstText(warrant["prisonFacilityName"], warrant["nomeEstabelecimentoPrisional"]),
	})
}

func jusbrasilBNMPOffenses(warrant map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, offense := range ArrayOfMaps(FirstMapValue(warrant, "offenses", "tipificacaoPenal")) {
		row := CleanMap(map[string]any{
			"rotuloTipificacaoPenal": firstText(offense["description"], offense["label"], offense["rotuloTipificacaoPenal"]),
			"artigo":                 firstText(offense["article"], offense["artigo"]),
			"lei":                    firstText(offense["law"], offense["lei"]),
		})
		if len(row) > 0 {
			out = append(out, row)
		}
	}
	return out
}

func firstText(values ...any) any {
	for _, value := range values {
		if value == nil {
			continue
		}
		text := strings.TrimSpace(fmt.Sprint(value))
		if text == "" || text == "<nil>" || text == "null" || text == "undefined" {
			continue
		}
		if text != "" {
			return text
		}
	}
	return nil
}

func mapsToAnyForMapper(rows []map[string]any) []any {
	out := make([]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row)
	}
	return out
}
