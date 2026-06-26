package repositories

import (
	"context"
	"database/sql"
	"strings"
	"time"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) ErrorLogs(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	table, ok := r.models.Table("BD_PANDORA", "LOG_ERROS")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	where := []string{}
	args := []any{}
	if value := strings.TrimSpace(filters["de"]); value != "" {
		where = append(where, "ultimo_registro >= @DE")
		args = append(args, sql.Named("DE", value))
	}
	if value := strings.TrimSpace(filters["ate"]); value != "" {
		where = append(where, "ultimo_registro <= @ATE")
		args = append(args, sql.Named("ATE", value))
	}
	if value := strings.TrimSpace(filters["tipo"]); value != "" {
		where = append(where, "LOWER(tipo) = LOWER(@TIPO)")
		args = append(args, sql.Named("TIPO", value))
	}
	if value := strings.TrimSpace(filters["arquivo"]); value != "" {
		where = append(where, "LOWER(ISNULL(arquivo,'')) LIKE LOWER(@ARQUIVO)")
		args = append(args, sql.Named("ARQUIVO", "%"+value+"%"))
	}
	if value := strings.TrimSpace(filters["mensagem"]); value != "" {
		where = append(where, "LOWER(mensagem) LIKE LOWER(@MENSAGEM)")
		args = append(args, sql.Named("MENSAGEM", "%"+value+"%"))
	}
	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	tipo,
	arquivo,
	mensagem,
	quantidade,
	CONVERT(varchar(33), primeiro_registro, 126) as primeiroRegistro,
	CONVERT(varchar(33), ultimo_registro, 126) as ultimoRegistro,
	ultimo_stack as ultimoStack,
	ultimo_url as ultimoUrl,
	usuario,
	app,
	linha,
	coluna
FROM `+table+`
`+whereSQL+`
ORDER BY ultimo_registro DESC`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) UpsertErrorLog(ctx context.Context, payload types.ErrorLogPayload) error {
	table, ok := r.models.Table("BD_PANDORA", "LOG_ERROS")
	if !ok || r.db == nil {
		return types.ErrModelNotConfigured
	}
	tipo := strings.ToLower(strings.TrimSpace(payload.Tipo))
	mensagem := strings.TrimSpace(payload.Mensagem)
	if tipo == "" || mensagem == "" {
		return types.ErrInvalidParam
	}
	agora := strings.TrimSpace(payload.DataHora)
	if agora == "" {
		agora = time.Now().Format(time.RFC3339)
	}
	_, err := r.db.ExecContext(ctx, `
MERGE `+table+` AS alvo
USING (SELECT @TIPO AS tipo, @ARQUIVO AS arquivo, @MENSAGEM AS mensagem) AS src
	ON (alvo.tipo = src.tipo AND ISNULL(alvo.arquivo,'') = ISNULL(src.arquivo,'') AND alvo.mensagem = src.mensagem)
WHEN MATCHED THEN
	UPDATE SET
		quantidade = alvo.quantidade + 1,
		ultimo_registro = @AGORA,
		ultimo_stack = ISNULL(@STACK, alvo.ultimo_stack),
		ultimo_url = ISNULL(@URL, alvo.ultimo_url),
		usuario = ISNULL(@USUARIO, alvo.usuario),
		app = ISNULL(@APP, alvo.app),
		linha = ISNULL(@LINHA, alvo.linha),
		coluna = ISNULL(@COLUNA, alvo.coluna)
WHEN NOT MATCHED THEN
	INSERT (tipo, arquivo, mensagem, quantidade, primeiro_registro, ultimo_registro, ultimo_stack, ultimo_url, usuario, app, linha, coluna)
	VALUES (@TIPO, @ARQUIVO, @MENSAGEM, 1, @AGORA, @AGORA, @STACK, @URL, @USUARIO, @APP, @LINHA, @COLUNA);`,
		sql.Named("TIPO", tipo),
		sql.Named("ARQUIVO", nullableString(payload.Arquivo)),
		sql.Named("MENSAGEM", mensagem),
		sql.Named("STACK", nullableString(payload.Stack)),
		sql.Named("URL", nullableString(payload.URL)),
		sql.Named("USUARIO", nullableString(payload.Usuario)),
		sql.Named("APP", nullableString(payload.App)),
		sql.Named("LINHA", nullableInt64(payload.Linha)),
		sql.Named("COLUNA", nullableInt64(payload.Coluna)),
		sql.Named("AGORA", agora),
	)
	return dbExecErr(err)
}
