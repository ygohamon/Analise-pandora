package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// PatrimonioRepository define consultas especificas de patrimonio.
type PatrimonioRepository interface {
	LocalPatrimonioCPF(context.Context, string) ([]SourceResult, error)
	LocalITBICPF(context.Context, string) ([]SourceResult, error)
	LocalSISDEPENCPF(context.Context, string) ([]SourceResult, error)
	CortexAmadorCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
	CortexEmbarcacaoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
	CortexObitoCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}
