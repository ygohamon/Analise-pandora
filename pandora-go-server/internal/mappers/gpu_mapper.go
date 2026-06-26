package mappers

import "fmt"

// GPUSimplificadoAdvogado transforma a resposta GPU em linhas da tabela resumida.
func GPUSimplificadoAdvogado(payload map[string]any, fonte string) []map[string]any {
	advogado := mapFrom(payload["advogado"])
	if len(advogado) == 0 {
		return nil
	}
	return []map[string]any{{
		"cpf":   clean(advogado["cpf"]),
		"nome":  clean(advogado["nome"]),
		"tipo":  "advogado",
		"foto":  first(advogado["foto"], mapFrom(advogado["fotos"])["foto_base64"]),
		"fonte": fonte,
	}}
}

// GPUSimplificadoPreso transforma a resposta GPU em linhas da tabela resumida.
func GPUSimplificadoPreso(payload map[string]any, fonte string) []map[string]any {
	preso := mapFrom(payload["preso_resumido"])
	if len(preso) == 0 {
		return nil
	}
	basicos := mapFrom(preso["dados_basicos"])
	if len(basicos) == 0 {
		basicos = preso
	}
	return []map[string]any{{
		"cpf":   clean(basicos["cpf"]),
		"nome":  clean(basicos["nome"]),
		"tipo":  "preso",
		"foto":  first(basicos["foto_base64"], basicos["foto"]),
		"fonte": fonte,
	}}
}

// GPUDetalhadoAdvogado preserva dados completos de advogado e normaliza campos principais.
func GPUDetalhadoAdvogado(payload map[string]any, cpf string, fonte string) []map[string]any {
	if len(payload) == 0 {
		return nil
	}
	identificacao := firstGPUMap(mapFrom(payload["identificacao"]), mapFrom(payload["dados_agrupados"]))
	dados := firstGPUMap(firstMapFromSlice(identificacao["dados"]), identificacao)
	if len(dados) == 0 && payload["advogado_id"] == nil {
		return nil
	}
	visitas := mapFrom(payload["visitas"])
	return []map[string]any{{
		"cpf":               first(dados["cpf"], cpf),
		"nome":              clean(dados["nome"]),
		"oab":               first(dados["documento"], dados["oab"]),
		"foto":              first(dados["foto"], mapFrom(dados["fotos"])["foto_base64"]),
		"id":                payload["advogado_id"],
		"tipo":              "advogado",
		"visitas":           first(visitas["dados"], payload["visitas"]),
		"paginacao_visitas": nil,
		"fonte":             fonte,
	}}
}

// GPUDetalhadoPreso preserva dados completos de preso e normaliza campos principais.
func GPUDetalhadoPreso(payload map[string]any, cpf string, fonte string) []map[string]any {
	if len(payload) == 0 {
		return nil
	}
	agrupados := mapFrom(payload["dados_agrupados"])
	preso := mapFrom(agrupados["dados_do_preso"])
	docs := mapFrom(preso["documentos_identificacao"])
	info := mapFrom(preso["informacoes_pessoais"])
	if len(agrupados) == 0 {
		preso = mapFrom(payload["dados_basicos"])
		docs = preso
		info = preso
	}
	if len(docs) == 0 && len(info) == 0 {
		return nil
	}
	endereco := mapFrom(agrupados["cadastro_de_enderecos"])
	return []map[string]any{{
		"cpf":                 first(docs["cpf"], cpf),
		"nome":                clean(info["nome"]),
		"matricula":           docs["matricula"],
		"foto":                first(mapFrom(preso["fotos"])["foto_base64"], preso["foto_base64"]),
		"rg":                  docs["rg"],
		"regimento":           preso["regime"],
		"mae":                 info["mae"],
		"pai":                 info["pai"],
		"id_preso":            docs["id_preso"],
		"tipo":                "preso",
		"bairro":              endereco["bairro"],
		"cep":                 endereco["cep"],
		"cidade":              endereco["cidade"],
		"logradouro":          endereco["logradouro"],
		"numero":              endereco["numero"],
		"telefone":            endereco["telefone"],
		"estado":              endereco["estado"],
		"celas":               first(agrupados["historico_de_celas"], []any{}),
		"movimentacoes":       first(agrupados["historico_de_movimentacoes"], []any{}),
		"sinais":              first(agrupados["sinais_do_preso"], []any{}),
		"ultima_movimentacao": agrupados["ultima_movimentacao_cadastrada"],
		"atendimentos":        []any{},
		"visitas":             first(agrupados["rol_de_visitantes"], []any{}),
		"locacoes":            []any{},
		"fonte":               fonte,
	}}
}

func mapFrom(value any) map[string]any {
	if row, ok := value.(map[string]any); ok {
		return row
	}
	return map[string]any{}
}

func firstGPUMap(values ...map[string]any) map[string]any {
	for _, value := range values {
		if len(value) > 0 {
			return value
		}
	}
	return map[string]any{}
}

func firstMapFromSlice(value any) map[string]any {
	rows, ok := value.([]any)
	if !ok || len(rows) == 0 {
		return map[string]any{}
	}
	return mapFrom(rows[0])
}

func first(values ...any) any {
	for _, value := range values {
		if clean(value) != "" {
			return value
		}
	}
	return nil
}

func clean(value any) string {
	text := fmt.Sprint(value)
	if text == "" || text == "<nil>" {
		return ""
	}
	return text
}
