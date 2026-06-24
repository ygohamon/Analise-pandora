package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func normalizeLogin(login string) string {
	return strings.ToLower(strings.TrimSpace(login))
}

func (r SQLUsuarioRepository) LoginStatus(ctx context.Context, login string) (UsuarioStatus, error) {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return UsuarioStatus{}, types.ErrModelNotConfigured
	}
	var status UsuarioStatus
	var ativo bool
	var acesso sql.NullString
	err := r.db.QueryRowContext(ctx, `
SELECT TOP 1 ativo, acesso
FROM `+table+`
WHERE LOWER(LTRIM(RTRIM(login)))=@LOGIN`,
		sql.Named("LOGIN", normalizeLogin(login)),
	).Scan(&ativo, &acesso)
	if err == sql.ErrNoRows {
		return UsuarioStatus{}, types.ErrLoginFailed
	}
	if err != nil {
		return UsuarioStatus{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	status.Ativo = ativo
	if acesso.Valid {
		status.Acesso = acesso.String
	}
	return status, nil
}

func (r SQLUsuarioRepository) AuthenticateLocal(ctx context.Context, login string, password string) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	var id int64
	err := r.db.QueryRowContext(ctx, `
SELECT TOP 1 id
FROM `+table+`
WHERE (login=@LOGIN OR LOWER(LTRIM(RTRIM(login)))=@LOGIN_NORMALIZED)
	AND (
		senha=@SENHA_MD5
		OR RIGHT(senha, 64) = CONVERT(VARCHAR(64), HASHBYTES('SHA2_256', LEFT(senha, 64) + CAST(@SENHA_CLARO AS VARCHAR(8000))), 2)
	)`,
		sql.Named("LOGIN", login),
		sql.Named("LOGIN_NORMALIZED", normalizeLogin(login)),
		sql.Named("SENHA_MD5", utils.MD5Hex(password)),
		sql.Named("SENHA_CLARO", password),
	).Scan(&id)
	if err == sql.ErrNoRows {
		return types.ErrLoginFailed
	}
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}
