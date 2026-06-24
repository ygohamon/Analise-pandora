package pessoa

import "context"

// LocalBeneficioCPF consulta fontes locais que alimentam a aba beneficio.
func (m SQLRepository) LocalBeneficioCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalBenefitSources()
	})
}

// LocalPEPCPF consulta fontes locais que alimentam a aba pep.
func (m SQLRepository) LocalPEPCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalPEPSources()
	})
}

// LocalRIFCPF consulta fontes locais que alimentam a aba rif.
func (m SQLRepository) LocalRIFCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalRIFSources()
	})
}
