package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// ObitoRepository define consultas especificas de obitos.
type ObitoRepository interface {
	CortexObitoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}

// ObitoConsultaRepository atende as rotas isoladas da tela pesquisa/obito.
type ObitoConsultaRepository interface {
	ObitosPorCPF(context.Context, string) ([]map[string]any, error)
	ObitosPorNome(context.Context, string) ([]map[string]any, error)
}
