package repositories

import (
	"context"
)

// TelefoneRepository define consultas especificas de telefone.
type TelefoneRepository interface {
	LocalTelefoneCPF(context.Context, string) ([]SourceResult, error)
}
