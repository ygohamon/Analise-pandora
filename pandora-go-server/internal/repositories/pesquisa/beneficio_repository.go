package repositories

import (
	"context"
)

// BeneficioRepository define consultas especificas de beneficios, PEP e RIF.
type BeneficioRepository interface {
	LocalBeneficioCPF(context.Context, string) ([]SourceResult, error)
	LocalPEPCPF(context.Context, string) ([]SourceResult, error)
	LocalRIFCPF(context.Context, string) ([]SourceResult, error)
}

// BeneficioConsultaRepository atende a tela especifica de beneficios.
type BeneficioConsultaRepository interface {
	BeneficiosPorCPF(context.Context, string) ([]map[string]any, error)
}
