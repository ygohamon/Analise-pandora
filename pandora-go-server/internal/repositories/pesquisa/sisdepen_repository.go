package repositories

import "context"

// SISDEPENRepository define consultas especificas de dados prisionais/foto.
type SISDEPENRepository interface {
	LocalSISDEPENCPF(context.Context, string) ([]SourceResult, error)
}
