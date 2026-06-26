package analise

import (
	"context"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// Repository define as consultas exigidas pelas paginas de analise.
type Repository interface {
	Empenhos(context.Context, string, string) ([]map[string]any, error)
	Licitacoes(context.Context, string, string) ([]map[string]any, error)
	LicitacaoDados(context.Context, string, string, string) ([]map[string]any, error)
	Aditivos(context.Context, string, string) ([]map[string]any, error)
	Contratos(context.Context, string, string) ([]map[string]any, error)
	TCE(context.Context, string, string) ([]map[string]any, error)
}

// UseCase valida parametros das telas de Analise e chama o repository.
type UseCase struct {
	repo Repository
}

// NewUseCase cria o orquestrador de Analise chamado pelos handlers.
func NewUseCase(repo Repository) UseCase {
	return UseCase{repo: repo}
}

func (u UseCase) Empenhos(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	doc, err := normalizeDoc(tipo, documento)
	if err != nil {
		return nil, err
	}
	return u.repo.Empenhos(ctx, tipo, doc)
}

func (u UseCase) Licitacoes(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	doc, err := normalizeDoc(tipo, documento)
	if err != nil {
		return nil, err
	}
	return u.repo.Licitacoes(ctx, tipo, doc)
}

func (u UseCase) LicitacaoDados(ctx context.Context, cdUgestora string, nuLicitacao string, cdMdLicitacao string) ([]map[string]any, error) {
	if strings.TrimSpace(cdUgestora) == "" || strings.TrimSpace(nuLicitacao) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.repo.LicitacaoDados(ctx, cdUgestora, nuLicitacao, cdMdLicitacao)
}

func (u UseCase) Aditivos(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	value, err := normalizeAnaliseValue(tipo, valor)
	if err != nil {
		return nil, err
	}
	return u.repo.Aditivos(ctx, tipo, value)
}

func (u UseCase) Contratos(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	value, err := normalizeAnaliseValue(tipo, valor)
	if err != nil {
		return nil, err
	}
	return u.repo.Contratos(ctx, tipo, value)
}

func (u UseCase) TCE(ctx context.Context, tipo string, data string) ([]map[string]any, error) {
	if strings.TrimSpace(tipo) == "" || strings.TrimSpace(data) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.repo.TCE(ctx, tipo, data)
}

func normalizeAnaliseValue(tipo string, valor string) (string, error) {
	switch tipo {
	case "cpf", "cnpj":
		return normalizeDoc(tipo, valor)
	case "nulicitacao", "nucontrato":
		valor = strings.TrimSpace(valor)
		if valor == "" {
			return "", types.ErrInvalidParam
		}
		return valor, nil
	default:
		return "", types.ErrInvalidParam
	}
}

func normalizeDoc(tipo string, documento string) (string, error) {
	switch tipo {
	case "cpf":
		cpf := utils.NormalizeCPF(documento)
		if !validators.ValidCPF(cpf) {
			return "", types.ErrInvalidCPF
		}
		return cpf, nil
	case "cnpj":
		cnpj := utils.NormalizeCNPJ(documento)
		if !validators.ValidCNPJ(cnpj) {
			return "", types.ErrInvalidCNPJ
		}
		return cnpj, nil
	default:
		return "", types.ErrInvalidParam
	}
}
