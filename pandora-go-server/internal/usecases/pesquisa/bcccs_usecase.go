package usecases

import (
	"context"
	"fmt"
	"strings"

	"pandora-go-server/internal/integrations/bcccs"
	repositories "pandora-go-server/internal/repositories/pesquisa"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// BCCCSUseCase valida a consulta PIX, audita o acesso e orquestra API externa + apoio local.
type BCCCSUseCase struct {
	repo   repositories.BCCCSRepository
	client bcccs.Client
}

// BCCCSRequest carrega os dados obrigatorios da tela PIX e da auditoria.
type BCCCSRequest struct {
	Tipo         string
	Valor        string
	Motivo       string
	UserID       int64
	IP           string
	Processo     string
	TipoProcesso string
}

// NewBCCCSUseCase cria o caso de uso chamado pelos handlers /bcccs.
func NewBCCCSUseCase(repo repositories.BCCCSRepository, client bcccs.Client) BCCCSUseCase {
	return BCCCSUseCase{repo: repo, client: client}
}

// ConsultaPix valida CPF/CNPJ/chave, grava auditoria e retorna os vinculos PIX para a tela.
func (u BCCCSUseCase) ConsultaPix(ctx context.Context, req BCCCSRequest) ([]map[string]any, error) {
	req.Tipo = strings.ToLower(strings.TrimSpace(req.Tipo))
	req.Motivo = strings.TrimSpace(req.Motivo)
	req.Processo = strings.TrimSpace(req.Processo)
	req.TipoProcesso = strings.TrimSpace(req.TipoProcesso)
	if req.Motivo == "" || req.Processo == "" || req.TipoProcesso == "" || req.UserID <= 0 {
		return nil, types.ErrInvalidPayload
	}

	documento, audit, err := u.normalizaEntrada(req)
	if err != nil {
		return nil, err
	}
	audit.UserID = req.UserID
	audit.Motivo = req.Motivo
	audit.IP = req.IP
	audit.Processo = req.Processo
	audit.TipoProcesso = req.TipoProcesso

	auditID, err := u.repo.InsertPixAudit(ctx, audit)
	if err != nil {
		return nil, err
	}

	var dados []map[string]any
	switch req.Tipo {
	case "cpf", "cnpj":
		dados, err = u.client.VinculosPorDocumento(ctx, documento, req.Motivo)
	case "chave":
		dados, err = u.client.VinculoPorChave(ctx, documento, req.Motivo)
	default:
		err = types.ErrInvalidParam
	}
	if err != nil {
		_ = u.repo.UpdatePixAuditResponse(ctx, auditID, map[string]any{"status": "ESERVER", "erro": err.Error()})
		return nil, types.ErrDependencyUnavailable.WithCause(err)
	}

	u.enriqueceBancos(ctx, dados)
	resposta := map[string]any{"status": "OK", "dados": dados}
	if err := u.repo.UpdatePixAuditResponse(ctx, auditID, resposta); err != nil {
		return nil, err
	}
	return dados, nil
}

func (u BCCCSUseCase) normalizaEntrada(req BCCCSRequest) (string, repositories.PixAuditInput, error) {
	audit := repositories.PixAuditInput{}
	switch req.Tipo {
	case "cpf":
		cpf := utils.NormalizeCPF(req.Valor)
		if !validators.ValidCPF(cpf) {
			return "", audit, types.ErrInvalidCPF
		}
		audit.CPF = cpf
		return cpf, audit, nil
	case "cnpj":
		cnpj := utils.NormalizeCNPJ(req.Valor)
		if !validators.ValidCNPJ(cnpj) {
			return "", audit, types.ErrInvalidCNPJ
		}
		audit.CNPJ = cnpj
		return cnpj, audit, nil
	case "chave":
		chave := strings.TrimSpace(req.Valor)
		if chave == "" {
			return "", audit, types.ErrInvalidParam
		}
		audit.ChavePix = chave
		return chave, audit, nil
	default:
		return "", audit, types.ErrInvalidParam
	}
}

func (u BCCCSUseCase) enriqueceBancos(ctx context.Context, dados []map[string]any) {
	cache := map[string]string{}
	for _, row := range dados {
		ispb := stringFromAny(row["participante"])
		if ispb == "" {
			continue
		}
		nome, ok := cache[ispb]
		if !ok {
			nome, _ = u.repo.BankNameByISPB(ctx, ispb)
			cache[ispb] = nome
		}
		if nome != "" {
			row["banco"] = nome
		}
	}
}

func stringFromAny(value any) string {
	if value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case []byte:
		return strings.TrimSpace(string(typed))
	default:
		return strings.TrimSpace(fmt.Sprint(value))
	}
}
