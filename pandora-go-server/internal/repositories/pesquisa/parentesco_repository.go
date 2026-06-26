package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// ParentescoRepository define consultas especificas de parentesco.
type ParentescoRepository interface {
	LocalParentescoCPF(context.Context, string) ([]SourceResult, error)
	CortexCasamentoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}
