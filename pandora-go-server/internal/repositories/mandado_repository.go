package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// MandadoRepository define consultas especificas de mandado.
type MandadoRepository interface {
	CortexMandadoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}
