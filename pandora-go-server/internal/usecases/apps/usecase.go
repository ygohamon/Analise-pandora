package apps

import (
	"context"
	"errors"
	"strings"
	"time"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

const appsTimeout = 2 * time.Minute

// Repository define as consultas especificas usadas pelas telas da secao Apps.
type Repository interface {
	IntegraPromotorias(context.Context, string) ([]map[string]any, error)
	IntegraDemandas(context.Context, string) ([]map[string]any, error)
	IntegraCadastro(context.Context, map[string]any) ([]map[string]any, error)
	CacaFantasmasOrgao(context.Context, string) ([]map[string]any, error)
	CacaFantasmasAnalise(context.Context, string, map[string]string) ([]map[string]any, error)
	DNACNPJ(context.Context, string) ([]map[string]any, error)
	PainelCovidUF(context.Context, string) ([]map[string]any, error)
	INPOrgao(context.Context, map[string]string) ([]map[string]any, error)
	INPCPF(context.Context, string) ([]map[string]any, error)
	MapaConsumo(context.Context, map[string]string) ([]map[string]any, error)
	Relacionamentos(context.Context, string, string, map[string]string) ([]map[string]any, error)
	Faccoes(context.Context, string, string) ([]map[string]any, error)
	FaccoesMutation(context.Context, string, string, int64, map[string]any) ([]map[string]any, error)
	TipoRankUF(context.Context) ([]map[string]any, error)
	TipoRankMunicipio(context.Context, string, string) ([]map[string]any, error)
	ArielFoto(context.Context, map[string]any) ([]map[string]any, error)
	SimbaTop(context.Context, string, string) ([]map[string]any, error)
	YellowPages(context.Context, string, string) ([]map[string]any, error)
	SefazML(context.Context, string, string, map[string]string) ([]map[string]any, error)
	Sadep(context.Context, string, string) ([]map[string]any, error)
	RelacionaTipologia(context.Context, bool, string) ([]map[string]any, error)
}

// UseCase valida parametros da secao Apps e chama repositories especificos.
type UseCase struct {
	repo Repository
}

// NewUseCase cria o orquestrador chamado pelos handlers/apps.
func NewUseCase(repo Repository) UseCase {
	return UseCase{repo: repo}
}

func (u UseCase) IntegraPromotorias(ctx context.Context, promotoria string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.IntegraPromotorias(queryCtx, strings.TrimSpace(promotoria))
	})
}

func (u UseCase) IntegraDemandas(ctx context.Context, email string) ([]map[string]any, error) {
	if strings.TrimSpace(email) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.IntegraDemandas(queryCtx, email)
	})
}

func (u UseCase) IntegraCadastro(ctx context.Context, payload map[string]any) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.IntegraCadastro(queryCtx, payload)
	})
}

func (u UseCase) CacaFantasmasOrgao(ctx context.Context, orgao string) ([]map[string]any, error) {
	if len(strings.TrimSpace(orgao)) < 2 {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.CacaFantasmasOrgao(queryCtx, orgao)
	})
}

func (u UseCase) CacaFantasmasAnalise(ctx context.Context, cdugestora string, filtros map[string]string) ([]map[string]any, error) {
	if strings.TrimSpace(cdugestora) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.CacaFantasmasAnalise(queryCtx, cdugestora, filtros)
	})
}

func (u UseCase) DNACNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.DNACNPJ(queryCtx, cnpj) })
}

func (u UseCase) PainelCovidUF(ctx context.Context, uf string) ([]map[string]any, error) {
	if len(strings.TrimSpace(uf)) != 2 {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.PainelCovidUF(queryCtx, uf) })
}

func (u UseCase) INPOrgao(ctx context.Context, query map[string]string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.INPOrgao(queryCtx, query) })
}

func (u UseCase) INPCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if cpf != "" && !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.INPCPF(queryCtx, cpf) })
}

func (u UseCase) MapaConsumo(ctx context.Context, query map[string]string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.MapaConsumo(queryCtx, query) })
}

func (u UseCase) Relacionamentos(ctx context.Context, tipo string, valor string, query map[string]string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.Relacionamentos(queryCtx, tipo, valor, query)
	})
}

func (u UseCase) Faccoes(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.Faccoes(queryCtx, tipo, valor) })
}

// FaccoesMutation atende CRUD/validacao sensivel da tela de faccoes.
// Chamado pelos handlers/apps admin; repository executa a escrita em tabelas FACCOES_APP.
func (u UseCase) FaccoesMutation(ctx context.Context, tipo string, id string, userID int64, payload map[string]any) ([]map[string]any, error) {
	if userID <= 0 {
		return nil, types.ErrInvalidPayload
	}
	if strings.TrimSpace(tipo) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.FaccoesMutation(queryCtx, tipo, id, userID, payload)
	})
}

func (u UseCase) TipoRankUF(ctx context.Context) ([]map[string]any, error) {
	return u.rows(ctx, u.repo.TipoRankUF)
}

func (u UseCase) TipoRankMunicipio(ctx context.Context, uf string, municipio string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.TipoRankMunicipio(queryCtx, uf, municipio)
	})
}

func (u UseCase) ArielFoto(ctx context.Context, payload map[string]any) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.ArielFoto(queryCtx, payload) })
}

func (u UseCase) SimbaTop(ctx context.Context, tipo string, documento string) ([]map[string]any, error) {
	documento = utils.OnlyDigits(documento)
	if documento == "" {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.SimbaTop(queryCtx, tipo, documento)
	})
}

func (u UseCase) YellowPages(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	if strings.TrimSpace(valor) == "" {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.YellowPages(queryCtx, tipo, valor)
	})
}

func (u UseCase) SefazML(ctx context.Context, tipo string, valor string, query map[string]string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.SefazML(queryCtx, tipo, valor, query)
	})
}

func (u UseCase) Sadep(ctx context.Context, tipo string, valor string) ([]map[string]any, error) {
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) { return u.repo.Sadep(queryCtx, tipo, valor) })
}

func (u UseCase) RelacionaTipologia(ctx context.Context, pj bool, uf string) ([]map[string]any, error) {
	if len(strings.TrimSpace(uf)) != 2 {
		return nil, types.ErrInvalidParam
	}
	return u.rows(ctx, func(queryCtx context.Context) ([]map[string]any, error) {
		return u.repo.RelacionaTipologia(queryCtx, pj, uf)
	})
}

func (u UseCase) rows(ctx context.Context, fn func(context.Context) ([]map[string]any, error)) ([]map[string]any, error) {
	queryCtx, cancel := context.WithTimeout(ctx, appsTimeout)
	defer cancel()
	rows, err := fn(queryCtx)
	if errors.Is(err, context.DeadlineExceeded) || errors.Is(queryCtx.Err(), context.DeadlineExceeded) {
		return []map[string]any{}, nil
	}
	if rows == nil {
		rows = []map[string]any{}
	}
	return rows, err
}
