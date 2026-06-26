package pessoa

import "context"

// LocalVirtualCPF consulta fontes locais que alimentam contatos virtuais.
func (m SQLRepository) LocalVirtualCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalVirtualSources()
	})
}
