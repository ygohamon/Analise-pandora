package pessoa

import "context"

// LocalVeiculoCPF consulta fontes locais que alimentam a aba veiculo.
func (m SQLRepository) LocalVeiculoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalVehicleSources()
	})
}
