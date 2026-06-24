package receitaonline

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"pandora-go-server/internal/integrations/oauthjson"
	"pandora-go-server/internal/modelconfig"
)

var session = oauthjson.Session{}

// Client encapsula a API Receita Federal online usada pelo integrado.
type Client struct {
	model modelconfig.Model
}

// NewClient cria o client chamado pelos repositories externos de pessoa/empresa.
func NewClient(model modelconfig.Model) Client {
	return Client{model: model}
}

// ConsultarCNPJ consulta dados cadastrais de CNPJ e retorna JSON bruto.
func (c Client) ConsultarCNPJ(ctx context.Context, cnpj string) (map[string]any, error) {
	baseURL := strings.TrimRight(modelVar(c.model.Vars, "URL"), "/")
	if baseURL == "" {
		return nil, nil
	}
	token, err := session.Token(ctx, c.model, true)
	if err != nil {
		return nil, err
	}
	endpoint := baseURL + "/integracaoreceitafederalapi/ConsultarCNPJ?listaCNPJ=" + url.QueryEscape(cnpj)
	return oauthjson.GetJSON(ctx, c.model, "receita_federal", endpoint, token, nil)
}

func modelVar(vars map[string]any, key string) string {
	if vars == nil {
		return ""
	}
	if value, ok := vars[key]; ok && value != nil {
		return strings.TrimSpace(fmt.Sprint(value))
	}
	return ""
}
