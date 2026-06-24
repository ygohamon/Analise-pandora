package pessoa

import "context"

// LocalEmpresaCPF consulta fontes locais que alimentam empresa e quadro societario.
func (m SQLRepository) LocalEmpresaCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalCorporateSources()
	})
}
