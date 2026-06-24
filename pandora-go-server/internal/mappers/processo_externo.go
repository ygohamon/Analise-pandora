package mappers

import (
	"fmt"
	"strings"
)

// TJSPProcessoRows mapeia processos CAEX/TJSP para a aba processo.
// Chamado pelos repositories externos de pessoa e empresa.
func TJSPProcessoRows(rows []map[string]any, fonte string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(map[string]any{
			"processo":                    item["processo"],
			"competencia":                 item["competencia"],
			"foro":                        item["foro"],
			"codigo_localidade":           item["codigo_localidade"],
			"assunto":                     item["assunto"],
			"classe":                      item["classe"],
			"orgao_julgador_nome":         item["orgao_julgador_nome"],
			"nivel_sigilo":                item["nivel_sigilo"],
			"intervencao_mp":              item["intervencao_mp"],
			"data_ajuizamento":            item["data_ajuizamento"],
			"polo":                        item["polo"],
			"parte_nome":                  item["parte_nome"],
			"assistencia_judiciaria":      item["assistencia_judiciaria"],
			"sexo":                        item["sexo"],
			"intimacao_pendente":          item["intimacao_pendente"],
			"nome_genitora":               item["nome_genitora"],
			"nome_genitor":                item["nome_genitor"],
			"data_nascimento":             item["data_nascimento"],
			"numero_documento_principal":  item["numero_documento_principal"],
			"tipo_pessoa":                 item["tipo_pessoa"],
			"cidade_natural":              item["cidade_natural"],
			"nacionalidade":               item["nacionalidade"],
			"codigo_documento":            item["codigo_documento"],
			"tipo_documento":              item["tipo_documento"],
			"endereco":                    item["endereco"],
			"advogado_nome":               item["advogado_nome"],
			"advogado_inscricao":          item["advogado_inscricao"],
			"advogado_tipo_representante": item["advogado_tipo_representante"],
			"fonte":                       fallbackFonte(fonte, "TJSP"),
			"tipo":                        "tjsp",
			"rank":                        0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// SEEURows mapeia retorno SEEU para processo ou sentenciado.
// Chamado pelo repository externo de pessoa quando o perfil permite SEEU.
func SEEURows(rows []map[string]any, category string, fonte string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(map[string]any{
			"assuntoPrincipal":                item["assuntoPrincipal"],
			"classe":                          item["classe"],
			"codAssuntoPrincipal":             item["codAssuntoPrincipal"],
			"codClasse":                       item["codClasse"],
			"codForum":                        item["codForum"],
			"codPais":                         item["codPais"],
			"codTribunal":                     item["codTribunal"],
			"codVaraExecucaoPenal":            item["codVaraExecucaoPenal"],
			"cpf":                             item["cpf"],
			"dataDistribuicao":                item["dataDistribuicao"],
			"dataInicioCumprimento":           item["dataInicioCumprimento"],
			"dataNascimento":                  item["dataNascimento"],
			"estahEmLivramentoCondicional":    simNao(item["estahEmLivramentoCondicional"]),
			"estahEmPenaSubstitutiva":         simNao(item["estahEmPenaSubstitutiva"]),
			"estahEmSursis":                   simNao(item["estahEmSursis"]),
			"estahForagido":                   simNao(item["estahForagido"]),
			"estrangeiro":                     simNao(item["estrangeiro"]),
			"extinto":                         simNao(item["extinto"]),
			"flagRegime":                      item["flagRegime"],
			"flagSituacao":                    item["flagSituacao"],
			"medidaSeguranca":                 simNao(item["medidaSeguranca"]),
			"naturalidade":                    item["naturalidade"],
			"nivelSigiloProcesso":             item["nivelSigiloProcesso"],
			"nome":                            item["nome"],
			"nomeForum":                       item["nomeForum"],
			"nomeMae":                         item["nomeMae"],
			"nomePai":                         item["nomePai"],
			"nomeTribunal":                    item["nomeTribunal"],
			"nomeVaraExecucaoPenal":           item["nomeVaraExecucaoPenal"],
			"numeroProcesso":                  item["numeroProcesso"],
			"numeroUnico":                     item["numeroUnico"],
			"pais":                            item["pais"],
			"penaTotalImposta":                item["penaTotalImposta"],
			"regimePena":                      item["regimePena"],
			"rgOrgaoExpedidor":                item["rgOrgaoExpedidor"],
			"rgParte":                         item["rgParte"],
			"sexo":                            item["sexo"],
			"siglaUfRg":                       item["siglaUfRg"],
			"statusProcesso":                  item["statusProcesso"],
			"tipoPenal":                       item["tipoPenal"],
			"tipoPessoa":                      item["tipoPessoa"],
			"totalCondenacaoExtintaIndultada": item["totalCondenacaoExtintaIndultada"],
			"totalInterrupcao":                item["totalInterrupcao"],
			"totalRemicaoDias":                item["totalRemicaoDias"],
			"fonte":                           fallbackFonte(fonte, "SEEU"),
			"tipo":                            category,
			"rank":                            0,
		})
		if hasUsefulSEEU(row) {
			out = append(out, row)
		}
	}
	return out
}

// TCURows mapeia acordaos/processos do TCU para a aba processo.
func TCURows(rows []map[string]any, tipo string, fonte string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, item := range rows {
		row := CleanMap(map[string]any{
			"tipo":            tipo,
			"titulo":          FirstMapValue(item, "TITULO", "TITULOCOMPLETO", "titulo"),
			"dataSessao":      FirstMapValue(item, "DATASESSAO", "dataSessao"),
			"situacao":        FirstMapValue(item, "SITUACAO", "situacao"),
			"colegiado":       FirstMapValue(item, "COLEGIADO", "colegiado"),
			"dataAtualizacao": FirstMapValue(item, "DTATUALIZACAO", "dataAtualizacao"),
			"sumario":         FirstMapValue(item, "SUMARIO", "sumario"),
			"relator":         FirstMapValue(item, "RELATOR", "relator"),
			"tipoProcesso":    FirstMapValue(item, "TIPO", "tipoProcesso"),
			"numeroProcesso":  FirstMapValue(item, "NUMEROFORMATADO", "numeroProcesso"),
			"status":          FirstMapValue(item, "ESTADO", "status"),
			"assunto":         strings.TrimSpace(fmt.Sprint(FirstMapValue(item, "ASSUNTO", "assunto"))),
			"link":            FirstMapValue(item, "URLARQUIVOPDF", "URLSISTEMAPUSH", "link"),
			"fonte":           fallbackFonte(fonte, "TCU"),
			"rank":            0,
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

// ReceitaFederalSocioRows mapeia sociedade da Receita online para historico_quadro_societario.
func ReceitaFederalSocioRows(payload map[string]any, fonte string) []map[string]any {
	sociedade := ArrayOfMaps(payload["sociedade"])
	out := make([]map[string]any, 0, len(sociedade))
	for _, item := range sociedade {
		documento := fmt.Sprint(item["numero"])
		tipoSocio := tipoSocioReceita(documento, item["tipo"])
		row := CleanMap(map[string]any{
			"tipo":                    tipoSocio,
			"nome":                    item["nome"],
			"razaoSocial":             item["nome"],
			"cpf":                     socioCPFReceita(documento),
			"cnpj":                    socioCNPJReceita(documento),
			"numero":                  item["numero"],
			"documentoSocio":          item["numero"],
			"percentualParticipacao":  item["percentualParticipacao"],
			"percCapital":             item["percentualParticipacao"],
			"codigoPaisOrigem":        item["codigoPaisOrigem"],
			"nomePaisOrigem":          item["nomePaisOrigem"],
			"fonte":                   fallbackFonte(fonte, "RFBON"),
			"rank":                    0,
			"vinculo":                 item["tipo"],
			"DOCUMENTO_SOCIO":         item["numero"],
			"SOCIO":                   item["nome"],
			"VL_PARTICIPACAO":         item["percentualParticipacao"],
			"ORIGEM_INFORMACAO":       fallbackFonte(fonte, "RFBON"),
			"historicoSocietarioTipo": "receita_online",
		})
		if len(row) > 3 {
			out = append(out, row)
		}
	}
	return out
}

func tipoSocioReceita(documento string, tipo any) string {
	digits := onlyDigitsText(documento)
	if len(digits) == 14 {
		return "pj-pj"
	}
	if len(digits) == 11 {
		return "pj-pf"
	}
	text := strings.ToUpper(strings.TrimSpace(fmt.Sprint(tipo)))
	if strings.Contains(text, "JUR") || strings.Contains(text, "PJ") {
		return "pj-pj"
	}
	return "pj-pf"
}

func socioCPFReceita(documento string) string {
	digits := onlyDigitsText(documento)
	if len(digits) == 11 {
		return digits
	}
	return ""
}

func socioCNPJReceita(documento string) string {
	digits := onlyDigitsText(documento)
	if len(digits) == 14 {
		return digits
	}
	return ""
}

func onlyDigitsText(value string) string {
	var b strings.Builder
	for _, r := range value {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func simNao(value any) any {
	switch strings.ToUpper(strings.TrimSpace(fmt.Sprint(value))) {
	case "S":
		return "Sim"
	case "N":
		return "Não"
	default:
		return value
	}
}

func hasUsefulSEEU(row map[string]any) bool {
	for _, key := range []string{"nome", "cpf", "numeroProcesso", "numeroUnico", "statusProcesso", "nomeTribunal", "regimePena"} {
		if value := FirstMapValue(row, key); value != nil {
			return true
		}
	}
	return false
}

func fallbackFonte(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return strings.TrimSpace(value)
}
