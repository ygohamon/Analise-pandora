package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) Permissions(ctx context.Context, login string, id int64) ([]types.Permissao, error) {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	perfilItem, _ := r.models.Table("BD_PANDORA", "PERFIL_ITEM")
	usuarioItem, _ := r.models.Table("BD_PANDORA", "USUARIO_ITEM")
	item, _ := r.models.Table("BD_PANDORA", "ITEM")
	secao, _ := r.models.Table("BD_PANDORA", "SECAO")
	if perfil == "" || perfilItem == "" || usuarioItem == "" || item == "" || secao == "" {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
FROM `+perfil+` P
	INNER JOIN `+perfilItem+` PI ON (P.id = PI.id_perfil)
	INNER JOIN `+item+` I ON (PI.id_item = I.id)
	INNER JOIN `+secao+` S ON (I.id_secao = S.id)
OUTER APPLY(
	SELECT P.descricao
	FROM `+usuario+` U
		INNER JOIN `+perfil+` P ON (U.id_perfil = P.id)
	WHERE U.login = @LOGIN OR U.id = @ID
) U
WHERE P.descricao = U.descricao
UNION
SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
FROM `+usuario+` U
	INNER JOIN `+usuarioItem+` UI ON (U.id = UI.id_usuario)
	INNER JOIN `+item+` I ON (UI.id_item = I.id)
	INNER JOIN `+secao+` S ON (I.id_secao = S.id)
WHERE U.login = @LOGIN OR U.id = @ID`,
		sql.Named("LOGIN", login),
		sql.Named("ID", id),
	)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	return scanPermissions(rows)
}
