package repositories

import (
	"context"
	"database/sql"
	"strings"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) AuditPix(ctx context.Context, filters map[string]string) ([]map[string]any, error) {
	auditoria, ok := r.models.Table("BD_PANDORA", "AUDITORIA_PIX")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	usuario, _ := r.models.Table("BD_PANDORA", "USUARIO")
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	if usuario == "" || pessoa == "" {
		return nil, types.ErrModelNotConfigured
	}
	where := []string{"1=1"}
	args := []any{sql.Named("QTD", 100), sql.Named("OFFSET", 0)}
	if value := strings.TrimSpace(filters["usuario"]); value != "" {
		where = append(where, "(U.login LIKE @USUARIO OR PU.nome LIKE @USUARIO)")
		args = append(args, sql.Named("USUARIO", "%"+value+"%"))
	}
	if value := strings.TrimSpace(filters["dataInicio"]); value != "" {
		where = append(where, "A.datahora_envio >= @DATA_INICIO")
		args = append(args, sql.Named("DATA_INICIO", value))
	}
	if value := strings.TrimSpace(filters["dataFim"]); value != "" {
		where = append(where, "A.datahora_envio <= @DATA_FIM")
		args = append(args, sql.Named("DATA_FIM", value))
	}
	switch strings.ToUpper(strings.TrimSpace(filters["tipoConsulta"])) {
	case "CPF":
		where = append(where, "A.cpf IS NOT NULL")
	case "CNPJ":
		where = append(where, "A.cnpj IS NOT NULL")
	case "CHAVE_PIX":
		where = append(where, "A.chave_pix IS NOT NULL")
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	A.id,
	CASE WHEN PU.nome IS NULL THEN U.login ELSE PU.nome END as usuario,
	CASE
		WHEN A.cpf IS NOT NULL THEN 'CPF'
		WHEN A.cnpj IS NOT NULL THEN 'CNPJ'
		WHEN A.chave_pix IS NOT NULL THEN 'CHAVE_PIX'
		ELSE 'N/A'
	END as tipo_consulta,
	COALESCE(A.cpf, A.cnpj, A.chave_pix) as consulta,
	A.motivo,
	CONVERT(varchar(33), A.datahora_envio, 126) as data_hora,
	CONVERT(varchar(33), A.datahora_retorno, 126) as datahora_retorno,
	A.ip,
	A.processo,
	A.tipo_processo,
	A.objeto_resposta
FROM `+auditoria+` A
	INNER JOIN `+usuario+` U ON A.id_usuario = U.id
	LEFT OUTER JOIN `+pessoa+` PU ON (U.id_pessoa = PU.id)
WHERE `+strings.Join(where, " AND ")+`
ORDER BY A.datahora_envio DESC
OFFSET @OFFSET ROWS FETCH NEXT @QTD ROWS ONLY`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) RecurrentProcesses(ctx context.Context, period string, duration string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	usuario, _ := r.models.Table("BD_PANDORA", "USUARIO")
	pessoa, _ := r.models.Table("BD_PANDORA", "PESSOA")
	if usuario == "" || pessoa == "" {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
WITH BASE AS (
	SELECT
		L.usuario,
		L.processo,
		COALESCE(NULLIF(LTRIM(RTRIM(L.tipo_processo)), ''), CASE
			WHEN LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.processo, ''), '.', ''), '-', ''), '/', ''), ' ', ''), '_', '')) = 20
				AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.processo, ''), '.', ''), '-', ''), '/', ''), ' ', ''), '_', '') NOT LIKE '%[^0-9]%' THEN 'CNJ'
			WHEN LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.processo, ''), '.', ''), '-', ''), '/', ''), ' ', ''), '_', '')) = 17
				AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.processo, ''), '.', ''), '-', ''), '/', ''), ' ', ''), '_', '') NOT LIKE '%[^0-9]%' THEN 'MP'
			ELSE 'NÃO IDENTIFICADO'
		END) AS tipoProcesso,
		CASE
			WHEN L.item = 'INTEGRADO_P' OR (L.tipo = 'INTEGRADA' AND L.chave = 'CPF' AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '')) = 11) THEN 'INTEGRADO_P'
			WHEN L.item = 'INTEGRADO_E' OR (L.tipo = 'INTEGRADA' AND L.chave = 'CNPJ' AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '')) = 14) THEN 'INTEGRADO_E'
			ELSE ISNULL(L.item, '')
		END AS itemAnalitico,
		REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '') AS documentoConsultado,
		L.data_hora,
		CONVERT(VARCHAR(19), L.data_hora, 120) AS dataHoraSegundo,
		ISNULL(PU.titularidade, '') AS cargo,
		ISNULL(PU.lotacao, '') AS lotacao
	FROM `+logTable+` L
		LEFT JOIN `+usuario+` U ON L.usuario = U.login
		LEFT JOIN `+pessoa+` PU ON U.id_pessoa = PU.id
	WHERE L.processo IS NOT NULL
		AND LTRIM(RTRIM(L.processo)) <> ''
		AND ISNULL(L.usuario, '') <> ''
		AND L.secao = 'PESQUISA'
		AND UPPER(ISNULL(L.item, '')) <> 'PROMOTORES'
		AND ISNULL(L.code, '') <> 'ENOTAUTH'
		`+dateFilterSQL(period, duration)+`
),
DEDUP AS (
	SELECT *, ROW_NUMBER() OVER (
		PARTITION BY usuario, processo, itemAnalitico, documentoConsultado, dataHoraSegundo
		ORDER BY data_hora
	) AS rn
	FROM BASE
)
SELECT
	usuario,
	processo,
	tipoProcesso,
	COUNT(*) AS qtd,
	CONVERT(varchar(33), DATEADD(HOUR, -3, MAX(data_hora)), 126) AS dataUltima,
	cargo,
	lotacao
FROM DEDUP
WHERE rn = 1
GROUP BY usuario, processo, tipoProcesso, cargo, lotacao
ORDER BY qtd DESC`)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) RecurrentProcessDetails(ctx context.Context, login string, process string, period string, duration string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	rows, err := r.db.QueryContext(ctx, `
WITH BASE AS (
	SELECT
		L.usuario,
		L.processo,
		CASE
			WHEN L.item = 'INTEGRADO_P' OR (L.tipo = 'INTEGRADA' AND L.chave = 'CPF' AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '')) = 11) THEN 'INTEGRADO_P'
			WHEN L.item = 'INTEGRADO_E' OR (L.tipo = 'INTEGRADA' AND L.chave = 'CNPJ' AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '')) = 14) THEN 'INTEGRADO_E'
			ELSE ISNULL(L.item, '')
		END AS itemAnalitico,
		REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '') AS documentoConsultado,
		L.data_hora,
		CONVERT(VARCHAR(19), L.data_hora, 120) AS dataHoraSegundo
	FROM `+logTable+` L
	WHERE L.processo IS NOT NULL
		AND LTRIM(RTRIM(L.processo)) <> ''
		AND LOWER(ISNULL(L.usuario, '')) = LOWER(@USUARIO)
		AND L.processo = @PROCESSO
		AND L.secao = 'PESQUISA'
		AND UPPER(ISNULL(L.item, '')) <> 'PROMOTORES'
		AND ISNULL(L.code, '') <> 'ENOTAUTH'
		`+dateFilterSQL(period, duration)+`
),
DEDUP AS (
	SELECT *, ROW_NUMBER() OVER (
		PARTITION BY usuario, processo, itemAnalitico, documentoConsultado, dataHoraSegundo
		ORDER BY data_hora
	) AS rn
	FROM BASE
)
SELECT
	documentoConsultado,
	itemAnalitico AS item,
	COUNT(*) AS qtd,
	CONVERT(varchar(33), DATEADD(HOUR, -3, MAX(data_hora)), 126) AS dataUltima,
	STRING_AGG(CONVERT(VARCHAR(MAX), CONVERT(VARCHAR(19), DATEADD(HOUR, -3, data_hora), 120)), '; ') AS datasConsultas
FROM DEDUP
WHERE rn = 1
	AND documentoConsultado <> ''
	AND LEN(documentoConsultado) IN (11, 14)
GROUP BY documentoConsultado, itemAnalitico
ORDER BY qtd DESC, dataUltima DESC, documentoConsultado`,
		sql.Named("USUARIO", login),
		sql.Named("PROCESSO", process),
	)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) AuditAlerts(ctx context.Context, category string, minimum int, period string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	if minimum <= 0 {
		minimum = 1
	}
	category = strings.ToLower(strings.TrimSpace(category))
	if category == "" {
		category = "risco"
	}
	filter, err := r.auditAlertFilter(category)
	if err != nil {
		return nil, err
	}
	label := "Bloqueio, fraude ou risco"
	if category == "pep" {
		label = "Consulta integrada com retorno PEP"
	} else if category == "autoridades" {
		label = "Consulta a autoridades"
	}
	rows, err := r.db.QueryContext(ctx, `
WITH EVENTOS AS (
	SELECT
		L.usuario,
		L.ip,
		L.item,
		L.valor,
		REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '') AS valorNormalizado,
		L.processo,
		L.mensagem,
		L.data_hora,
		DATEADD(HOUR, -3, L.data_hora) AS dataHoraLocal
	FROM `+logTable+` L
	WHERE L.usuario IS NOT NULL
		AND `+filter+`
		`+dateFilterSQL(period, "-1")+`
),
AGREGADOS AS (
	SELECT
		usuario,
		COUNT(*) AS qtd,
		MIN(data_hora) AS primeiroRegistro,
		MAX(data_hora) AS ultimoRegistro
	FROM EVENTOS
	GROUP BY usuario
	HAVING COUNT(*) >= @MINIMO
)
SELECT
	@CATEGORIA AS categoria,
	A.usuario,
	A.qtd,
	CONVERT(varchar(33), DATEADD(HOUR, -3, A.primeiroRegistro), 126) AS primeiroRegistro,
	CONVERT(varchar(33), DATEADD(HOUR, -3, A.ultimoRegistro), 126) AS ultimoRegistro,
	E.item AS ultimoItem,
	E.valor AS ultimoValor,
	E.processo AS ultimoProcesso,
	E.ip AS ultimoIp,
	E.mensagem AS ultimoMensagem,
	CASE WHEN @TIPO_ALERTA = 'pep' THEN ISNULL(DET.detalhesJson, '[]') ELSE NULL END AS detalhes
FROM AGREGADOS A
OUTER APPLY (
	SELECT TOP 1 item, valor, processo, ip, mensagem
	FROM EVENTOS E
	WHERE E.usuario = A.usuario
	ORDER BY E.data_hora DESC
) E
OUTER APPLY (
	SELECT
		D.cpfConsultado,
		CONVERT(VARCHAR(10), D.dataConsulta, 23) AS dataConsulta,
		COUNT(*) AS qtdDia,
		STRING_AGG(CONVERT(VARCHAR(19), D.dataHoraLocal, 120), '; ') AS datasConsultas
	FROM (
		SELECT
			NULLIF(EV.valorNormalizado, '') AS cpfConsultado,
			CAST(EV.dataHoraLocal AS DATE) AS dataConsulta,
			EV.dataHoraLocal
		FROM EVENTOS EV
		WHERE EV.usuario = A.usuario
	) D
	WHERE D.cpfConsultado IS NOT NULL
	GROUP BY D.cpfConsultado, D.dataConsulta
	ORDER BY D.dataConsulta DESC, qtdDia DESC, D.cpfConsultado
	FOR JSON PATH
) DET(detalhesJson)
ORDER BY A.qtd DESC, A.ultimoRegistro DESC`,
		sql.Named("MINIMO", minimum),
		sql.Named("CATEGORIA", label),
		sql.Named("TIPO_ALERTA", category),
	)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) auditAlertFilter(category string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(category)) {
	case "pep":
		pep, ok := r.models.Table("BD_PEP", "PEP")
		if !ok || pep == "" {
			return "", types.ErrModelNotConfigured
		}
		return `
			L.secao = 'PESQUISA'
			AND L.item IN ('PESSOA', 'EMPRESA')
			AND L.tipo = 'INTEGRADA'
			AND EXISTS (
				SELECT 1
				FROM ` + pep + ` PEP
				WHERE PEP.CPF_PEP = REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(L.valor, ''), '.', ''), '-', ''), '/', ''), ' ', '')
			)
		`, nil
	case "autoridades":
		return `
			(
				UPPER(ISNULL(L.item, '')) LIKE '%PROMOTOR%'
				OR UPPER(ISNULL(L.chave, '')) LIKE '%PROMOTOR%'
				OR UPPER(ISNULL(L.valor, '')) LIKE '%PROMOTOR%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%PROMOTOR%'
				OR UPPER(ISNULL(L.item, '')) LIKE '%PROCURADOR%'
				OR UPPER(ISNULL(L.valor, '')) LIKE '%PROCURADOR%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%PROCURADOR%'
				OR UPPER(ISNULL(L.item, '')) LIKE '%JUIZ%'
				OR UPPER(ISNULL(L.valor, '')) LIKE '%JUIZ%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%JUIZ%'
				OR UPPER(ISNULL(L.item, '')) LIKE '%DESEMBARGADOR%'
				OR UPPER(ISNULL(L.valor, '')) LIKE '%DESEMBARGADOR%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%DESEMBARGADOR%'
			)
		`, nil
	default:
		return `
			(
				UPPER(ISNULL(L.item, '')) LIKE 'ACESSO BLOQUEADO -%'
				OR UPPER(ISNULL(L.item, '')) LIKE '%TENTATIVA DE CONSULTA SEM PERFIL%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%ROTA NAO AUTORIZADA%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%ROTA NÃO AUTORIZADA%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%ASSINATURA DE REQUISICAO%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%NONCE%'
				OR UPPER(ISNULL(L.mensagem, '')) LIKE '%USER AGENT%'
				OR UPPER(ISNULL(L.code, '')) IN ('ENOTAUTH', 'ETOKENINVALIDO', 'EPARAMINVALIDO')
			)
		`, nil
	}
}
