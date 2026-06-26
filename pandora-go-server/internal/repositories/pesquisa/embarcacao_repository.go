package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// EmbarcacaoRepository define consultas especificas de embarcacoes.
type EmbarcacaoRepository interface {
	CortexEmbarcacaoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}

// EmbarcacaoConsultaRepository atende as rotas isoladas da tela pesquisa/embarcacao.
type EmbarcacaoConsultaRepository interface {
	EmbarcacoesPorCPF(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorCNPJ(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorNome(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorInscricao(context.Context, string) ([]map[string]any, error)
}
