package pessoa

import "context"

// LocalEnderecoCPF consulta fontes locais que alimentam a aba endereco.
func (m SQLRepository) LocalEnderecoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalAddressSources()
	})
}
