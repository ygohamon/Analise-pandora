package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexCasamentoCPF consulta SIRC casamento Cortex para a aba parentesco.
func (m pessoaIntegradoExternoModel) consultaCortexCasamentoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/sirc/casamento/"+cpf, cpfUsuario)
	return mappers.CortexCasamentoRows(cpf, payload, cx.sigla), err
}
