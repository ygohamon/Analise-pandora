package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) AuthorizedAppByToken(ctx context.Context, token string) (AuthorizedApp, error) {
	table, ok := r.models.Table("BD_PANDORA", "AUTHAPP")
	if !ok || r.db == nil {
		return AuthorizedApp{}, types.ErrModelNotConfigured
	}
	var app AuthorizedApp
	err := r.db.QueryRowContext(ctx, `
SELECT TOP 1 nome, ativo, data_inicio, data_fim
FROM `+table+`
WHERE token=@TOKEN`, sql.Named("TOKEN", token)).Scan(&app.Nome, &app.Ativo, &app.DataInicio, &app.DataExpiracao)
	if err == sql.ErrNoRows {
		return AuthorizedApp{}, types.ErrExternalAccessInvalid
	}
	if err != nil {
		return AuthorizedApp{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return app, nil
}

func (r SQLUsuarioRepository) ListAuthorizedApps(ctx context.Context) ([]types.AplicativoAutorizado, error) {
	table, ok := r.models.Table("BD_PANDORA", "AUTHAPP")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT id, nome, ativo, data_inicio, data_fim
FROM `+table+`
ORDER BY nome`)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.AplicativoAutorizado{}
	for rows.Next() {
		var app types.AplicativoAutorizado
		var inicio, fim sql.NullTime
		if err := rows.Scan(&app.ID, &app.Nome, &app.Ativo, &inicio, &fim); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		if inicio.Valid {
			app.DataInicio = inicio.Time.Format("02/01/2006")
			app.DataInicioRaw = inicio.Time.Format("2006-01-02T15:04:05")
		}
		if fim.Valid {
			app.DataExpiracao = fim.Time.Format("02/01/2006")
			app.DataExpiracaoRaw = fim.Time.Format("2006-01-02T15:04:05")
		}
		out = append(out, app)
	}
	if err := rows.Err(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func (r SQLUsuarioRepository) CreateAuthorizedApp(ctx context.Context, app types.AplicativoPayload, token string) error {
	table, ok := r.models.Table("BD_PANDORA", "AUTHAPP")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	inicio, fim, err := appDateRange(app.DataInicio, app.DataExpiracao)
	if err != nil {
		return types.ErrInvalidParam.WithCause(err)
	}
	_, err = r.db.ExecContext(ctx, `
INSERT INTO `+table+` (nome, token, data_inicio, data_fim, ativo)
VALUES (@NOME, @TOKEN, @DATA_INICIO, @DATA_FIM, @ATIVO)`,
		sql.Named("NOME", app.Nome),
		sql.Named("TOKEN", token),
		sql.Named("DATA_INICIO", inicio),
		sql.Named("DATA_FIM", fim),
		sql.Named("ATIVO", app.Ativo),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) UpdateAuthorizedApp(ctx context.Context, app types.AplicativoPayload) error {
	table, ok := r.models.Table("BD_PANDORA", "AUTHAPP")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	inicio, fim, err := appDateRange(app.DataInicio, app.DataExpiracao)
	if err != nil {
		return types.ErrInvalidParam.WithCause(err)
	}
	_, err = r.db.ExecContext(ctx, `
UPDATE `+table+`
SET data_inicio=@DATA_INICIO, data_fim=@DATA_FIM, ativo=@ATIVO
WHERE id=@ID`,
		sql.Named("ID", app.ID),
		sql.Named("DATA_INICIO", inicio),
		sql.Named("DATA_FIM", fim),
		sql.Named("ATIVO", app.Ativo),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) DeleteAuthorizedApp(ctx context.Context, id int64) error {
	table, ok := r.models.Table("BD_PANDORA", "AUTHAPP")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `DELETE FROM `+table+` WHERE id=@ID`, sql.Named("ID", id))
	return dbExecErr(err)
}
