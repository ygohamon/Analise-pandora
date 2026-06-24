package pessoa

import "context"

// LocalEleitoralCPF consulta fontes locais que alimentam a aba eleitoral.
func (m SQLRepository) LocalEleitoralCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalElectoralSources()
	})
}
