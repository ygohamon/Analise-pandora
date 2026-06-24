package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexAmadorCPF consulta amadores Cortex por CPF para a aba amador.
func (m pessoaIntegradoExternoModel) consultaCortexAmadorCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/amadores/listarAmadores/"+cpf, cpfUsuario)
	return mappers.CortexAmadorRows(payload, cx.sigla), err
}
