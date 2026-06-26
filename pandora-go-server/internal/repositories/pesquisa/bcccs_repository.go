package repositories

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"strings"
	"time"

	"pandora-go-server/internal/modelconfig"
	"pandora-go-server/internal/types"
)

// BCCCSRepository cuida somente da auditoria PIX e do apoio local da consulta BCCCS.
type BCCCSRepository interface {
	InsertPixAudit(context.Context, PixAuditInput) (int64, error)
	UpdatePixAuditResponse(context.Context, int64, any) error
	BankNameByISPB(context.Context, string) (string, error)
}

// PixAuditInput e o registro minimo gravado antes da chamada externa.
type PixAuditInput struct {
	UserID       int64
	CPF          string
	CNPJ         string
	ChavePix     string
	Motivo       string
	IP           string
	Processo     string
	TipoProcesso string
}

// SQLBCCCSRepository executa SQL especifico de auditoria PIX e lookup de banco.
type SQLBCCCSRepository struct {
	db     *sql.DB
	models modelconfig.Registry
}

// NewSQLBCCCSRepository cria o repository usado pelo BCCCSUseCase.
func NewSQLBCCCSRepository(db *sql.DB, models modelconfig.Registry) SQLBCCCSRepository {
	return SQLBCCCSRepository{db: db, models: models}
}

func nullableString(value string) driver.Value {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return value
}

func sqlString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

// InsertPixAudit grava a solicitacao antes de consultar a API externa.
func (r SQLBCCCSRepository) InsertPixAudit(ctx context.Context, input PixAuditInput) (int64, error) {
	auditoria, ok := r.models.Table("BD_PANDORA", "AUDITORIA_PIX")
	if !ok || r.db == nil {
		return 0, types.ErrModelNotConfigured
	}
	var id int64
	err := r.db.QueryRowContext(ctx, `
INSERT INTO `+auditoria+`
	(id_usuario, cpf, cnpj, chave_pix, motivo, ip, processo, tipo_processo, datahora_envio)
OUTPUT INSERTED.id
VALUES
	(@ID_USUARIO, @CPF, @CNPJ, @CHAVE_PIX, @MOTIVO, @IP, @PROCESSO, @TIPO_PROCESSO, @DATAHORA_ENVIO)`,
		sql.Named("ID_USUARIO", input.UserID),
		sql.Named("CPF", nullableString(input.CPF)),
		sql.Named("CNPJ", nullableString(input.CNPJ)),
		sql.Named("CHAVE_PIX", nullableString(input.ChavePix)),
		sql.Named("MOTIVO", nullableString(input.Motivo)),
		sql.Named("IP", nullableString(input.IP)),
		sql.Named("PROCESSO", nullableString(input.Processo)),
		sql.Named("TIPO_PROCESSO", nullableString(input.TipoProcesso)),
		sql.Named("DATAHORA_ENVIO", time.Now()),
	).Scan(&id)
	if err != nil {
		return 0, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return id, nil
}

// UpdatePixAuditResponse salva o retorno resumido da API PIX depois da consulta.
func (r SQLBCCCSRepository) UpdatePixAuditResponse(ctx context.Context, id int64, resposta any) error {
	if id <= 0 {
		return nil
	}
	auditoria, ok := r.models.Table("BD_PANDORA", "AUDITORIA_PIX")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	raw, err := json.Marshal(resposta)
	if err != nil {
		return types.ErrInternal.WithCause(err)
	}
	_, err = r.db.ExecContext(ctx, `
UPDATE `+auditoria+`
SET objeto_resposta = @RESPOSTA, datahora_retorno = @DATAHORA_RETORNO
WHERE id = @ID`,
		sql.Named("ID", id),
		sql.Named("RESPOSTA", string(raw)),
		sql.Named("DATAHORA_RETORNO", time.Now()),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// BankNameByISPB busca o nome do banco quando a tabela opcional estiver configurada.
func (r SQLBCCCSRepository) BankNameByISPB(ctx context.Context, ispb string) (string, error) {
	bancos, ok := r.models.Table("API_BCCCS", "BANCOS")
	if !ok || bancos == "" || r.db == nil || ispb == "" {
		return "", nil
	}
	var nome sql.NullString
	err := r.db.QueryRowContext(ctx, `
SELECT TOP 1 name
FROM `+bancos+`
WHERE ispb = @ISPB`, sql.Named("ISPB", ispb)).Scan(&nome)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", types.ErrDatabaseUnavailable.WithCause(err)
	}
	return sqlString(nome), nil
}
