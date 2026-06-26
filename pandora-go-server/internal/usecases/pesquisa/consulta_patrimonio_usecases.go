package usecases

import (
	"context"
	"errors"
	"strings"
	"time"

	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

const consultaOperacionalTimeout = 2 * time.Minute

// VeiculoConsultaUseCase orquestra a pesquisa isolada de veiculos.
type VeiculoConsultaUseCase struct {
	repo repositories.VeiculoConsultaRepository
}

func NewVeiculoConsultaUseCase(repo repositories.VeiculoConsultaRepository) VeiculoConsultaUseCase {
	return VeiculoConsultaUseCase{repo: repo}
}

func (u VeiculoConsultaUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.VeiculosPorCPF(queryCtx, cpf)
	})
}

func (u VeiculoConsultaUseCase) PorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.VeiculosPorCNPJ(queryCtx, cnpj)
	})
}

func (u VeiculoConsultaUseCase) PorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return u.byText(ctx, nome, u.repo.VeiculosPorNome)
}

func (u VeiculoConsultaUseCase) PorChassi(ctx context.Context, chassi string) ([]map[string]any, error) {
	return u.byText(ctx, chassi, u.repo.VeiculosPorChassi)
}

func (u VeiculoConsultaUseCase) PorRenavam(ctx context.Context, renavam string) ([]map[string]any, error) {
	renavam = utils.OnlyDigits(renavam)
	if len(renavam) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.VeiculosPorRenavam(ctx, renavam)
}

func (u VeiculoConsultaUseCase) PorPlaca(ctx context.Context, placa string) ([]map[string]any, error) {
	return u.byText(ctx, placa, u.repo.VeiculosPorPlaca)
}

func (u VeiculoConsultaUseCase) byText(ctx context.Context, value string, fn func(context.Context, string) ([]map[string]any, error)) ([]map[string]any, error) {
	value = strings.TrimSpace(value)
	if len(value) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return fn(queryCtx, value)
	})
}

// EmbarcacaoUseCase orquestra a pesquisa isolada de embarcacoes.
type EmbarcacaoUseCase struct {
	repo repositories.EmbarcacaoConsultaRepository
}

func NewEmbarcacaoUseCase(repo repositories.EmbarcacaoConsultaRepository) EmbarcacaoUseCase {
	return EmbarcacaoUseCase{repo: repo}
}

func (u EmbarcacaoUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EmbarcacoesPorCPF(queryCtx, cpf)
	})
}

func (u EmbarcacaoUseCase) PorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EmbarcacoesPorCNPJ(queryCtx, cnpj)
	})
}

func (u EmbarcacaoUseCase) PorNome(ctx context.Context, embarcacao string) ([]map[string]any, error) {
	embarcacao = strings.TrimSpace(embarcacao)
	if len(embarcacao) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EmbarcacoesPorNome(queryCtx, embarcacao)
	})
}

func (u EmbarcacaoUseCase) PorInscricao(ctx context.Context, inscricao string) ([]map[string]any, error) {
	inscricao = strings.TrimSpace(inscricao)
	if len(inscricao) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.EmbarcacoesPorInscricao(queryCtx, inscricao)
	})
}

// AeronaveUseCase orquestra a pesquisa isolada de aeronaves.
type AeronaveUseCase struct {
	repo repositories.AeronaveConsultaRepository
}

func NewAeronaveUseCase(repo repositories.AeronaveConsultaRepository) AeronaveUseCase {
	return AeronaveUseCase{repo: repo}
}

func (u AeronaveUseCase) PorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.AeronavesPorCPF(queryCtx, cpf)
	})
}

func (u AeronaveUseCase) PorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.AeronavesPorCNPJ(queryCtx, cnpj)
	})
}

func (u AeronaveUseCase) PorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	nome = strings.TrimSpace(nome)
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.AeronavesPorNome(queryCtx, nome)
	})
}

func (u AeronaveUseCase) PorMatricula(ctx context.Context, matricula string) ([]map[string]any, error) {
	matricula = strings.TrimSpace(matricula)
	if len(matricula) < 3 {
		return nil, types.ErrInvalidParam
	}
	return consultaRowsWithTimeout(ctx, consultaOperacionalTimeout, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.AeronavesPorMatricula(queryCtx, matricula)
	})
}

func consultaRowsWithTimeout(ctx context.Context, timeout time.Duration, fn func(context.Context) ([]map[string]any, error)) ([]map[string]any, error) {
	queryCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	rows, err := fn(queryCtx)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(queryCtx.Err(), context.DeadlineExceeded) {
		return []map[string]any{}, nil
	}
	return rows, err
}
