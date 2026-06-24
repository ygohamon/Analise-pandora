package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) ListInactivePreUsers(ctx context.Context) ([]types.PessoaUsuarioCadastro, error) {
	pessoa, usuario, perfil, err := r.userTables()
	if err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	P.id, nome, cpf, identidade, org_emissor, uf_org_emissor,
	matricula, titularidade, lotacao, email, telefone,
	CONVERT(varchar(33), P.data_cadastro, 126), CONVERT(varchar(33), P.data_atualizacao, 126),
	P.ativado,
	CASE
		WHEN (P.ativado = 0 AND U.id IS NULL) THEN 'cadastro'
		WHEN (P.ativado = 0 AND U.ativo = 0 AND U.recadastramento = 0) THEN 'recadastro'
		ELSE NULL
	END as origem,
	U.login, U.acesso, PE.descricao as perfil, P.termo
FROM `+pessoa+` P
	LEFT OUTER JOIN `+usuario+` U ON (U.id_pessoa = P.id)
	LEFT OUTER JOIN `+perfil+` PE ON (U.id_perfil = PE.id)
WHERE (P.ativado = 0 AND U.id IS NULL) OR (P.ativado = 0 AND U.ativo = 0 AND U.recadastramento = 0)
ORDER BY data_cadastro`)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.PessoaUsuarioCadastro{}
	for rows.Next() {
		var p types.PessoaUsuarioCadastro
		var identidade, org, uf, matricula, titularidade, lotacao, email, telefone, dataCadastro, dataAtualizacao, origem, login, acesso, perfil sql.NullString
		var termo sql.NullString
		if err := rows.Scan(&p.ID, &p.Nome, &p.CPF, &identidade, &org, &uf, &matricula, &titularidade, &lotacao, &email, &telefone, &dataCadastro, &dataAtualizacao, &p.Ativado, &origem, &login, &acesso, &perfil, &termo); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		p.Identidade = sqlString(identidade)
		p.OrgEmissor = sqlString(org)
		p.UFOrgEmissor = sqlString(uf)
		p.Matricula = sqlString(matricula)
		p.Titularidade = sqlString(titularidade)
		p.Lotacao = sqlString(lotacao)
		p.Email = sqlString(email)
		p.Telefone = sqlString(telefone)
		p.Origem = sqlString(origem)
		p.Login = sqlString(login)
		p.Acesso = sqlString(acesso)
		p.Perfil = sqlString(perfil)
		p.DataCadastro = utils.SQLStringPtr(dataCadastro)
		p.DataAtualizacao = utils.SQLStringPtr(dataAtualizacao)
		p.Termo = utils.SQLStringPtr(termo)
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) FindPreUser(ctx context.Context, id int64) (types.PessoaUsuarioCadastro, error) {
	table, ok := r.models.Table("BD_PANDORA", "PESSOA")
	if !ok || r.db == nil {
		return types.PessoaUsuarioCadastro{}, types.ErrModelNotConfigured
	}
	var p types.PessoaUsuarioCadastro
	var identidade, org, uf, matricula, titularidade, lotacao, email, telefone, dataCadastro, termo sql.NullString
	err := r.db.QueryRowContext(ctx, `
SELECT
	id, nome, cpf, identidade, org_emissor, uf_org_emissor,
	matricula, titularidade, lotacao, email, telefone,
	CONVERT(varchar(33), data_cadastro, 126) as dataCadastro,
	ativado, termo
FROM `+table+`
WHERE id = @ID`, sql.Named("ID", id)).Scan(&p.ID, &p.Nome, &p.CPF, &identidade, &org, &uf, &matricula, &titularidade, &lotacao, &email, &telefone, &dataCadastro, &p.Ativado, &termo)
	if err == sql.ErrNoRows {
		return types.PessoaUsuarioCadastro{}, types.ErrNotFound
	}
	if err != nil {
		return types.PessoaUsuarioCadastro{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	p.Identidade = sqlString(identidade)
	p.OrgEmissor = sqlString(org)
	p.UFOrgEmissor = sqlString(uf)
	p.Matricula = sqlString(matricula)
	p.Titularidade = sqlString(titularidade)
	p.Lotacao = sqlString(lotacao)
	p.Email = sqlString(email)
	p.Telefone = sqlString(telefone)
	p.DataCadastro = utils.SQLStringPtr(dataCadastro)
	p.Termo = utils.SQLStringPtr(termo)
	return p, nil
}

func (r SQLUsuarioRepository) PreUserExistsByCPFOrEmail(ctx context.Context, p types.PessoaUsuarioCadastro) (bool, error) {
	table, ok := r.models.Table("BD_PANDORA", "PESSOA")
	if !ok || r.db == nil {
		return false, types.ErrModelNotConfigured
	}
	var found int
	err := r.db.QueryRowContext(ctx, `SELECT TOP 1 1 FROM `+table+` WHERE cpf=@CPF OR email=@EMAIL`,
		sql.Named("CPF", p.CPF),
		sql.Named("EMAIL", p.Email),
	).Scan(&found)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return true, nil
}

func (r SQLUsuarioRepository) CreatePreUser(ctx context.Context, p types.PessoaUsuarioCadastro, ativado bool) error {
	table, ok := r.models.Table("BD_PANDORA", "PESSOA")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `
INSERT INTO `+table+` (nome, cpf, identidade, org_emissor, uf_org_emissor, matricula, titularidade, lotacao, email, telefone, ativado)
VALUES (@NOME, @CPF, @IDENTIDADE, @ORGEMISSOR, @UFORGEMISSOR, @MATRICULA, @TITULARIDADE, @LOTACAO, @EMAIL, @TELEFONE, @ATIVADO)`,
		sql.Named("NOME", p.Nome), sql.Named("CPF", p.CPF), sql.Named("IDENTIDADE", nullableString(p.Identidade)),
		sql.Named("ORGEMISSOR", nullableString(p.OrgEmissor)), sql.Named("UFORGEMISSOR", nullableString(p.UFOrgEmissor)),
		sql.Named("MATRICULA", nullableString(p.Matricula)), sql.Named("TITULARIDADE", nullableString(p.Titularidade)),
		sql.Named("LOTACAO", nullableString(p.Lotacao)), sql.Named("EMAIL", p.Email), sql.Named("TELEFONE", nullableString(p.Telefone)),
		sql.Named("ATIVADO", ativado),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) UpdatePreUser(ctx context.Context, p types.PessoaUsuarioCadastro, idPessoa int64) error {
	table, ok := r.models.Table("BD_PANDORA", "PESSOA")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE `+table+` SET nome=@NOME, cpf=@CPF, identidade=@IDENTIDADE, org_emissor=@ORGEMISSOR, uf_org_emissor=@UFORGEMISSOR,
	matricula=@MATRICULA, titularidade=@TITULARIDADE, lotacao=@LOTACAO, email=@EMAIL, telefone=@TELEFONE, ativado=0
WHERE id=@ID`,
		sql.Named("ID", idPessoa), sql.Named("NOME", p.Nome), sql.Named("CPF", p.CPF), sql.Named("IDENTIDADE", nullableString(p.Identidade)),
		sql.Named("ORGEMISSOR", nullableString(p.OrgEmissor)), sql.Named("UFORGEMISSOR", nullableString(p.UFOrgEmissor)),
		sql.Named("MATRICULA", nullableString(p.Matricula)), sql.Named("TITULARIDADE", nullableString(p.Titularidade)),
		sql.Named("LOTACAO", nullableString(p.Lotacao)), sql.Named("EMAIL", p.Email), sql.Named("TELEFONE", nullableString(p.Telefone)),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) PersonIDByUserID(ctx context.Context, id int64) (int64, error) {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return 0, types.ErrModelNotConfigured
	}
	var idPessoa sql.NullInt64
	err := r.db.QueryRowContext(ctx, `SELECT id_pessoa FROM `+table+` WHERE id=@ID`, sql.Named("ID", id)).Scan(&idPessoa)
	if err == sql.ErrNoRows || !idPessoa.Valid {
		return 0, types.ErrNotFound
	}
	if err != nil {
		return 0, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return idPessoa.Int64, nil
}

func (r SQLUsuarioRepository) UserIDByPersonID(ctx context.Context, idPessoa int64) (int64, error) {
	pessoa, usuario, _, err := r.userTables()
	if err != nil {
		return 0, err
	}
	var id int64
	err = r.db.QueryRowContext(ctx, `SELECT TOP 1 U.id FROM `+usuario+` U INNER JOIN `+pessoa+` P ON (U.id_pessoa=P.id) WHERE P.id=@ID`, sql.Named("ID", idPessoa)).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, types.ErrNotFound
	}
	if err != nil {
		return 0, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return id, nil
}

func (r SQLUsuarioRepository) ActivatePreUser(ctx context.Context, id int64) error {
	return r.execByID(ctx, "PESSOA", `UPDATE %s SET ativado=1 WHERE id=@ID`, id)
}

func (r SQLUsuarioRepository) DeactivatePreUser(ctx context.Context, id int64) error {
	return r.execByID(ctx, "PESSOA", `UPDATE %s SET ativado=0 WHERE id=@ID`, id)
}

func (r SQLUsuarioRepository) DeletePreUser(ctx context.Context, id int64) error {
	return r.execByID(ctx, "PESSOA", `DELETE FROM %s WHERE id=@ID`, id)
}

func (r SQLUsuarioRepository) ActivateUser(ctx context.Context, id int64) error {
	return r.execByID(ctx, "USUARIO", `UPDATE %s SET ativo=1 WHERE id=@ID`, id)
}

func (r SQLUsuarioRepository) DeactivateUser(ctx context.Context, id int64) error {
	return r.execByID(ctx, "USUARIO", `UPDATE %s SET ativo=0 WHERE id=@ID`, id)
}

func (r SQLUsuarioRepository) SetUserRecadastramento(ctx context.Context, id int64, value bool) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `UPDATE `+table+` SET recadastramento=@RECADASTRAMENTO WHERE id=@ID`, sql.Named("ID", id), sql.Named("RECADASTRAMENTO", value))
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) CreateUserFromActivation(ctx context.Context, p types.PessoaUsuarioCadastro) error {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	if perfil == "" {
		return types.ErrModelNotConfigured
	}
	senha := sql.NullString{}
	proximoLogon := false
	if strings.EqualFold(p.Acesso, "LOCAL") {
		senha = sql.NullString{String: utils.HashSenha(p.Senha), Valid: true}
		proximoLogon = true
	}
	_, err := r.db.ExecContext(ctx, `
INSERT INTO `+usuario+` (id_pessoa, id_usuario_ativador, id_perfil, ativo, acesso, login, senha, proximo_logon, necessita_processo, recadastramento, setupTFA)
SELECT @ID_PESSOA, @ID_USUARIO_ATIVADOR, P.ID, 1, @ACESSO, @LOGIN, @SENHA, @PROXIMO_LOGON, 1, 0, 1
FROM `+perfil+` P
WHERE descricao=@DESCRICAO_PERFIL`,
		sql.Named("ID_PESSOA", p.ID), sql.Named("ID_USUARIO_ATIVADOR", nullableInt64(p.IDCadastrador)),
		sql.Named("ACESSO", p.Acesso), sql.Named("LOGIN", p.Login), sql.Named("SENHA", senha),
		sql.Named("PROXIMO_LOGON", proximoLogon), sql.Named("DESCRICAO_PERFIL", p.Perfil),
	)
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) execByID(ctx context.Context, modelKey, stmt string, id int64) error {
	table, ok := r.models.Table("BD_PANDORA", modelKey)
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, strings.Replace(stmt, "%s", table, 1), sql.Named("ID", id))
	return dbExecErr(err)
}

func (r SQLUsuarioRepository) userTables() (string, string, string, error) {
	pessoa, ok := r.models.Table("BD_PANDORA", "PESSOA")
	if !ok || r.db == nil {
		return "", "", "", types.ErrModelNotConfigured
	}
	usuario, _ := r.models.Table("BD_PANDORA", "USUARIO")
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	if usuario == "" || perfil == "" {
		return "", "", "", types.ErrModelNotConfigured
	}
	return pessoa, usuario, perfil, nil
}
