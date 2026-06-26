package pessoa

import "context"

// LocalBeneficioCPF consulta fontes locais que alimentam a aba beneficio.
func (m SQLRepository) LocalBeneficioCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalBenefitSources()
	})
}

// BeneficiosPorCPF atende a rota especifica /beneficios/cpf reaproveitando fontes do integrado.
func (m SQLRepository) BeneficiosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	localResults, localErr := m.LocalBeneficioCPF(ctx, cpf)
	externalResults, externalErr := m.ExternoTransparenciaCPF(ctx, cpf)
	rows := flattenSourceRows(localResults)
	for _, result := range externalResults {
		if result.Category != "beneficio" && result.Category != "cartao_governo_federal" {
			continue
		}
		rows = append(rows, result.Rows...)
	}
	if len(rows) > 0 {
		return rows, nil
	}
	if localErr != nil {
		return []map[string]any{}, localErr
	}
	if externalErr != nil {
		return []map[string]any{}, nil
	}
	return []map[string]any{}, nil
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
