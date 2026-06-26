// Package seeu encapsula a chamada SOAP ao servico SEEU.
package seeu

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"html"
	"io"
	"net/http"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/modelconfig"
)

// Client consulta sentenciados por nome/CPF no SEEU.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client chamado por repositories externos de pessoa.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// ListarSentenciadoPorFiltro chama listarSentenciadoPorFiltro e retorna mapas normalizados.
func (c Client) ListarSentenciadoPorFiltro(ctx context.Context, nome, cpf string) ([]map[string]any, error) {
	wsdl := strings.TrimSpace(modelVar(c.model.Vars, "WSDL"))
	if wsdl == "" || !c.model.Ativado || len(cpf) != 11 || strings.TrimSpace(nome) == "" {
		return nil, nil
	}
	endpoint := strings.TrimSuffix(wsdl, "?wsdl")
	body := c.soapEnvelope(nome, cpf)
	reqCtx, cancel := context.WithTimeout(ctx, oauthjson.Timeout(c.model, 2*time.Minute))
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost, endpoint, strings.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", "")
	start := time.Now()
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	raw, _ := io.ReadAll(res.Body)
	sharedintegrations.LogExternalCall(ctx, "seeu", http.MethodPost, res.StatusCode, time.Since(start), "")
	if res.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("seeu status %d", res.StatusCode)
	}
	return parseSEEUReturn(raw), nil
}

func (c Client) soapEnvelope(nome, cpf string) string {
	password := seeuPassword(modelVar(c.model.Vars, "senha"))
	return fmt.Sprintf(`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><listarSentenciadoPorFiltro><nome>%s</nome><cpf>%s</cpf><usuario>%s</usuario><senha>%s</senha><pagina>%s</pagina></listarSentenciadoPorFiltro></soapenv:Body></soapenv:Envelope>`,
		html.EscapeString(nome),
		html.EscapeString(cpf),
		html.EscapeString(modelVar(c.model.Vars, "usuario")),
		html.EscapeString(password),
		html.EscapeString(modelVar(c.model.Vars, "pagina")),
	)
}

func seeuPassword(seed string) string {
	now := time.Now().In(time.FixedZone("America/Fortaleza", -3*60*60))
	sum := md5.Sum([]byte(fmt.Sprintf("%s%04d%02d%02d", seed, now.Year(), now.Month(), now.Day())))
	return hex.EncodeToString(sum[:])
}

func parseSEEUReturn(raw []byte) []map[string]any {
	decoder := xml.NewDecoder(bytes.NewReader(raw))
	rows := []map[string]any{}
	current := map[string]any{}
	var stack []string
	for {
		token, err := decoder.Token()
		if err != nil {
			break
		}
		switch typed := token.(type) {
		case xml.StartElement:
			name := typed.Name.Local
			stack = append(stack, name)
			if strings.EqualFold(name, "return") && len(current) > 0 {
				rows = append(rows, current)
				current = map[string]any{}
			}
		case xml.CharData:
			if len(stack) == 0 {
				continue
			}
			text := strings.TrimSpace(string(typed))
			if text == "" {
				continue
			}
			key := stack[len(stack)-1]
			if key != "Envelope" && key != "Body" && key != "return" {
				current[key] = text
			}
		case xml.EndElement:
			if strings.EqualFold(typed.Name.Local, "return") && len(current) > 0 {
				rows = append(rows, current)
				current = map[string]any{}
			}
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}
		}
	}
	if len(current) > 0 {
		rows = append(rows, current)
	}
	return rows
}

func modelVar(vars map[string]any, key string) string {
	if vars == nil {
		return ""
	}
	text := strings.TrimSpace(fmt.Sprint(vars[key]))
	if text == "<nil>" {
		return ""
	}
	return text
}
