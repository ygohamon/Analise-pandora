package pessoa

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"

	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/modelconfig"
)

var receitaFederalSession = oauthjson.Session{}
var sismpSession = oauthjson.Session{}

// consultaReceitaFederalCPF consulta a Receita online e retorna linhas para a aba pessoa.
func (m pessoaIntegradoExternoModel) consultaReceitaFederalCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	model, ok := m.models.Get("RECEITA_FEDERAL_API")
	if !ok || !model.Ativado {
		return nil, nil
	}
	baseURL := strings.TrimRight(modelVar(model.Vars, "URL"), "/")
	if baseURL == "" {
		return nil, nil
	}
	token, err := receitaFederalSession.Token(ctx, model, true)
	if err != nil {
		return nil, err
	}
	endpoint := baseURL + "/integracaoreceitafederalapi/ConsultarCPF?listaCPF=" + url.QueryEscape(cpf)
	payload, err := oauthjson.GetJSON(ctx, model, "receita_federal", endpoint, token, nil)
	if err != nil {
		return nil, err
	}
	row := cleanMap(map[string]any{
		"cpf":                  payload["cpf"],
		"nome":                 payload["nome"],
		"situacaoCadastral":    payload["situacaoCadastral"],
		"residenteExterior":    payload["residenteExterior"],
		"nomePaisExterior":     payload["nomePaisExterior"],
		"nomeMae":              payload["nomeMae"],
		"dataNascimento":       payload["dataNascimento"],
		"municipio":            payload["municipio"],
		"uf":                   payload["uf"],
		"sexo":                 payload["sexo"],
		"naturezaOcupacao":     payload["naturezaOcupacao"],
		"ocupacaoPrincipal":    payload["ocupacaoPrincipal"],
		"anoExercicioOcupacao": payload["exercicioOcupacao"],
		"endereco":             strings.TrimSpace(fmt.Sprintf("%v %v, %v", payload["tipoLogradouro"], payload["logradouro"], payload["numeroLogradouro"])),
		"complemento":          payload["complemento"],
		"cep":                  payload["cep"],
		"telefone":             strings.TrimSpace(fmt.Sprintf("%v %v", payload["ddd"], payload["telefone"])),
		"anoObito":             payload["anoObito"],
		"estrangeiro":          payload["estrangeiro"],
		"dataAtualizacao":      payload["dataAtualizacao"],
		"tituloEleitor":        payload["tituloEleitor"],
		"fonte":                oauthjson.SourceSigla(model, "RFBON"),
		"rank":                 1,
	})
	if len(row) <= 2 {
		return nil, nil
	}
	return []map[string]any{row}, nil
}

// consultaSISMPCPF consulta o endpoint agregado uma unica vez e retorna abas derivadas.
func (m pessoaIntegradoExternoModel) consultaSISMPCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	model, ok := m.models.Get("SISMP_API")
	if !ok || !model.Ativado {
		return nil, nil
	}
	payload, err := m.sismpPessoaAgregada(ctx, model, cpf)
	if err != nil {
		return []SourceResult{{Name: "sismp.pessoas_agregadas", Category: "pessoa", Err: err}}, nil
	}
	return []SourceResult{
		{Name: "sismp.pessoa", Category: "pessoa", Rows: m.mapSISMPPessoaRows(model, payload)},
		{Name: "sismp.antecedente", Category: "antecedente", Rows: m.mapSISMPAntecedenteRows(model, payload)},
	}, nil
}

func (m pessoaIntegradoExternoModel) mapSISMPPessoaRows(model modelconfig.Model, payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, pessoa := range arrayOfMaps(payload["content"]) {
		base := map[string]any{}
		if pessoas := arrayOfMaps(pessoa["pessoas"]); len(pessoas) > 0 {
			base = pessoas[0]
		}
		situacao := asMap(base["situacao"])
		row := cleanMap(map[string]any{
			"nome":                 pessoa["nome"],
			"nomeMae":              pessoa["nomeMae"],
			"nomePai":              pessoa["nomePai"],
			"dataNascimento":       pessoa["dataNascimento"],
			"rgs":                  firstArrayValue(pessoa["rgsCompletos"]),
			"cpf":                  base["cpf"],
			"origem":               base["origem"],
			"situacaoDesaparecida": situacao["desaparecida"],
			"situacaoObito":        situacao["obito"],
			"confidencial":         pessoa["confidencial"],
			"fonte":                oauthjson.SourceSigla(model, "SISMP"),
			"rank":                 1,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

func (m pessoaIntegradoExternoModel) mapSISMPAntecedenteRows(model modelconfig.Model, payload map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, pessoa := range arrayOfMaps(payload["content"]) {
		row := cleanMap(map[string]any{
			"nome":  pessoa["nome"],
			"rg":    firstArrayValue(pessoa["rgs"]),
			"fonte": oauthjson.SourceSigla(model, "SISMP"),
			"rank":  0,
		})
		if len(row) > 2 {
			out = append(out, row)
		}
	}
	return out
}

func (m pessoaIntegradoExternoModel) sismpPessoaAgregada(ctx context.Context, model modelconfig.Model, cpf string) (map[string]any, error) {
	baseURL := strings.TrimRight(modelVar(model.Vars, "URL"), "/")
	if baseURL == "" {
		return nil, nil
	}
	token, err := sismpSession.Token(ctx, model, false)
	if err != nil {
		return nil, err
	}
	return oauthjson.GetJSON(ctx, model, "sismp", baseURL+"/pessoas/agregadas?cpf="+url.QueryEscape(cpf), token, nil)
}

// AntecedentePDFRG gera a folha de antecedentes pelo SISMP para a rota /antecedentes/rg/{rg}/{login}.
func (m SQLRepository) AntecedentePDFRG(ctx context.Context, rg string, login string) ([]map[string]any, error) {
	model, ok := m.models.Get("SISMP_API")
	if !ok || !model.Ativado {
		return nil, nil
	}
	usuarioCPF, usuarioNome, err := m.usuarioConsultaAntecedente(ctx, login)
	if err != nil {
		return nil, err
	}
	baseURL := strings.TrimRight(modelVar(model.Vars, "URL"), "/")
	if baseURL == "" {
		return nil, nil
	}
	token, err := sismpSession.Token(ctx, model, false)
	if err != nil {
		return nil, err
	}
	headers := map[string]string{
		"X-USER-IP":               modelVar(model.Vars, "IP"),
		"X-CODIGO-ACAO":           modelVar(model.Vars, "ACAO"),
		"X-CODIGO-FUNCIONALIDADE": modelVar(model.Vars, "FUNCIONALIDADE"),
	}
	payload, err := oauthjson.PostJSON(ctx, model, "sismp.antecedente_pdf", baseURL+"/relatorios/folha-antecedentes/judiciario", token, headers, map[string]any{
		"rg":          rg,
		"cpfUsuario":  usuarioCPF,
		"nomeUsuario": usuarioNome,
	})
	if err != nil || payload == nil {
		return nil, err
	}
	base64PDF := cleanText(payload["base64"])
	if base64PDF == "" {
		return nil, nil
	}
	pdf, err := decodeBase64(base64PDF)
	if err != nil {
		return nil, err
	}
	return []map[string]any{cleanMap(map[string]any{
		"nomeArquivo":      firstNonEmptyText(payload["nomeArquivo"], "documento.pdf"),
		"tamanhoDocumento": payload["tamanhoDocumento"],
		"pdfBuffer": map[string]any{
			"type": "Buffer",
			"data": bytesToInts(pdf),
		},
		"fonte": oauthjson.SourceSigla(model, "SISMP"),
	})}, nil
}

func (m SQLRepository) usuarioConsultaAntecedente(ctx context.Context, login string) (string, string, error) {
	usuario, ok := m.models.Table("BD_PANDORA", "USUARIO")
	if !ok || m.db == nil {
		return "", "", nil
	}
	pessoa, _ := m.models.Table("BD_PANDORA", "PESSOA")
	if pessoa == "" {
		return "", "", nil
	}
	var cpf, nome sql.NullString
	err := m.db.QueryRowContext(ctx, `
SELECT TOP 1 PU.cpf, PU.nome
FROM `+usuario+` U
INNER JOIN `+pessoa+` PU ON (U.id_pessoa = PU.id)
WHERE LOWER(LTRIM(RTRIM(U.login))) = LOWER(LTRIM(RTRIM(@LOGIN)))`,
		sql.Named("LOGIN", login),
	).Scan(&cpf, &nome)
	if err == sql.ErrNoRows {
		return "", "", nil
	}
	if err != nil {
		return "", "", err
	}
	return strings.TrimSpace(cpf.String), strings.TrimSpace(nome.String), nil
}

func firstArrayValue(value any) any {
	switch typed := value.(type) {
	case []any:
		if len(typed) > 0 {
			return typed[0]
		}
	}
	return nil
}

func bytesToInts(raw []byte) []int {
	out := make([]int, len(raw))
	for i, value := range raw {
		out[i] = int(value)
	}
	return out
}

func decodeBase64(value string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(strings.TrimSpace(value))
}

func firstNonEmptyText(values ...any) string {
	for _, value := range values {
		if text := cleanText(value); text != "" {
			return text
		}
	}
	return ""
}
