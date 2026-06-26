package pessoa

import "context"

// LocalTelefoneCPF consulta fontes locais que alimentam a aba telefone.
func (m SQLRepository) LocalTelefoneCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalPhoneSources()
	})
}
