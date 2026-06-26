package usecases

import (
	"context"

	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// BeneficioUseCase valida e orquestra a tela especifica de beneficios por CPF.
type BeneficioUseCase struct {
	repo repositories.BeneficioConsultaRepository
}

func NewBeneficioUseCase(repo repositories.BeneficioConsultaRepository) BeneficioUseCase {
	return BeneficioUseCase{repo: repo}
}

// PorCPF e chamado pelo handler /beneficios/cpf e retorna linhas tabulares para o front.
func (u BeneficioUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.BeneficiosPorCPF(queryCtx, cpf)
	})
}
