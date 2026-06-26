package repositories

import "context"

// OrcrimRepository atende as rotas administrativas da pesquisa/orcrim.
type OrcrimRepository interface {
	ListaOrcrins(context.Context) ([]map[string]any, error)
	OrcrinsPorNome(context.Context, string) ([]map[string]any, error)
}
