package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) StoreTFASecret(ctx context.Context, login string, secret string) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `UPDATE `+table+` SET keyTFA=@KEYTFA, setupTFA=0 WHERE login=@LOGIN`,
		sql.Named("LOGIN", login),
		sql.Named("KEYTFA", secret),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) MarkTFASetup(ctx context.Context, login string) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `UPDATE `+table+` SET setupTFA=1 WHERE login=@LOGIN`, sql.Named("LOGIN", login))
	return dbExecErr(err)
}
