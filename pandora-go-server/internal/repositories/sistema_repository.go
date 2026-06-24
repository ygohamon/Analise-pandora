package repositories

import (
	"context"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) ActiveMailerUsers(ctx context.Context) ([]map[string]any, error) {
	pessoa, usuario, _, err := r.userTables()
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT P.nome, P.email, U.login
FROM `+usuario+` U
INNER JOIN `+pessoa+` P ON U.id_pessoa = P.id
WHERE U.ativo = 1 AND P.email IS NOT NULL`)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) AccessLimitIPHistory(ctx context.Context, blacklist bool) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	blacklistSQL := "AND tipo <> 'BLACKLIST'"
	if blacklist {
		blacklistSQL = "AND tipo = 'BLACKLIST'"
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT TOP 1000 ip, usuario, url, user_agent, os, browser, device, data_hora
FROM `+logTable+`
WHERE code = 'EQUOTAEMPTY' AND chave = 'LIMITE_IP_DIA' `+blacklistSQL+`
ORDER BY data_hora DESC`)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) AccessLimitUserHistory(ctx context.Context) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT TOP 1000 ip, usuario, url, user_agent, os, browser, device, data_hora
FROM `+logTable+`
WHERE code = 'EQUOTAEMPTY' AND chave = 'LIMITE_USUARIO' AND tipo <> 'BLACKLIST'
ORDER BY data_hora DESC`)
	return rowsToMaps(rows, err)
}
