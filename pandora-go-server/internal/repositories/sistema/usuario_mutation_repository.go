package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

// UpdatePreferences grava somente preferencias de interface/relatorio do usuario.
// Chamado pelo dialog Meu Perfil; nao aceita payload livre de cadastro.
func (r SQLUsuarioRepository) UpdatePreferences(ctx context.Context, id int64, patch UserPreferencePatch) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	if err := r.ensureUserPreferenceColumns(ctx, table); err != nil {
		return err
	}
	setParts := []string{"data_atualizacao = GETDATE()"}
	args := []any{sql.Named("ID", id)}
	if patch.TemaEscuro != nil {
		setParts = append(setParts, "tema_escuro = @TEMA_ESCURO")
		args = append(args, sql.Named("TEMA_ESCURO", *patch.TemaEscuro))
	}
	if patch.ESPA != nil {
		setParts = append(setParts, "espa = @ESPA")
		args = append(args, sql.Named("ESPA", *patch.ESPA))
	}
	if len(setParts) == 1 {
		return types.ErrInvalidParam
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE `+table+`
SET `+strings.Join(setParts, ", ")+`
WHERE id = @ID`, args...)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// ResetPassword e usado por administradores para gerar nova senha temporaria.
func (r SQLUsuarioRepository) ResetPassword(ctx context.Context, id int64, password string) error {
	return r.UpdatePassword(ctx, id, password)
}

// ResetAllLocalPasswords força troca de senha para usuarios locais ativos.
func (r SQLUsuarioRepository) ResetAllLocalPasswords(ctx context.Context, password string) error {
	table, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE `+table+`
SET senha = @SENHA, proximo_logon = 1, data_atualizacao = GETDATE()
WHERE ativo = 1 AND UPPER(ISNULL(acesso, '')) = 'LOCAL'`,
		sql.Named("SENHA", utils.HashSenha(password)),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// UserHistory retorna o historico resumido exibido no dialog Meu Historico.
func (r SQLUsuarioRepository) UserHistory(ctx context.Context, login string, quantity int, offset int) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	if quantity <= 0 {
		quantity = 200
	}
	if quantity > 1000 {
		quantity = 1000
	}
	if offset < 0 {
		offset = 0
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	CONVERT(varchar(33), DATEADD(HOUR, -3, data_hora), 126) as data_hora,
	COALESCE(NULLIF(item, ''), NULLIF(tipo, ''), NULLIF(secao, ''), mensagem) as consulta,
	UPPER(ISNULL(valor, chave)) as valor,
	processo
FROM `+table+`
WHERE usuario = @USUARIO
ORDER BY data_hora DESC
OFFSET @OFFSET ROWS FETCH NEXT @QTD ROWS ONLY`,
		sql.Named("USUARIO", login),
		sql.Named("OFFSET", offset),
		sql.Named("QTD", quantity),
	)
	if err != nil {
		return nil, types.ErrDatabaseUnavailable.WithCause(err)
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var dataHora, consulta, valor, processo sql.NullString
		if err := rows.Scan(&dataHora, &consulta, &valor, &processo); err != nil {
			return nil, types.ErrDatabaseUnavailable.WithCause(err)
		}
		out = append(out, map[string]any{
			"data_hora": sqlString(dataHora),
			"consulta":  sqlString(consulta),
			"valor":     sqlString(valor),
			"processo":  sqlString(processo),
		})
	}
	return out, rows.Err()
}

// RemoveFalseUser remove cadastro falso quando a administracao confirma a limpeza.
func (r SQLUsuarioRepository) RemoveFalseUser(ctx context.Context, filters map[string]string) error {
	table, ok := r.models.Table("BD_PANDORA", "FALSO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	cpf := utils.OnlyDigits(filters["cpf"])
	email := strings.ToLower(strings.TrimSpace(filters["email"]))
	if cpf == "" && email == "" {
		return types.ErrInvalidParam
	}
	_, err := r.db.ExecContext(ctx, `
DELETE FROM `+table+`
WHERE (@CPF <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') = @CPF)
	OR (@EMAIL <> '' AND LOWER(ISNULL(email, '')) = @EMAIL)`,
		sql.Named("CPF", cpf),
		sql.Named("EMAIL", email),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}

// SetBlacklistStatus aplica acoes basicas de lista negra usadas pela tela administrativa.
func (r SQLUsuarioRepository) SetBlacklistStatus(ctx context.Context, action string, filters map[string]string) error {
	usuario, ok := r.models.Table("BD_PANDORA", "USUARIO")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	falso, _ := r.models.Table("BD_PANDORA", "FALSO")
	if pessoa == "" {
		return types.ErrModelNotConfigured
	}
	cpf := utils.OnlyDigits(filters["cpf"])
	email := strings.ToLower(strings.TrimSpace(filters["email"]))
	login := strings.ToLower(strings.TrimSpace(filters["login"]))
	if cpf == "" && email == "" && login == "" {
		return types.ErrInvalidParam
	}
	if action == "ativar" {
		_, err := r.db.ExecContext(ctx, `
UPDATE U
SET U.ativo = 1, U.recadastramento = 0, U.data_atualizacao = GETDATE()
FROM `+usuario+` U
	INNER JOIN `+pessoa+` P ON P.id = U.id_pessoa
WHERE (@CPF <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(P.cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') = @CPF)
	OR (@EMAIL <> '' AND LOWER(ISNULL(P.email, '')) = @EMAIL)
	OR (@LOGIN <> '' AND LOWER(ISNULL(U.login, '')) = @LOGIN)`,
			sql.Named("CPF", cpf),
			sql.Named("EMAIL", email),
			sql.Named("LOGIN", login),
		)
		if err != nil {
			return types.ErrDatabaseUnavailable.WithCause(err)
		}
		if falso != "" {
			_, _ = r.db.ExecContext(ctx, `
DELETE FROM `+falso+`
WHERE (@CPF <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') = @CPF)
	OR (@EMAIL <> '' AND LOWER(ISNULL(email, '')) = @EMAIL)`,
				sql.Named("CPF", cpf),
				sql.Named("EMAIL", email),
			)
		}
		return nil
	}
	_, err := r.db.ExecContext(ctx, `
UPDATE U
SET U.ativo = 0, U.data_atualizacao = GETDATE()
FROM `+usuario+` U
	INNER JOIN `+pessoa+` P ON P.id = U.id_pessoa
WHERE (@CPF <> '' AND REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(P.cpf, ''), '.', ''), '-', ''), '/', ''), ' ', '') = @CPF)
	OR (@EMAIL <> '' AND LOWER(ISNULL(P.email, '')) = @EMAIL)
	OR (@LOGIN <> '' AND LOWER(ISNULL(U.login, '')) = @LOGIN)`,
		sql.Named("CPF", cpf),
		sql.Named("EMAIL", email),
		sql.Named("LOGIN", login),
	)
	if err != nil {
		return types.ErrDatabaseUnavailable.WithCause(err)
	}
	return nil
}
