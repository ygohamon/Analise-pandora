package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// AeronaveRepository define consultas especificas de aeronaves e registros de amador.
type AeronaveRepository interface {
	CortexAmadorCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}

// AeronaveConsultaRepository atende as rotas isoladas da tela pesquisa/aeronaves.
type AeronaveConsultaRepository interface {
	AeronavesPorCPF(context.Context, string) ([]map[string]any, error)
	AeronavesPorCNPJ(context.Context, string) ([]map[string]any, error)
	AeronavesPorNome(context.Context, string) ([]map[string]any, error)
	AeronavesPorMatricula(context.Context, string) ([]map[string]any, error)
}
