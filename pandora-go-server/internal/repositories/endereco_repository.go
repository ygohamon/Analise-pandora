package repositories

import (
	"context"
)

// EnderecoRepository define consultas especificas de endereco e vizinhanca.
type EnderecoRepository interface {
	LocalReceitaCPF(context.Context, string) ([]SourceResult, error)
	LocalEnderecoCPF(context.Context, string) ([]SourceResult, error)
}
