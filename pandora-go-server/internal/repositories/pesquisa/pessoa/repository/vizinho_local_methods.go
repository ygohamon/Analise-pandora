package pessoa

import "context"

// LocalVizinhoCPF consulta fontes locais que alimentam a aba vizinho.
func (m SQLRepository) LocalVizinhoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalVizinhoSources()
	})
}
