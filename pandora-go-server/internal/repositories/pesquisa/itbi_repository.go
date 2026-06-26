package repositories

import "context"

// ITBIRepository define consultas especificas de ITBI/imoveis.
type ITBIRepository interface {
	LocalITBICPF(context.Context, string) ([]SourceResult, error)
}
