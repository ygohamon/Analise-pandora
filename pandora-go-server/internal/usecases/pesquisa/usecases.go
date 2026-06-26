// Package pesquisa orquestra telas novas da secao Pesquisa.
//
// Handlers chamam estes usecases; eles validam/normalizam entradas e delegam a
// consulta para repositories especificos. Telas ja consolidadas continuam
// usando usecases de dominio, documentados em docs/PESQUISA_ROUTES.md.
package usecases

import (
	"context"
	"errors"
	"strings"
	"time"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

const operationalTimeout = 2 * time.Minute

// Repository define as consultas especificas usadas pelas telas de pesquisa.
type Repository interface {
	GPUSimplificadoCPF(context.Context, string) ([]map[string]any, error)
	GPUSimplificadoNome(context.Context, string) ([]map[string]any, error)
	GPUSimplificadoRG(context.Context, string) ([]map[string]any, error)
	GPUSimplificadoOAB(context.Context, string) ([]map[string]any, error)
	GPUDetalhadoCPF(context.Context, string) ([]map[string]any, error)
	GPUAtendimentosAdvogado(context.Context, string, string, string) (map[string]any, error)
	Presos(context.Context, string, string, bool) ([]map[string]any, error)
	Arma(context.Context, string, string, string) ([]map[string]any, error)
	Folha(context.Context, string, string, string, string) ([]map[string]any, error)
	Orgaos(context.Context, string) ([]map[string]any, error)
	ImoveisCPF(context.Context, string) ([]map[string]any, error)
	ImoveisCNPJ(context.Context, string) ([]map[string]any, error)
	Investigados(context.Context, string, string) ([]map[string]any, error)
	Prontuarios(context.Context, string, string) ([]map[string]any, error)
	FichaSuja(context.Context, string, string) ([]map[string]any, error)
	ProcessoNumero(context.Context, string) ([]map[string]any, error)
	ProcessoCPF(context.Context, string) ([]map[string]any, error)
	ProcessoCNPJ(context.Context, string) ([]map[string]any, error)
}

// UseCases agrupa casos de uso da sessao pesquisa para manter a injecao simples.
type UseCases struct {
	repo Repository
}

// NewUseCases cria o orquestrador chamado pelos handlers de pesquisa.
func NewUseCases(repo Repository) UseCases {
	return UseCases{repo: repo}
}

func (u UseCases) GPUSimplificado(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	valor = strings.TrimSpace(valor)
	if len(valor) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		switch tipo {
		case "cpf":
			cpf := utils.NormalizeCPF(valor)
			if !validators.ValidCPF(cpf) {
				return nil, types.ErrInvalidCPF
			}
			return u.repo.GPUSimplificadoCPF(queryCtx, cpf)
		case "nome":
			return u.repo.GPUSimplificadoNome(queryCtx, valor)
		case "rg":
			return u.repo.GPUSimplificadoRG(queryCtx, utils.OnlyDigits(valor))
		case "oab":
			return u.repo.GPUSimplificadoOAB(queryCtx, valor)
		default:
			return nil, types.ErrInvalidParam
		}
	})
}

func (u UseCases) GPUDetalhado(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.GPUDetalhadoCPF(queryCtx, cpf)
	})
}

func (u UseCases) GPUAtendimentosAdvogado(ctx context.Context, advogadoID string, page string, size string) (map[string]any, error) {
	advogadoID = strings.TrimSpace(advogadoID)
	if advogadoID == "" {
		return nil, types.ErrInvalidParam
	}
	queryCtx, cancel := context.WithTimeout(ctx, operationalTimeout)
	defer cancel()
	out, err := u.repo.GPUAtendimentosAdvogado(queryCtx, advogadoID, page, size)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(queryCtx.Err(), context.DeadlineExceeded) {
		return map[string]any{"visitas": []any{}}, nil
	}
	return out, err
}

func (u UseCases) Presos(ctx context.Context, tipo string, valor string, detalhado bool) ([]map[string]any, error) {
	valor = normalizeByType(tipo, valor)
	if len(valor) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Presos(queryCtx, tipo, valor, detalhado)
	})
}

func (u UseCases) Arma(ctx context.Context, campo string, valor string, cpfUsuario string) ([]map[string]any, error) {
	valor = strings.TrimSpace(valor)
	if len(valor) < 3 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Arma(queryCtx, campo, valor, utils.OnlyDigits(cpfUsuario))
	})
}

func (u UseCases) Folha(ctx context.Context, esfera string, cdOrgao string, mes string, ano string) ([]map[string]any, error) {
	if strings.TrimSpace(cdOrgao) == "" || strings.TrimSpace(mes) == "" || strings.TrimSpace(ano) == "" {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Folha(queryCtx, esfera, cdOrgao, mes, ano)
	})
}

func (u UseCases) Orgaos(ctx context.Context, orgao string) ([]map[string]any, error) {
	orgao = strings.TrimSpace(orgao)
	if len(orgao) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Orgaos(queryCtx, orgao)
	})
}

func (u UseCases) ImoveisCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ImoveisCPF(queryCtx, cpf)
	})
}

func (u UseCases) ImoveisCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ImoveisCNPJ(queryCtx, cnpj)
	})
}

func (u UseCases) Investigados(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	valor = normalizeByType(tipo, valor)
	if len(valor) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Investigados(queryCtx, tipo, valor)
	})
}

func (u UseCases) Prontuarios(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	valor = normalizeByType(tipo, valor)
	if len(valor) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Prontuarios(queryCtx, tipo, valor)
	})
}

func (u UseCases) FichaSuja(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	valor = normalizeByType(tipo, valor)
	if len(valor) < 2 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.FichaSuja(queryCtx, tipo, valor)
	})
}

func (u UseCases) ProcessoNumero(ctx context.Context, processo string) ([]map[string]any, error) {
	processo = utils.OnlyDigits(processo)
	if len(processo) < 5 {
		return nil, types.ErrInvalidParam
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ProcessoNumero(queryCtx, processo)
	})
}

func (u UseCases) ProcessoCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ProcessoCPF(queryCtx, cpf)
	})
}

func (u UseCases) ProcessoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return rowsWithTimeout(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.ProcessoCNPJ(queryCtx, cnpj)
	})
}

func rowsWithTimeout(ctx context.Context, fn func(context.Context) ([]map[string]any, error)) ([]map[string]any, error) {
	queryCtx, cancel := context.WithTimeout(ctx, operationalTimeout)
	defer cancel()
	rows, err := fn(queryCtx)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(queryCtx.Err(), context.DeadlineExceeded) {
		return []map[string]any{}, nil
	}
	return rows, err
}

func normalizeByType(tipo string, value string) string {
	switch tipo {
	case "cpf":
		return utils.NormalizeCPF(value)
	case "cnpj":
		return utils.NormalizeCNPJ(value)
	case "rg", "cnc", "titulo":
		return utils.OnlyDigits(value)
	default:
		return strings.TrimSpace(value)
	}
}
