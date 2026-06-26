package repositories

import (
	"context"
)

// ProcessoRepository define consultas especificas de processos e condenacoes.
type ProcessoRepository interface {
	TipologiaRepository
	CondenacaoRepository
	RegistroCivilRepository
	SASPRepository
	FichaSujaRepository
	CartorioRepository
	CandidatoRepository
	TJSPRepository
	TransparenciaRepository
	JusbrasilRepository
	SEEURepository
}

// TipologiaRepository define consultas especificas de tipologias locais.
type TipologiaRepository interface {
	LocalTipologiaCPF(context.Context, string) ([]SourceResult, error)
}

// CondenacaoRepository define consultas especificas de condenacoes locais.
type CondenacaoRepository interface {
	LocalCondenacaoCPF(context.Context, string) ([]SourceResult, error)
}

// RegistroCivilRepository define consultas especificas de registro civil.
type RegistroCivilRepository interface {
	LocalRegistroCivilCPF(context.Context, string) ([]SourceResult, error)
}

// SASPRepository define consultas especificas da fonte SASP.
type SASPRepository interface {
	LocalSASPCPF(context.Context, string) ([]SourceResult, error)
}

// FichaSujaRepository define consultas especificas de ficha suja.
type FichaSujaRepository interface {
	LocalFichaSujaCPF(context.Context, string) ([]SourceResult, error)
}

// CartorioRepository define consultas especificas de cartorio.
type CartorioRepository interface {
	LocalCartorioCPF(context.Context, string) ([]SourceResult, error)
}

// CandidatoRepository define consultas especificas de candidatos.
type CandidatoRepository interface {
	LocalCandidatoCPF(context.Context, string) ([]SourceResult, error)
}

// TJSPRepository define consultas externas especificas do TJSP.
type TJSPRepository interface {
	ExternoTJSPCPF(context.Context, string) ([]map[string]any, error)
}

// TransparenciaRepository define consultas externas de transparencia.
type TransparenciaRepository interface {
	ExternoTransparenciaCPF(context.Context, string) ([]SourceResult, error)
	ExternoTransparenciaServidorCPF(context.Context, string) ([]map[string]any, error)
}

// JusbrasilRepository define consultas externas do Jusbrasil.
type JusbrasilRepository interface {
	ExternoJusbrasilCPF(context.Context, string) ([]SourceResult, error)
}

// SEEURepository define consultas externas do SEEU.
type SEEURepository interface {
	ExternoSEEUCPF(context.Context, string) ([]SourceResult, error)
}
