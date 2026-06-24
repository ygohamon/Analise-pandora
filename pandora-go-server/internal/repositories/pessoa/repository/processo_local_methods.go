package pessoa

import "context"

// LocalTipologiaCPF consulta fontes locais que alimentam a aba tipologia.
func (m SQLRepository) LocalTipologiaCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalTipologiaSources()
	})
}

// LocalCondenacaoCPF consulta fontes locais que alimentam abas processuais.
func (m SQLRepository) LocalCondenacaoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalCondemnationSources()
	})
}

// LocalRegistroCivilCPF consulta obito, imovel e servidor estadual locais.
func (m SQLRepository) LocalRegistroCivilCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalRegistrySources()
	})
}
