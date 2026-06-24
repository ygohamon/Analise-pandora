package repositories

import (
	"context"
)

// VizinhoRepository define consultas especificas de vizinhos.
type VizinhoRepository interface {
	LocalVizinhoCPF(context.Context, string) ([]SourceResult, error)
}
