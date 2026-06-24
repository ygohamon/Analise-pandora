package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) RecentLogs(ctx context.Context, quantity int, offset int) ([]types.LogSistema, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	if quantity <= 0 {
		quantity = 100
	}
	if offset < 0 {
		offset = 0
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	ip, usuario, secao, item, chave, valor, tipo, code, mensagem,
	url, user_agent as userAgent, os, browser, device, processo, tipo_processo as tipoProcesso,
	CONVERT(varchar(33), DATEADD(HOUR, -3, data_hora), 126) as dataHora
FROM `+table+`
ORDER BY data_hora DESC
OFFSET @OFFSET ROWS FETCH NEXT @QTD ROWS ONLY`,
		sql.Named("QTD", quantity),
		sql.Named("OFFSET", offset),
	)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.LogSistema{}
	for rows.Next() {
		var item types.LogSistema
		var ip, usuario, secao, itemValue, chave, valor, tipo, code, mensagem sql.NullString
		var url, userAgent, osValue, browser, device, processo, tipoProcesso, dataHora sql.NullString
		if err := rows.Scan(&ip, &usuario, &secao, &itemValue, &chave, &valor, &tipo, &code, &mensagem, &url, &userAgent, &osValue, &browser, &device, &processo, &tipoProcesso, &dataHora); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.IP = utils.SQLStringPtr(ip)
		item.Usuario = utils.SQLStringPtr(usuario)
		item.Secao = utils.SQLStringPtr(secao)
		item.Item = utils.SQLStringPtr(itemValue)
		item.Chave = utils.SQLStringPtr(chave)
		item.Valor = utils.SQLStringPtr(valor)
		item.Tipo = utils.SQLStringPtr(tipo)
		item.Code = utils.SQLStringPtr(code)
		item.Mensagem = utils.SQLStringPtr(mensagem)
		item.URL = utils.SQLStringPtr(url)
		item.UserAgent = utils.SQLStringPtr(userAgent)
		item.OS = utils.SQLStringPtr(osValue)
		item.Browser = utils.SQLStringPtr(browser)
		item.Device = utils.SQLStringPtr(device)
		item.Processo = utils.SQLStringPtr(processo)
		item.TipoProcesso = utils.SQLStringPtr(tipoProcesso)
		item.DataHora = utils.SQLStringPtr(dataHora)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) LegacyNoProfileLogsCount(ctx context.Context) (int64, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return 0, types.ErrModelNotConfigured
	}
	var count int64
	err := r.db.QueryRowContext(ctx, `
SELECT COUNT(*) AS qtd
FROM `+table+`
WHERE tipo = 'TENTATIVA DE CONSULTA SEM PERFIL DE ACESSO'
	OR item = 'TENTATIVA DE CONSULTA SEM PERFIL DE ACESSO'`).Scan(&count)
	if err != nil {
		return 0, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return count, nil
}

func (r SQLUsuarioRepository) ValidTokens(ctx context.Context, durationSeconds int) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	if durationSeconds <= 0 {
		durationSeconds = 21600
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	ip,
	usuario,
	tipo,
	CONVERT(varchar(33), data_hora, 126) as dataHora,
	CONVERT(varchar(33), DATEADD(SECOND, @DURACAO, data_hora), 126) as validade,
	user_agent
FROM `+table+`
WHERE secao='SISTEMA'
	AND (tipo='LOGIN EXTERNO' OR tipo='LOGIN')
	AND data_hora >= DATEADD(SECOND, -@DURACAO, GETDATE())
ORDER BY data_hora DESC`, sql.Named("DURACAO", durationSeconds))
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) UserLogs(ctx context.Context, login string, top *int) ([]types.LogAcessoUsuario, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	topClause := ""
	args := []any{sql.Named("USUARIO", login)}
	if top != nil && *top > 0 {
		topClause = "TOP (@TOP)"
		args = append(args, sql.Named("TOP", *top))
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT `+topClause+`
	usuario, ip, secao, item, chave, UPPER(valor) as valor, UPPER(mensagem) as mensagem,
	processo, user_agent as userAgent, os, CONVERT(varchar(33), DATEADD(HOUR, -3, data_hora), 126) as dataHora
FROM `+table+`
WHERE usuario = @USUARIO
ORDER BY data_hora DESC`, args...)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.LogAcessoUsuario{}
	for rows.Next() {
		var item types.LogAcessoUsuario
		var usuario, ip, secao, itemValue, chave, valor, mensagem, processo, userAgent, osValue, dataHora sql.NullString
		if err := rows.Scan(&usuario, &ip, &secao, &itemValue, &chave, &valor, &mensagem, &processo, &userAgent, &osValue, &dataHora); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.Usuario = utils.SQLStringPtr(usuario)
		item.IP = utils.SQLStringPtr(ip)
		item.Secao = utils.SQLStringPtr(secao)
		item.Item = utils.SQLStringPtr(itemValue)
		item.Chave = utils.SQLStringPtr(chave)
		item.Valor = utils.SQLStringPtr(valor)
		item.Mensagem = utils.SQLStringPtr(mensagem)
		item.Processo = utils.SQLStringPtr(processo)
		item.UserAgent = utils.SQLStringPtr(userAgent)
		item.OS = utils.SQLStringPtr(osValue)
		item.DataHora = utils.SQLStringPtr(dataHora)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) UserLogsByCPF(ctx context.Context, cpf string, top *int) ([]types.LogAcessoUsuario, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	usuario, _ := r.models.Table("BD_PANDORA", "USUARIO")
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	if usuario == "" || pessoa == "" {
		return nil, types.ErrModelNotConfigured
	}
	topClause := ""
	args := []any{sql.Named("CPF", cpf)}
	if top != nil && *top > 0 {
		topClause = "TOP (@TOP)"
		args = append(args, sql.Named("TOP", *top))
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT `+topClause+`
	L.usuario, L.ip, L.secao, L.item, L.chave,
	UPPER(L.valor) as valor, UPPER(L.mensagem) as mensagem,
	L.processo, L.user_agent as userAgent, L.os,
	CONVERT(varchar(33), DATEADD(HOUR, -3, L.data_hora), 126) as dataHora
FROM `+logTable+` L
	INNER JOIN `+usuario+` U ON (L.usuario = U.login)
	INNER JOIN `+pessoa+` P ON (U.id_pessoa = P.id)
WHERE REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(P.cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') = @CPF
ORDER BY L.data_hora DESC`, args...)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	return scanUserLogs(rows)
}
