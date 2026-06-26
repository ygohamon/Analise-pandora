package repositories

import (
	"context"
)

// EleitoralRepository define consultas especificas eleitorais.
type EleitoralRepository interface {
	LocalEleitoralCPF(context.Context, string) ([]SourceResult, error)
}
