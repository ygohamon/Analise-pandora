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

// VeiculoConsultaRepository atende as rotas isoladas da tela pesquisa/veiculo.
type VeiculoConsultaRepository interface {
	VeiculosPorCPF(context.Context, string) ([]map[string]any, error)
	VeiculosPorCNPJ(context.Context, string) ([]map[string]any, error)
	VeiculosPorNome(context.Context, string) ([]map[string]any, error)
	VeiculosPorChassi(context.Context, string) ([]map[string]any, error)
	VeiculosPorRenavam(context.Context, string) ([]map[string]any, error)
	VeiculosPorPlaca(context.Context, string) ([]map[string]any, error)
}
