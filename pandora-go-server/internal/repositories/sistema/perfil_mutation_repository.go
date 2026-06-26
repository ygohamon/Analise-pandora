package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
)

var profileFlagColumns = map[string]string{
	"pep":               "pep",
	"rif":               "rif",
	"jusbrasil":         "jusbrasil",
	"cortex":            "cortex",
	"seeu":              "seeu",
	"transparencia":     "transparencia",
	"fontes-abertas":    "fontes_abertas",
	"fontes_dados":      "mostrar_fontes_dados",
	"fontes-dados":      "mostrar_fontes_dados",
	"atencao":           "atencao",
	"risco":             "risco",
	"servidor-estadual": "servidor_estadual",
	"pesquisa-endereco": "pesquisa_endereco",
}

// UpdateProfileFlag altera uma flag allowlisted de perfil.
// Chamado pelas rotas administrativas /sistema/perfil/{id}/{flag}.
func (r SQLUsuarioRepository) UpdateProfileFlag(ctx context.Context, id int64, key string, value any) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	if err := r.ensureProfileColumns(ctx, table); err != nil {
		return err
	}
	column, ok := profileFlagColumns[strings.ToLower(strings.TrimSpace(key))]
	if !ok {
		return types.ErrInvalidParam
	}
	boolValue := normalizeBool(value)
	_, err := r.db.ExecContext(ctx, `
IF COL_LENGTH('`+table+`', '`+column+`') IS NULL
BEGIN
	RAISERROR('Coluna de perfil nao encontrada.', 16, 1);
	RETURN;
END
UPDATE `+table+`
SET `+column+` = @VALUE
WHERE id = @ID`,
		sql.Named("ID", id),
		sql.Named("VALUE", boolValue),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// UpdateProfileSchedule grava a janela de horario permitida para o perfil.
func (r SQLUsuarioRepository) UpdateProfileSchedule(ctx context.Context, id int64, active bool, start int64, end int64) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE `+table+`
SET restricao_horario = @ATIVO, hora_inicio = @INICIO, hora_fim = @FIM
WHERE id = @ID`,
		sql.Named("ID", id),
		sql.Named("ATIVO", active),
		sql.Named("INICIO", start),
		sql.Named("FIM", end),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// UpdateProfileProcess grava exigencia e limite de processo por perfil.
func (r SQLUsuarioRepository) UpdateProfileProcess(ctx context.Context, id int64, required bool, limit *int64) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	var limitValue any
	if limit != nil {
		limitValue = *limit
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE `+table+`
SET necessita_processo = @NECESSITA, limite_consultas_por_processo = @LIMITE
WHERE id = @ID`,
		sql.Named("ID", id),
		sql.Named("NECESSITA", required),
		sql.Named("LIMITE", limitValue),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// UpdateProfileSession grava o timeout de sessao do perfil em minutos.
func (r SQLUsuarioRepository) UpdateProfileSession(ctx context.Context, id int64, minutes int64) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	if minutes < 5 {
		minutes = 5
	}
	if minutes > 1440 {
		minutes = 1440
	}
	_, err := r.db.ExecContext(ctx, `
IF COL_LENGTH('`+table+`', 'tempo_sessao_minutos') IS NULL
BEGIN
	ALTER TABLE `+table+`
	ADD tempo_sessao_minutos INT NOT NULL CONSTRAINT DF_PERFIL_TEMPO_SESSAO DEFAULT (15);
END
UPDATE `+table+`
SET tempo_sessao_minutos = @TEMPO
WHERE id = @ID`,
		sql.Named("ID", id),
		sql.Named("TEMPO", minutes),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// CreateProfile cria perfil administrativo basico com flags conhecidas.
func (r SQLUsuarioRepository) CreateProfile(ctx context.Context, profile types.PerfilAdmin) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	if strings.TrimSpace(profile.Perfil) == "" {
		return types.ErrInvalidParam
	}
	if err := r.ensureProfileColumns(ctx, table); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx, `
INSERT INTO `+table+` (
	descricao, pep, rif, jusbrasil, cortex, seeu, atencao, risco,
	servidor_estadual, mostrar_fontes_dados, fontes_abertas, transparencia, pesquisa_endereco
) VALUES (
	@PERFIL, @PEP, @RIF, @JUSBRASIL, @CORTEX, @SEEU, @ATENCAO, @RISCO,
	@SERVIDOR_ESTADUAL, @FONTES_DADOS, @FONTES_ABERTAS, @TRANSPARENCIA, @PESQUISA_ENDERECO
)`,
		sql.Named("PERFIL", strings.TrimSpace(profile.Perfil)),
		sql.Named("PEP", boolPtrValue(profile.PEP)),
		sql.Named("RIF", boolPtrValue(profile.RIF)),
		sql.Named("JUSBRASIL", profile.JusBrasil),
		sql.Named("CORTEX", profile.Cortex),
		sql.Named("SEEU", profile.SEEU),
		sql.Named("ATENCAO", profile.Atencao),
		sql.Named("RISCO", profile.Risco),
		sql.Named("SERVIDOR_ESTADUAL", profile.ServidorEstadual),
		sql.Named("FONTES_DADOS", profile.MostrarFontesDados),
		sql.Named("FONTES_ABERTAS", profile.FontesAbertas),
		sql.Named("TRANSPARENCIA", profile.Transparencia),
		sql.Named("PESQUISA_ENDERECO", profile.PesquisaEndereco),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// DeleteProfile remove perfil sem reescrever as regras de integridade do banco.
func (r SQLUsuarioRepository) DeleteProfile(ctx context.Context, id int64) error {
	table, ok := r.models.Table("BD_PANDORA", "PERFIL")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `DELETE FROM `+table+` WHERE id = @ID`, sql.Named("ID", id))
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// UpdateProfilePermissions substitui os itens de permissao do perfil por IDs de item.
func (r SQLUsuarioRepository) UpdateProfilePermissions(ctx context.Context, id int64, perms []types.Permissao) error {
	perfilItem, ok := r.models.Table("BD_PANDORA", "PERFIL_ITEM")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	itemTable, _ := r.models.Table("BD_PANDORA", "ITEM")
	secaoTable, _ := r.models.Table("BD_PANDORA", "SECAO")
	if itemTable == "" || secaoTable == "" {
		return types.ErrModelNotConfigured
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.ExecContext(ctx, `DELETE FROM `+perfilItem+` WHERE id_perfil = @ID`, sql.Named("ID", id)); err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	for _, perm := range perms {
		idItem := perm.IDItem
		if idItem <= 0 && strings.TrimSpace(perm.Secao) != "" && strings.TrimSpace(perm.Item) != "" {
			_ = tx.QueryRowContext(ctx, `
SELECT TOP 1 I.id
FROM `+itemTable+` I
	INNER JOIN `+secaoTable+` S ON I.id_secao = S.id
WHERE LOWER(S.descricao) = LOWER(@SECAO)
	AND LOWER(I.descricao) = LOWER(@ITEM)`,
				sql.Named("SECAO", strings.TrimSpace(perm.Secao)),
				sql.Named("ITEM", strings.TrimSpace(perm.Item)),
			).Scan(&idItem)
		}
		if idItem <= 0 {
			continue
		}
		if _, err := tx.ExecContext(ctx, `
INSERT INTO `+perfilItem+` (id_perfil, id_item)
VALUES (@ID_PERFIL, @ID_ITEM)`,
			sql.Named("ID_PERFIL", id),
			sql.Named("ID_ITEM", idItem),
		); err != nil {
			return types.ErrDatabaseUnavailable.WithCause(err)
		}
	}
	if err := tx.Commit(); err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

func normalizeBool(value any) bool {
	switch v := value.(type) {
	case bool:
		return v
	case float64:
		return v != 0
	case int:
		return v != 0
	case string:
		value := strings.ToLower(strings.TrimSpace(v))
		return value == "true" || value == "1" || value == "sim" || value == "yes"
	default:
		return false
	}
}

func boolPtrValue(value *bool) bool {
	return value != nil && *value
}
