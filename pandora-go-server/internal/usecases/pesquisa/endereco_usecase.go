package usecases

import (
	"context"
	"strings"

	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// EnderecoUseCase valida entradas da tela pesquisa/endereco e chama repositories especificos.
type EnderecoUseCase struct {
	repo repositories.EnderecoConsultaRepository
}

// NewEnderecoUseCase monta o caso de uso chamado pelo handler de enderecos.
func NewEnderecoUseCase(repo repositories.EnderecoConsultaRepository) EnderecoUseCase {
	return EnderecoUseCase{repo: repo}
}

func (u EnderecoUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EnderecosPorCPF(queryCtx, cpf)
	})
}

func (u EnderecoUseCase) PorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EnderecosPorCNPJ(queryCtx, cnpj)
	})
}

func (u EnderecoUseCase) PorLogradouro(ctx context.Context, logradouro string) ([]map[string]any, error) {
	logradouro = strings.TrimSpace(logradouro)
	if len(logradouro) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EnderecosPorLogradouro(queryCtx, logradouro)
	})
}

func (u EnderecoUseCase) PorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	nome = strings.TrimSpace(nome)
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EnderecosPorNome(queryCtx, nome)
	})
}

func (u EnderecoUseCase) PorRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	razaoSocial = strings.TrimSpace(razaoSocial)
	if len(razaoSocial) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EnderecosPorRazaoSocial(queryCtx, razaoSocial)
	})
}
