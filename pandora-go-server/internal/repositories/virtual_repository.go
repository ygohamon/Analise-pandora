package repositories

import (
	"context"
)

// VirtualRepository define consultas especificas de contatos virtuais.
type VirtualRepository interface {
	LocalVirtualCPF(context.Context, string) ([]SourceResult, error)
}
