package pessoa

import "context"

// LocalParentescoCPF consulta fontes locais que alimentam a aba parentesco.
func (m SQLRepository) LocalParentescoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalParentescoSources()
	})
}
