package repositories

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) ListDeletedUsers(ctx context.Context) ([]types.UsuarioFalso, error) {
	table, ok := r.models.Table("BD_PANDORA", "FALSO")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `SELECT nome, email, cpf, matricula, telefone FROM `+table)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.UsuarioFalso{}
	for rows.Next() {
		var item types.UsuarioFalso
		var nome, email, cpf, matricula, telefone sql.NullString
		if err := rows.Scan(&nome, &email, &cpf, &matricula, &telefone); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.Nome = utils.SQLStringPtr(nome)
		item.Email = utils.SQLStringPtr(email)
		item.CPF = utils.SQLStringPtr(cpf)
		item.Matricula = utils.SQLStringPtr(matricula)
		item.Telefone = utils.SQLStringPtr(telefone)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) ListBlacklist(ctx context.Context) ([]types.ListaNegraUsuario, error) {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	logTable, _ := r.models.Table("BD_PANDORA", "LOG")
	if pessoa == "" || perfil == "" || logTable == "" {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	'SUSPENSO' AS situacao,
	U.login,
	PU.nome,
	PU.email,
	PU.cpf,
	PU.matricula,
	PU.telefone,
	P.descricao AS perfil,
	CONVERT(varchar(33), DATEADD(HOUR, -3, U.data_atualizacao), 126) AS dataSituacao,
	COUNT(L.usuario) AS qtdLogs,
	CONVERT(varchar(33), DATEADD(HOUR, -3, MAX(L.data_hora)), 126) AS ultimoRegistro
FROM `+usuario+` U
	INNER JOIN `+pessoa+` PU ON U.id_pessoa = PU.id
	LEFT JOIN `+perfil+` P ON U.id_perfil = P.id
	LEFT JOIN `+logTable+` L ON L.usuario = U.login
WHERE ISNULL(U.ativo, 0) = 0
GROUP BY U.login, PU.nome, PU.email, PU.cpf, PU.matricula, PU.telefone, P.descricao, U.data_atualizacao
ORDER BY ultimoRegistro DESC`)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.ListaNegraUsuario{}
	for rows.Next() {
		var item types.ListaNegraUsuario
		var nome, email, cpf, matricula, telefone, perfilValue, dataSituacao, ultimoRegistro sql.NullString
		if err := rows.Scan(
			&item.Situacao,
			&item.Login,
			&nome,
			&email,
			&cpf,
			&matricula,
			&telefone,
			&perfilValue,
			&dataSituacao,
			&item.QtdLogs,
			&ultimoRegistro,
		); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.Nome = utils.SQLStringPtr(nome)
		item.Email = utils.SQLStringPtr(email)
		item.CPF = utils.SQLStringPtr(cpf)
		item.Matricula = utils.SQLStringPtr(matricula)
		item.Telefone = utils.SQLStringPtr(telefone)
		item.Perfil = utils.SQLStringPtr(perfilValue)
		item.DataSituacao = utils.SQLStringPtr(dataSituacao)
		item.UltimoRegistro = utils.SQLStringPtr(ultimoRegistro)
		out = append(out, item)
	}
	return out, rows.Err()
}
