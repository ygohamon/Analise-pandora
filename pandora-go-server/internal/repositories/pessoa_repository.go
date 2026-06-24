package repositories

import (
	"context"

	pessoarepo "pandora-go-server/internal/repositories/pessoa/repository"
	"pandora-go-server/internal/types"
)

// SourceResult representa o resultado de uma fonte do integrado.
type SourceResult = pessoarepo.SourceResult

// IntegradoPessoaRepository agrupa as interfaces usadas pelo integrado por CPF.
type IntegradoPessoaRepository interface {
	PessoaRepository
	EnderecoRepository
	TelefoneRepository
	ParentescoRepository
	VizinhoRepository
	EmpresaRepository
	VeiculoRepository
	ProcessoRepository
	MandadoRepository
	BeneficioRepository
	PatrimonioRepository
	EleitoralRepository
	VirtualRepository
}

// PessoaRepository define consultas cadastrais do dominio Pessoa.
type PessoaRepository interface {
	IntegradoLocalPessoasCPF(context.Context, string) ([]types.PessoaSimplificada, error)
	LocalPessoaExtraCPF(context.Context, string) ([]SourceResult, error)
	CortexPessoaBaseCPF(context.Context, string, types.SearchOptions) []SourceResult
	IntegradoReceitaFederalCPF(context.Context, string) ([]map[string]any, error)
	IntegradoSISMPCPF(context.Context, string) ([]SourceResult, error)
	IntegradoCredlinkCompletoCPF(context.Context, string) (map[string]any, error)
	AntecedentePDFRG(context.Context, string, string) ([]map[string]any, error)
	SimplificadoCPF(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoNome(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoRG(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoCNH(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoTitulo(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoNomePai(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoNomeMae(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoTelefone(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoEmail(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoEndereco(context.Context, string) ([]types.PessoaSimplificada, error)
}
