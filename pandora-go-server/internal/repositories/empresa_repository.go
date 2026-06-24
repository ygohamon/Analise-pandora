package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

// EmpresaRepository define consultas especificas de empresas e sociedades.
type EmpresaRepository interface {
	LocalEmpresaCPF(context.Context, string) ([]SourceResult, error)
	CortexEmpresasResponsavelCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
	CortexEmpresasContadorCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
	CortexQuadroSocietarioCPF(context.Context, string, types.SearchOptions) ([]map[string]any, error)
}
