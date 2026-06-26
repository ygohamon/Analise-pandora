package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

func (r SQLUsuarioRepository) ListProfiles(ctx context.Context) ([]string, error) {
	return r.listSingleColumn(ctx, "PERFIL", "descricao", "perfil")
}

func (r SQLUsuarioRepository) ListFullProfiles(ctx context.Context) ([]types.PerfilAdmin, error) {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	if err := r.ensureProfileColumns(ctx, table); err != nil {
		return nil, err
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	P.id,
	P.descricao as perfil,
	P.pep,
	P.rif,
	ISNULL(P.jusbrasil, 0) as jusbrasil,
	ISNULL(P.cortex, 1) as cortex,
	ISNULL(P.seeu, 0) as seeu,
	ISNULL(P.atencao, 1) as atencao,
	ISNULL(P.risco, 1) as risco,
	ISNULL(P.servidor_estadual, 1) as servidorEstadual,
	ISNULL(P.mostrar_fontes_dados, 1) as mostrarFontesDados,
	ISNULL(P.transparencia, 1) as transparencia,
	ISNULL(P.fontes_abertas, 1) as fontesAbertas,
	ISNULL(P.pesquisa_endereco, 0) as pesquisaEndereco,
	ISNULL(P.restricao_horario, 0) as horarioAtivo,
	ISNULL(P.hora_inicio, 9) as horaInicio,
	ISNULL(P.hora_fim, 19) as horaFim,
	ISNULL(P.necessita_processo, 0) as necessitaProcesso,
	P.limite_consultas_por_processo as limiteConsultasPorProcesso,
	ISNULL(P.tempo_sessao_minutos, 15) as tempoSessaoMinutos
FROM `+table+` P`)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.PerfilAdmin{}
	for rows.Next() {
		var item types.PerfilAdmin
		var limite sql.NullInt64
		var pep, rif sql.NullBool
		if err := rows.Scan(
			&item.ID,
			&item.Perfil,
			&pep,
			&rif,
			&item.JusBrasil,
			&item.Cortex,
			&item.SEEU,
			&item.Atencao,
			&item.Risco,
			&item.ServidorEstadual,
			&item.MostrarFontesDados,
			&item.Transparencia,
			&item.FontesAbertas,
			&item.PesquisaEndereco,
			&item.HorarioAtivo,
			&item.HoraInicio,
			&item.HoraFim,
			&item.NecessitaProcesso,
			&limite,
			&item.TempoSessaoMinutos,
		); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		if limite.Valid {
			item.LimiteConsultasPorProcesso = &limite.Int64
		}
		item.PEP = utils.SQLBoolPtr(pep)
		item.RIF = utils.SQLBoolPtr(rif)
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) ensureProfileColumns(ctx context.Context, table string) error {
	columns := []struct {
		name       string
		definition string
	}{
		{"cortex", "BIT NOT NULL CONSTRAINT DF_PERFIL_CORTEX DEFAULT (1)"},
		{"mostrar_fontes_dados", "BIT NOT NULL CONSTRAINT DF_PERFIL_MOSTRAR_FONTES_DADOS DEFAULT (1)"},
		{"seeu", "BIT NOT NULL CONSTRAINT DF_PERFIL_SEEU DEFAULT (0)"},
		{"transparencia", "BIT NOT NULL CONSTRAINT DF_PERFIL_TRANSPARENCIA DEFAULT (1)"},
		{"fontes_abertas", "BIT NOT NULL CONSTRAINT DF_PERFIL_FONTES_ABERTAS DEFAULT (1)"},
		{"atencao", "BIT NOT NULL CONSTRAINT DF_PERFIL_ATENCAO DEFAULT (1)"},
		{"risco", "BIT NOT NULL CONSTRAINT DF_PERFIL_RISCO DEFAULT (1)"},
		{"servidor_estadual", "BIT NOT NULL CONSTRAINT DF_PERFIL_SERVIDOR_ESTADUAL DEFAULT (1)"},
		{"pesquisa_endereco", "BIT NOT NULL CONSTRAINT DF_PERFIL_PESQUISA_ENDERECO DEFAULT (0)"},
		{"restricao_horario", "BIT NOT NULL CONSTRAINT DF_PERFIL_RESTRICAO_HORARIO DEFAULT (0)"},
		{"hora_inicio", "INT NOT NULL CONSTRAINT DF_PERFIL_HORA_INICIO DEFAULT (9)"},
		{"hora_fim", "INT NOT NULL CONSTRAINT DF_PERFIL_HORA_FIM DEFAULT (19)"},
		{"necessita_processo", "BIT NOT NULL CONSTRAINT DF_PERFIL_NECESSITA_PROCESSO DEFAULT (0)"},
		{"limite_consultas_por_processo", "INT NULL"},
		{"tempo_sessao_minutos", "INT NOT NULL CONSTRAINT DF_PERFIL_TEMPO_SESSAO DEFAULT (15)"},
	}
	for _, column := range columns {
		_, err := r.db.ExecContext(ctx, `
IF COL_LENGTH('`+table+`', '`+column.name+`') IS NULL
BEGIN
	ALTER TABLE `+table+`
	ADD `+column.name+` `+column.definition+`;
END`)
		if err != nil {
			return types.ErrDatabaseUnavailable.WithCause(err)
		}
	}
	return nil
}

func (r SQLUsuarioRepository) ListAccesses(ctx context.Context) ([]string, error) {
	return r.listSingleColumn(ctx, "USUARIO", "DISTINCT acesso", "acesso")
}

func (r SQLUsuarioRepository) ListGroups(ctx context.Context) ([]string, error) {
	return r.listSingleColumn(ctx, "GRUPO", "DISTINCT descricao", "grupo")
}

func (r SQLUsuarioRepository) ListPermissionCatalog(ctx context.Context) ([]map[string]string, error) {
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
SELECT DISTINCT S.descricao as secao, I.descricao as item
FROM `+perfil+` P
	INNER JOIN `+perfilItem+` PI ON (P.id = PI.id_perfil)
	INNER JOIN `+item+` I ON (PI.id_item = I.id)
	INNER JOIN `+secao+` S ON (I.id_secao = S.id)
UNION
SELECT DISTINCT S.descricao as secao, I.descricao as item
FROM `+usuario+` U
	INNER JOIN `+usuarioItem+` UI ON (U.id = UI.id_usuario)
	INNER JOIN `+item+` I ON (UI.id_item = I.id)
	INNER JOIN `+secao+` S ON (I.id_secao = S.id)
ORDER BY secao, item`)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []map[string]string{}
	for rows.Next() {
		var secaoValue, itemValue sql.NullString
		if err := rows.Scan(&secaoValue, &itemValue); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		out = append(out, map[string]string{
			"secao": sqlString(secaoValue),
			"item":  sqlString(itemValue),
		})
	}
	if err := rows.Err(); err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func (r SQLUsuarioRepository) ProfilePermissions(ctx context.Context, id int64) ([]types.Permissao, error) {
	perfil, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	perfilItem, _ := r.models.Table("BD_PANDORA", "PERFIL_ITEM")
	item, _ := r.models.Table("BD_PANDORA", "ITEM")
	secao, _ := r.models.Table("BD_PANDORA", "SECAO")
	if perfilItem == "" || item == "" || secao == "" {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT S.id AS id_secao, S.descricao AS secao, I.id AS id_item, I.descricao AS item
FROM `+perfil+` P
	INNER JOIN `+perfilItem+` PI ON P.id = PI.id_perfil
	INNER JOIN `+item+` I ON PI.id_item = I.id
	INNER JOIN `+secao+` S ON I.id_secao = S.id
WHERE P.id = @ID`, sql.Named("ID", id))
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	return scanPermissions(rows)
}

func (r SQLUsuarioRepository) ProfileSchedule(ctx context.Context, id int64) (types.PerfilHorario, error) {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.PerfilHorario{}, types.ErrModelNotConfigured
	}
	out := types.PerfilHorario{IDPerfil: id, Ativo: false, HoraInicio: 9, HoraFim: 19}
	err := r.db.QueryRowContext(ctx, `
SELECT TOP 1
	P.id as idPerfil,
	ISNULL(P.restricao_horario, 0) as ativo,
	ISNULL(P.hora_inicio, 9) as horaInicio,
	ISNULL(P.hora_fim, 19) as horaFim
FROM `+table+` P
WHERE P.id = @ID`, sql.Named("ID", id)).Scan(&out.IDPerfil, &out.Ativo, &out.HoraInicio, &out.HoraFim)
	if err == sql.ErrNoRows {
		return out, nil
	}
	if err != nil {
		return types.PerfilHorario{}, types.ErrDatabaseUnavailable.WithCause(err)
	}
	return out, nil
}

func (r SQLUsuarioRepository) UsersByProfile(ctx context.Context, id int64) ([]types.PerfilUsuario, error) {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	if pessoa == "" {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT U.id, U.login, ISNULL(PU.nome, U.login) AS nome
FROM `+usuario+` U
	LEFT JOIN `+pessoa+` PU ON (U.id_pessoa = PU.id)
WHERE U.id_perfil = @ID
ORDER BY U.login`, sql.Named("ID", id))
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []types.PerfilUsuario{}
	for rows.Next() {
		var item types.PerfilUsuario
		if err := rows.Scan(&item.ID, &item.Login, &item.Nome); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (r SQLUsuarioRepository) listSingleColumn(ctx context.Context, modelKey, selectExpr, alias string) ([]string, error) {
	table, ok := r.models.Table("BD_PANDORA", modelKey)
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `SELECT `+selectExpr+` as `+alias+` FROM `+table)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []string{}
	for rows.Next() {
		var value sql.NullString
		if err := rows.Scan(&value); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		if value.Valid && strings.TrimSpace(value.String) != "" {
			out = append(out, value.String)
		}
	}
	return out, rows.Err()
}
