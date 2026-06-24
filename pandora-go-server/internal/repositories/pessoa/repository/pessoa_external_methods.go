package pessoa

import (
	"context"

	"pandora-go-server/internal/types"
)

func (m SQLRepository) IntegradoReceitaFederalCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	if m.db == nil {
		return nil, types.ErrNotMigrated
	}
	return m.integradoExternoModel().consultaReceitaFederalCPF(ctx, cpf)
}

func (m SQLRepository) IntegradoSISMPCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	if m.db == nil {
		return nil, types.ErrNotMigrated
	}
	return m.integradoExternoModel().consultaSISMPCPF(ctx, cpf)
}

func (m SQLRepository) IntegradoCredlinkCompletoCPF(ctx context.Context, cpf string) (map[string]any, error) {
	if m.db == nil {
		return nil, types.ErrNotMigrated
	}
	return m.integradoExternoModel().consultaCredlinkCompleto(ctx, cpf)
}
