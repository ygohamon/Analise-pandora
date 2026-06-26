package pessoa

import (
	"context"

	"pandora-go-server/internal/types"
)

// IntegradoLocalPessoasCPF executa as fontes cadastrais da aba pessoa local.
func (m SQLRepository) IntegradoLocalPessoasCPF(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	if m.db == nil {
		return nil, types.ErrNotMigrated
	}
	local := m.integradoLocalModel()
	return collectPessoaRows(ctx, cpf, local.pessoaBDReceita, local.pessoaReceitaFull, local.pessoaReceitaNovo), nil
}

func (m SQLRepository) LocalPessoaExtraCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalPessoaExtraSources()
	})
}

func (m SQLRepository) LocalReceitaCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalReceitaSources()
	})
}

func (m SQLRepository) queryLocalSources(ctx context.Context, cpf string, sources func(pessoaIntegradoLocalModel) []pessoaMapSource) ([]SourceResult, error) {
	if m.db == nil {
		return nil, types.ErrNotMigrated
	}
	local := m.integradoLocalModel()
	return local.queryLocalSourceResults(ctx, cpf, sources(local)), nil
}
