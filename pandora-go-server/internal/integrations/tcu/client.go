// Package tcu encapsula consultas publicas do TCU usadas por processo externo.
package tcu

import (
	"bytes"
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/mappers"
	"pandora-go-server/internal/modelconfig"
)

// Client consulta bases publicas de acordaos e processos do TCU.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client chamado pelo repository externo de empresa.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// DocumentosResumidos consulta uma base publica por termo formatado.
func (c Client) DocumentosResumidos(ctx context.Context, base, termo string) ([]map[string]any, error) {
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "TCU_PESQUISA_URL", "https://pesquisa.apps.tcu.gov.br/rest/publico/base"), "/")
	if baseURL == "" || !c.model.Ativado {
		return nil, nil
	}
	endpoint := baseURL + "/" + strings.Trim(base, "/") + "/documentosResumidos?termo=" + url.QueryEscape(termo)
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	sharedintegrations.LogExternalCall(ctx, "tcu", http.MethodGet, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("tcu status %d", res.StatusCode)
	}
	var payload map[string]any
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return nil, err
	}
	return mappers.ArrayOfMaps(payload["documentos"]), nil
}

// Condenacoes consulta o servico SOAP de sancoes/condenacoes do TCU por documento.
func (c Client) Condenacoes(ctx context.Context, documento string) ([]map[string]any, error) {
	endpoint := strings.TrimRight(modelVar(c.model.Vars, "TCU_CONDENACOES_URL", "https://contas.tcu.gov.br/sancoes-condenacoesWeb/web/externo/SancoesECondenacoesTCU"), "/")
	if endpoint == "" || !c.model.Ativado {
		return nil, nil
	}
	body := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ext="http://externo.web.sancoescondenacoes.tcu.gov.br/">
  <soapenv:Header/>
  <soapenv:Body>
    <ext:recuperaCondenacoesPorCpfCnpj>
      <cpfCnpj>%s</cpfCnpj>
    </ext:recuperaCondenacoesPorCpfCnpj>
  </soapenv:Body>
</soapenv:Envelope>`, xmlEscape(documento))
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, bytes.NewBufferString(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	raw, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return nil, readErr
	}
	sharedintegrations.LogExternalCall(ctx, "tcu.condenacoes", http.MethodPost, res.StatusCode, time.Since(start), safePath(endpoint))
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("tcu condenacoes status %d", res.StatusCode)
	}
	return parseSOAPRows(raw), nil
}

func parseSOAPRows(raw []byte) []map[string]any {
	decoder := xml.NewDecoder(bytes.NewReader(raw))
	var out []map[string]any
	var current map[string]any
	var currentKey string
	for {
		token, err := decoder.Token()
		if err != nil {
			break
		}
		switch t := token.(type) {
		case xml.StartElement:
			name := t.Name.Local
			if strings.Contains(strings.ToLower(name), "conden") || strings.EqualFold(name, "return") || strings.EqualFold(name, "item") {
				if current == nil {
					current = map[string]any{}
				}
			} else if current != nil {
				currentKey = name
			}
		case xml.CharData:
			if current != nil && currentKey != "" {
				value := strings.TrimSpace(string(t))
				if value != "" {
					current[currentKey] = value
				}
			}
		case xml.EndElement:
			name := t.Name.Local
			if current != nil && (strings.Contains(strings.ToLower(name), "conden") || strings.EqualFold(name, "return") || strings.EqualFold(name, "item")) {
				if len(current) > 0 {
					out = append(out, current)
				}
				current = nil
			}
			currentKey = ""
		}
	}
	return out
}

func xmlEscape(value string) string {
	var b bytes.Buffer
	_ = xml.EscapeText(&b, []byte(value))
	return b.String()
}

func modelVar(vars map[string]any, key, fallback string) string {
	if vars == nil {
		return fallback
	}
	text := strings.TrimSpace(fmt.Sprint(vars[key]))
	if text == "" || text == "<nil>" {
		return fallback
	}
	return text
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}
