package repositories

import (
	"context"
)

// ProcessoRepository define consultas especificas de processos e condenacoes.
type ProcessoRepository interface {
	LocalTipologiaCPF(context.Context, string) ([]SourceResult, error)
	LocalCondenacaoCPF(context.Context, string) ([]SourceResult, error)
	LocalRegistroCivilCPF(context.Context, string) ([]SourceResult, error)
	LocalSASPCPF(context.Context, string) ([]SourceResult, error)
	LocalFichaSujaCPF(context.Context, string) ([]SourceResult, error)
	LocalCartorioCPF(context.Context, string) ([]SourceResult, error)
	LocalCandidatoCPF(context.Context, string) ([]SourceResult, error)
	ExternoTJSPCPF(context.Context, string) ([]map[string]any, error)
	ExternoTransparenciaCPF(context.Context, string) ([]SourceResult, error)
	ExternoTransparenciaServidorCPF(context.Context, string) ([]map[string]any, error)
	ExternoJusbrasilCPF(context.Context, string) ([]SourceResult, error)
	ExternoSEEUCPF(context.Context, string) ([]SourceResult, error)
}
