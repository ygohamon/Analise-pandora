package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexVeiculoCPF consulta veiculos Cortex por CPF para a aba veiculo.
func (m pessoaIntegradoExternoModel) consultaCortexVeiculoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	if cx.baseVeiculos == "" {
		return nil, nil
	}
	payload, err := cx.client.Get(ctx, cx.baseVeiculos+"/emplacamentos/proprietario/"+cpf, cpfUsuario)
	return mappers.CortexVeiculoRows(cpf, payload, cx.sigla), err
}

// consultaCortexCondutorCPF consulta RENACH Cortex por CPF para a aba condutor.
func (m pessoaIntegradoExternoModel) consultaCortexCondutorCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/renach/cpf/"+cpf, cpfUsuario)
	return mappers.CortexCondutorRows(payload), err
}
