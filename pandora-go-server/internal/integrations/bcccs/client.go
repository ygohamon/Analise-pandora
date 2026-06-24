// Package bcccs encapsula as chamadas HTTP da API BCCCS/PIX do Banco Central.
package bcccs

import (
	"bytes"
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	sharedintegrations "pandora-go-server/internal/integrations"
	"pandora-go-server/internal/modelconfig"
)

// Client consulta a API externa; quem chama e orquestra e o BCCCSUseCase.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client a partir do model API_BCCCS.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// VinculosPorDocumento consulta chaves PIX por CPF/CNPJ e retorna os vinculos crus.
func (c Client) VinculosPorDocumento(ctx context.Context, documento string, motivo string) ([]map[string]any, error) {
	endpoint, err := c.endpoint("/consultar-vinculos-pix", url.Values{
		"cpfCnpj": []string{documento},
		"motivo":  []string{motivo},
	})
	if err != nil {
		return nil, err
	}
	raw, err := c.get(ctx, endpoint)
	if err != nil {
		return nil, err
	}
	payload, err := decodeVinculosPix(raw)
	if err != nil {
		logDecodeError(ctx, endpoint, len(raw), err)
		return nil, err
	}
	return payload.VinculosPix, nil
}

// VinculoPorChave consulta uma chave PIX especifica e retorna uma lista compativel com a tela.
func (c Client) VinculoPorChave(ctx context.Context, chave string, motivo string) ([]map[string]any, error) {
	endpoint, err := c.endpoint("/consultar-vinculo-pix", url.Values{
		"chave":  []string{chave},
		"motivo": []string{motivo},
	})
	if err != nil {
		return nil, err
	}
	raw, err := c.get(ctx, endpoint)
	if err != nil {
		return nil, err
	}
	payload, err := decodeVinculoPix(raw)
	if err != nil {
		logDecodeError(ctx, endpoint, len(raw), err)
		return nil, err
	}
	if allValuesNil(payload) {
		return []map[string]any{}, nil
	}
	return []map[string]any{payload}, nil
}

func (c Client) endpoint(path string, query url.Values) (string, error) {
	base := strings.TrimRight(modelVar(c.model.Vars, "PIX_URL"), "/")
	if base == "" || !c.model.Ativado {
		return "", fmt.Errorf("api bcccs not configured")
	}
	return base + path + "?" + query.Encode(), nil
}

func (c Client) get(ctx context.Context, endpoint string) ([]byte, error) {
	reqCtx, cancel := context.WithTimeout(ctx, timeout(c.model, 3*time.Second))
	defer cancel()

	start := time.Now()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	if auth := modelVar(c.model.Vars, "PIX_AUTHORIZATION"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	req.Header.Set("Accept", "application/json")
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	raw, readErr := io.ReadAll(res.Body)
	slog.InfoContext(ctx, "external api call", append(sharedintegrations.LogAttrs(ctx, "bcccs"),
		"source", "pix",
		"method", http.MethodGet,
		"path", safePath(endpoint),
		"status", res.StatusCode,
		"duration_ms", time.Since(start).Milliseconds(),
		"content_type", res.Header.Get("Content-Type"),
		"body_bytes", len(raw),
	)...)
	if readErr != nil {
		return nil, readErr
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("bcccs status %d", res.StatusCode)
	}
	return raw, nil
}

type vinculosPixPayload struct {
	VinculosPix []map[string]any `json:"vinculosPix"`
}

func decodeVinculosPix(raw []byte) (vinculosPixPayload, error) {
	var payload vinculosPixPayload
	normalized := normalizeJSONBody(raw)
	if len(normalized) == 0 || bytes.Equal(normalized, []byte("null")) {
		payload.VinculosPix = []map[string]any{}
		return payload, nil
	}
	if err := json.Unmarshal(normalized, &payload); err != nil {
		xmlRows, xmlErr := decodeXMLRows(normalized, "vinculoPix", "vinculo")
		if xmlErr == nil {
			payload.VinculosPix = xmlRows
			return payload, nil
		}
		return payload, err
	}
	if payload.VinculosPix == nil {
		payload.VinculosPix = []map[string]any{}
	}
	return payload, nil
}

func decodeVinculoPix(raw []byte) (map[string]any, error) {
	normalized := normalizeJSONBody(raw)
	if len(normalized) == 0 || bytes.Equal(normalized, []byte("null")) {
		return map[string]any{}, nil
	}
	var payload map[string]any
	if err := json.Unmarshal(normalized, &payload); err != nil {
		xmlRow, xmlErr := decodeXMLMap(normalized)
		if xmlErr == nil {
			return xmlRow, nil
		}
		return nil, err
	}
	if payload == nil {
		return map[string]any{}, nil
	}
	return payload, nil
}

func normalizeJSONBody(raw []byte) []byte {
	trimmed := bytes.TrimSpace(raw)
	return bytes.TrimPrefix(trimmed, []byte{0xEF, 0xBB, 0xBF})
}

func logDecodeError(ctx context.Context, endpoint string, bodyBytes int, err error) {
	slog.WarnContext(ctx, "external api decode error", append(sharedintegrations.LogAttrs(ctx, "bcccs"),
		"source", "pix",
		"path", safePath(endpoint),
		"body_bytes", bodyBytes,
		"decode_error", err.Error(),
	)...)
}

type xmlNode struct {
	Name     string
	Text     strings.Builder
	Children []*xmlNode
}

func decodeXMLRows(raw []byte, preferredNames ...string) ([]map[string]any, error) {
	root, err := parseXML(raw)
	if err != nil {
		return nil, err
	}
	rows := []map[string]any{}
	collectXMLRows(root, &rows, preferredNames...)
	if len(rows) == 0 {
		row := xmlNodeToMap(root)
		if len(row) > 0 {
			rows = append(rows, row)
		}
	}
	return rows, nil
}

func decodeXMLMap(raw []byte) (map[string]any, error) {
	root, err := parseXML(raw)
	if err != nil {
		return nil, err
	}
	return xmlNodeToMap(root), nil
}

func parseXML(raw []byte) (*xmlNode, error) {
	decoder := xml.NewDecoder(bytes.NewReader(raw))
	var stack []*xmlNode
	var root *xmlNode
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		switch typed := token.(type) {
		case xml.StartElement:
			node := &xmlNode{Name: typed.Name.Local}
			if len(stack) > 0 {
				parent := stack[len(stack)-1]
				parent.Children = append(parent.Children, node)
			}
			stack = append(stack, node)
			if root == nil {
				root = node
			}
		case xml.CharData:
			if len(stack) > 0 {
				stack[len(stack)-1].Text.Write([]byte(typed))
			}
		case xml.EndElement:
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
			}
		}
	}
	if root == nil {
		return nil, fmt.Errorf("empty xml")
	}
	return root, nil
}

func collectXMLRows(node *xmlNode, out *[]map[string]any, preferredNames ...string) {
	for _, name := range preferredNames {
		if strings.EqualFold(node.Name, name) {
			row := xmlNodeToMap(node)
			if len(row) > 0 {
				*out = append(*out, row)
			}
			return
		}
	}
	for _, child := range node.Children {
		collectXMLRows(child, out, preferredNames...)
	}
}

func xmlNodeToMap(node *xmlNode) map[string]any {
	out := map[string]any{}
	if len(node.Children) == 0 {
		text := strings.TrimSpace(node.Text.String())
		if text != "" {
			out[node.Name] = text
		}
		return out
	}
	for _, child := range node.Children {
		value := xmlNodeValue(child)
		if value == nil {
			continue
		}
		if existing, ok := out[child.Name]; ok {
			switch typed := existing.(type) {
			case []any:
				out[child.Name] = append(typed, value)
			default:
				out[child.Name] = []any{typed, value}
			}
			continue
		}
		out[child.Name] = value
	}
	return out
}

func xmlNodeValue(node *xmlNode) any {
	if len(node.Children) == 0 {
		text := strings.TrimSpace(node.Text.String())
		if text == "" {
			return nil
		}
		return text
	}
	return xmlNodeToMap(node)
}

func timeout(model modelconfig.Model, fallback time.Duration) time.Duration {
	text := modelVar(model.Vars, "TIMEOUT")
	if text == "" {
		return fallback
	}
	if parsed, err := time.ParseDuration(text); err == nil {
		return parsed
	}
	var milliseconds int
	if _, err := fmt.Sscanf(text, "%d", &milliseconds); err == nil && milliseconds > 0 {
		return time.Duration(milliseconds) * time.Millisecond
	}
	return fallback
}

func modelVar(vars map[string]any, key string) string {
	return strings.TrimSpace(fmt.Sprint(vars[key]))
}

func safePath(endpoint string) string {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return ""
	}
	return parsed.Path
}

func allValuesNil(row map[string]any) bool {
	if len(row) == 0 {
		return true
	}
	for _, value := range row {
		if value == nil {
			continue
		}
		if text, ok := value.(string); ok && strings.TrimSpace(text) == "" {
			continue
		}
		return false
	}
	return true
}
