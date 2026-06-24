package usecases

import (
	"context"
	"strings"

	"pandora-go-server/internal/repositories"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// IntegradoCPFUseCase valida CPF e escolhe o fluxo integrado local/externo.
type IntegradoCPFUseCase struct {
	pessoas repositories.IntegradoPessoaRepository
}

// NewIntegradoCPFUseCase monta o orquestrador chamado por PessoaUseCase.
func NewIntegradoCPFUseCase(pessoas repositories.IntegradoPessoaRepository) IntegradoCPFUseCase {
	return IntegradoCPFUseCase{pessoas: pessoas}
}

// IntegradoCPF decide a funcao do integrado e chama repositories especificos.
func (u IntegradoCPFUseCase) IntegradoCPF(ctx context.Context, cpf string, options types.SearchOptions) (any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	if options.Funcao == "" {
		options.Funcao = "externo"
	}
	if options.Funcao == "externo" {
		return u.integradoExternoCPF(ctx, cpf, options)
	}
	if options.Funcao == "crawlers" {
		return u.integradoCrawlersCPF(ctx, cpf, options)
	}
	if options.Funcao != "local" {
		// Crawlers ficam fora desta etapa e mantem retorno resiliente vazio.
		return []map[string]any{}, nil
	}
	return u.integradoLocalCPF(ctx, cpf, options)
}

// IntegradoRG e IntegradoNome mantem compatibilidade com o Node enquanto fontes especificas sao migradas.
func (u IntegradoCPFUseCase) IntegradoRG(ctx context.Context, rg string, options types.SearchOptions) (any, error) {
	rg = strings.TrimSpace(rg)
	if options.Funcao == "" {
		options.Funcao = "local"
	}
	if options.Funcao != "local" {
		return u.integradoDocumentoNaoCPF(ctx, "pessoa."+options.Funcao, "rg", rg, options), nil
	}
	rows, err := u.pessoas.SimplificadoRG(ctx, rg)
	if err != nil {
		return nil, err
	}
	return u.integradoPessoasSimplificadas(ctx, "pessoa.local", "rg", rg, options, rows), nil
}

func (u IntegradoCPFUseCase) IntegradoNome(ctx context.Context, nome string, options types.SearchOptions) (any, error) {
	nome = strings.TrimSpace(nome)
	if options.Funcao == "" {
		options.Funcao = "local"
	}
	if options.Funcao != "local" {
		return u.integradoDocumentoNaoCPF(ctx, "pessoa."+options.Funcao, "nome", nome, options), nil
	}
	rows, err := u.pessoas.SimplificadoNome(ctx, nome)
	if err != nil {
		return nil, err
	}
	return u.integradoPessoasSimplificadas(ctx, "pessoa.local", "nome", nome, options, rows), nil
}
