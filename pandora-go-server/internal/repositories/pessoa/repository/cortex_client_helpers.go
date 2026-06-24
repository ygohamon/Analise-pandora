package pessoa

import (
	"context"
	"strings"
	"sync"

	cortexapi "pandora-go-server/internal/integrations/cortex"
)

type cortexContext struct {
	client       cortexapi.Client
	basePessoas  string
	baseVeiculos string
	sigla        string
	ok           bool

	pessoaFisicaOnce    sync.Once
	pessoaFisicaPayload any
	pessoaFisicaErr     error
}

// cortexClient cria o client Cortex configurado para consultas especificas por dominio.
// Chamado somente pelo integrado externo de pessoa antes de disparar as fontes Cortex.
func (m pessoaIntegradoExternoModel) cortexClient() *cortexContext {
	model, ok := m.models.Get("WEBSERVICE_CORTEX")
	if !ok || !model.Ativado {
		return &cortexContext{}
	}
	basePessoas := strings.TrimRight(modelVar(model.Vars, "CORTEX_URL_PESSOAS"), "/")
	if basePessoas == "" {
		return &cortexContext{}
	}
	sigla := strings.TrimSpace(model.Sigla)
	if sigla == "" {
		sigla = "CTX"
	}
	return &cortexContext{
		client:       cortexapi.NewClient(model),
		basePessoas:  basePessoas,
		baseVeiculos: strings.TrimRight(modelVar(model.Vars, "CORTEX_URL_VEICULOS"), "/"),
		sigla:        sigla,
		ok:           true,
	}
}

func (c *cortexContext) pessoaFisica(ctx context.Context, cpf, cpfUsuario string) (any, error) {
	c.pessoaFisicaOnce.Do(func() {
		c.pessoaFisicaPayload, c.pessoaFisicaErr = c.client.Get(ctx, c.basePessoas+"/pessoafisica/"+cpf, cpfUsuario)
	})
	return c.pessoaFisicaPayload, c.pessoaFisicaErr
}
