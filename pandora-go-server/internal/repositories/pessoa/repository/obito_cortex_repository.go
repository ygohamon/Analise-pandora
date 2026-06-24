package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexObitoCPF consulta SIRC obito Cortex para a aba obito.
func (m pessoaIntegradoExternoModel) consultaCortexObitoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/sirc/obitos/"+cpf, cpfUsuario)
	return mappers.CortexObitoRows(payload, cx.sigla), err
}
