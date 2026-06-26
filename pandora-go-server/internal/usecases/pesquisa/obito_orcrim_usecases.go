package usecases

import (
	"context"
	"strings"

	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// ObitoUseCase valida entradas da tela pesquisa/obito e consulta o repository.
type ObitoUseCase struct {
	repo repositories.ObitoConsultaRepository
}

func NewObitoUseCase(repo repositories.ObitoConsultaRepository) ObitoUseCase {
	return ObitoUseCase{repo: repo}
}

func (u ObitoUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ObitosPorCPF(queryCtx, cpf)
	})
}

func (u ObitoUseCase) PorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	nome = strings.TrimSpace(nome)
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ObitosPorNome(queryCtx, nome)
	})
}

// OrcrimUseCase isola a consulta administrativa de organizacoes criminosas.
type OrcrimUseCase struct {
	repo repositories.OrcrimRepository
}

func NewOrcrimUseCase(repo repositories.OrcrimRepository) OrcrimUseCase {
	return OrcrimUseCase{repo: repo}
}

func (u OrcrimUseCase) Listar(ctx context.Context) ([]map[string]any, error) {
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ListaOrcrins(queryCtx)
	})
}

func (u OrcrimUseCase) PorNome(ctx context.Context, orcrim string) ([]map[string]any, error) {
	orcrim = strings.TrimSpace(orcrim)
	if len(orcrim) < 2 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.OrcrinsPorNome(queryCtx, orcrim)
	})
}
