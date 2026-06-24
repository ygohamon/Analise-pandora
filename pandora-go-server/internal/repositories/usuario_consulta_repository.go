package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) FindByLogin(ctx context.Context, login string) (types.Usuario, error) {
	return r.find(ctx, login, 0)
}

func (r SQLUsuarioRepository) FindByID(ctx context.Context, id int64) (types.Usuario, error) {
	return r.find(ctx, "", id)
}

func (r SQLUsuarioRepository) ListUsers(ctx context.Context, search string) ([]types.UsuarioAdmin, error) {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	usuarioGrupo, _ := r.models.Table("BD_PANDORA", "USUARIO_GRUPO")
	grupo, _ := r.models.Table("BD_PANDORA", "GRUPO")
	if pessoa == "" || perfil == "" || usuarioGrupo == "" || grupo == "" {
		return nil, types.ErrModelNotConfigured
	}

	where := ""
	args := []any{}
	search = strings.TrimSpace(search)
	if search != "" {
		digits := utils.OnlyDigits(search)
		where = `
WHERE LOWER(U.login) LIKE @BUSCA
	OR LOWER(ISNULL(PU.nome, '')) LIKE @BUSCA`
		args = append(args,
			sql.Named("BUSCA", "%"+strings.ToLower(search)+"%"),
		)
		if digits != "" {
			where += `
	OR REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(PU.cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') LIKE @BUSCA_DIGITS`
			args = append(args, sql.Named("BUSCA_DIGITS", "%"+digits+"%"))
		}
	}

	rows, err := r.db.QueryContext(ctx, `
SELECT
	U.id,
	PU.nome,
	U.login,
	PU.email,
	U.ativo,
	U.acesso,
	P.descricao as perfil,
	G.grupos,
	U.proximo_logon as proximoLogon,
	ISNULL(P.necessita_processo, U.necessita_processo) as necessitaProcesso,
	U.recadastramento,
	UC.login as cadastrador,
	CONVERT(varchar(33), U.data_criacao, 126) as dataCriacao,
	CONVERT(varchar(33), U.data_atualizacao, 126) as dataAtualizacao,
	PU.lotacao,
	PU.titularidade,
	PU.cpf,
	PU.telefone,
	U.validado
FROM `+usuario+` U
	LEFT OUTER JOIN `+pessoa+` PU ON (U.id_pessoa = PU.id)
	INNER JOIN `+perfil+` P ON (U.id_perfil = P.id)
	OUTER APPLY (
		SELECT login
		FROM `+usuario+`
		WHERE id = U.id_usuario_ativador
	) UC
	OUTER APPLY (
		SELECT STRING_AGG(_G.descricao, '|') as grupos
		FROM `+usuario+` _U
			INNER JOIN `+usuarioGrupo+` _UG ON (_UG.id_usuario = _U.id)
			INNER JOIN `+grupo+` _G ON (_UG.id_grupo = _G.id)
		WHERE _U.login = U.login
	) AS G
`+where+`
ORDER BY PU.nome, U.login`, args...)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()

	out := []types.UsuarioAdmin{}
	for rows.Next() {
		var item types.UsuarioAdmin
		var nome, email, acesso, grupos, cadastrador, dataCriacao, dataAtualizacao sql.NullString
		var lotacao, titularidade, cpf, telefone sql.NullString
		var validado sql.NullBool
		if err := rows.Scan(
			&item.ID,
			&nome,
			&item.Login,
			&email,
			&item.Ativo,
			&acesso,
			&item.Perfil,
			&grupos,
			&item.ProximoLogon,
			&item.NecessitaProcesso,
			&item.Recadastramento,
			&cadastrador,
			&dataCriacao,
			&dataAtualizacao,
			&lotacao,
			&titularidade,
			&cpf,
			&telefone,
			&validado,
		); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		item.Nome = utils.SQLStringPtr(nome)
		item.Email = utils.SQLStringPtr(email)
		item.Cadastrador = utils.SQLStringPtr(cadastrador)
		item.DataCriacao = utils.SQLStringPtr(dataCriacao)
		item.DataAtualizacao = utils.SQLStringPtr(dataAtualizacao)
		item.Lotacao = utils.SQLStringPtr(lotacao)
		item.Titularidade = utils.SQLStringPtr(titularidade)
		item.CPF = utils.SQLStringPtr(cpf)
		item.Telefone = utils.SQLStringPtr(telefone)
		if acesso.Valid {
			item.Acesso = acesso.String
		}
		item.Grupos = []string{}
		if grupos.Valid && strings.TrimSpace(grupos.String) != "" {
			item.Grupos = strings.Split(grupos.String, "|")
		}
		if validado.Valid {
			value := validado.Bool
			item.Validado = &value
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func (r SQLUsuarioRepository) find(ctx context.Context, login string, id int64) (types.Usuario, error) {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.Usuario{}, types.ErrModelNotConfigured
	}
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	perfil, _ := r.models.Table("BD_PANDORA", "PERFIL")
	usuarioGrupo, _ := r.models.Table("BD_PANDORA", "USUARIO_GRUPO")
	grupo, _ := r.models.Table("BD_PANDORA", "GRUPO")
	if pessoa == "" || perfil == "" || usuarioGrupo == "" || grupo == "" {
		return types.Usuario{}, types.ErrModelNotConfigured
	}
	if err := r.ensureProfileColumns(ctx, perfil); err != nil {
		return types.Usuario{}, err
	}

	row := r.db.QueryRowContext(ctx, `
SELECT TOP 1
	U.id,
	U.id_pessoa,
	U.id_usuario_ativador,
	P.descricao as perfil,
	U.ativo,
	U.acesso,
	U.login,
	U.recadastramento,
	U.proximo_logon,
	ISNULL(P.necessita_processo, U.necessita_processo),
	P.limite_consultas_por_processo,
	COALESCE(U.setupTFA, 0),
	U.keyTFA,
	PU.email,
	PU.cpf,
	CASE WHEN PU.nome IS NULL THEN U.login ELSE PU.nome END as nome,
	G.grupos,
	ISNULL(P.pep, 0) as pep,
	ISNULL(P.rif, 0) as rif,
	ISNULL(P.jusbrasil, 0) as jusbrasil,
	ISNULL(P.cortex, 1) as cortex,
	ISNULL(P.seeu, 0) as seeu,
	ISNULL(P.transparencia, 1) as transparencia,
	ISNULL(P.fontes_abertas, 1) as fontesAbertas
FROM `+usuario+` U
	INNER JOIN `+perfil+` P ON (U.id_perfil = P.id)
	LEFT OUTER JOIN `+pessoa+` PU ON (PU.id = U.id_pessoa)
	OUTER APPLY (
		SELECT STRING_AGG(_G.descricao, '|') as grupos
		FROM `+usuario+` _U
			INNER JOIN `+usuarioGrupo+` _UG ON (_UG.id_usuario = _U.id)
			INNER JOIN `+grupo+` _G ON (_UG.id_grupo = _G.id)
		WHERE _U.login = U.login
	) AS G
WHERE U.id=@ID OR LOWER(LTRIM(RTRIM(U.login)))=@LOGIN`,
		sql.Named("ID", id),
		sql.Named("LOGIN", normalizeLogin(login)),
	)

	var out types.Usuario
	var idPessoa, idAtivador sql.NullInt64
	var email, cpf, nome, grupos, acesso, keyTFA sql.NullString
	var limiteConsultasPorProcesso sql.NullInt64
	var pep, rif, jusbrasil, cortex, seeu, transparencia, fontesAbertas bool
	if err := row.Scan(
		&out.ID,
		&idPessoa,
		&idAtivador,
		&out.Perfil,
		&out.Ativo,
		&acesso,
		&out.Login,
		&out.Recadastramento,
		&out.ProximoLogon,
		&out.NecessitaProcesso,
		&limiteConsultasPorProcesso,
		&out.SetupTFA,
		&keyTFA,
		&email,
		&cpf,
		&nome,
		&grupos,
		&pep,
		&rif,
		&jusbrasil,
		&cortex,
		&seeu,
		&transparencia,
		&fontesAbertas,
	); err != nil {
		if err == sql.ErrNoRows {
			return types.Usuario{}, types.ErrNotFound
		}
		return types.Usuario{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	if idPessoa.Valid {
		out.IDPessoa = &idPessoa.Int64
	}
	if idAtivador.Valid {
		out.IDAtivador = &idAtivador.Int64
	}
	if limiteConsultasPorProcesso.Valid {
		out.LimiteConsultasPorProcesso = &limiteConsultasPorProcesso.Int64
	}
	out.Email = utils.SQLStringPtr(email)
	out.CPF = utils.SQLStringPtr(cpf)
	out.Nome = utils.SQLStringPtr(nome)
	out.KeyTFA = utils.SQLStringPtr(keyTFA)
	out.PEP = pep
	out.RIF = rif
	out.JusBrasil = jusbrasil
	out.Cortex = cortex
	out.SEEU = seeu
	out.Transparencia = transparencia
	out.FontesAbertas = fontesAbertas
	if acesso.Valid {
		out.Acesso = acesso.String
	}
	out.Grupos = []string{}
	if grupos.Valid && strings.TrimSpace(grupos.String) != "" {
		out.Grupos = strings.Split(grupos.String, "|")
	}
	return out, nil
}
