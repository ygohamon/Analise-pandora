package usecases

import (
	"context"
	"strings"

	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// TelefoneUseCase valida a tela pesquisa/telefone e chama repositories especificos.
type TelefoneUseCase struct {
	repo repositories.TelefoneConsultaRepository
}

func NewTelefoneUseCase(repo repositories.TelefoneConsultaRepository) TelefoneUseCase {
	return TelefoneUseCase{repo: repo}
}

func (u TelefoneUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.TelefonesPorCPF(queryCtx, cpf)
	})
}

func (u TelefoneUseCase) PorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.TelefonesPorCNPJ(queryCtx, cnpj)
	})
}

func (u TelefoneUseCase) PorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return u.byText(ctx, nome, u.repo.TelefonesPorNome)
}

func (u TelefoneUseCase) PorRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	return u.byText(ctx, razaoSocial, u.repo.TelefonesPorRazaoSocial)
}

func (u TelefoneUseCase) PorTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	telefone = utils.OnlyDigits(telefone)
	if len(telefone) < 4 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.TelefonesPorTelefone(queryCtx, telefone)
	})
}

func (u TelefoneUseCase) byText(ctx context.Context, value string, fn func(context.Context, string) ([]map[string]any, error)) ([]map[string]any, error) {
	value = strings.TrimSpace(value)
	if len(strings.Fields(value)) < 2 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return fn(queryCtx, value)
	})
}
