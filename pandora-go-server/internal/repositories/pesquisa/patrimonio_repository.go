package repositories

import "context"

// PatrimonioRepository agrega ports patrimoniais mantidos por compatibilidade.
type PatrimonioRepository interface {
	PatrimonioLocalRepository
	ITBIRepository
	SISDEPENRepository
	AeronaveRepository
	EmbarcacaoRepository
	ObitoRepository
}

// PatrimonioLocalRepository define consultas patrimoniais locais por CPF.
type PatrimonioLocalRepository interface {
	LocalPatrimonioCPF(context.Context, string) ([]SourceResult, error)
}
