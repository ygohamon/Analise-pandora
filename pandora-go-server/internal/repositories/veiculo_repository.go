package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// VeiculoRepository define consultas especificas de veiculo.
type VeiculoRepository interface {
	LocalVeiculoCPF(context.Context, string) ([]SourceResult, error)
	CortexVeiculoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
	CortexCondutorCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}
