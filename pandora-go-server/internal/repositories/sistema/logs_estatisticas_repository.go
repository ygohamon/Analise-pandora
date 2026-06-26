package repositories

import (
	"context"
	"database/sql"
	"strconv"
	"strings"

	"pandora-go-server/internal/types"
)

func (r SQLUsuarioRepository) Rankings(ctx context.Context, ranking string, duration string, top string, parameter string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	topValue := safeTop(top, 100)
	durationSQL, args := durationFilter("data_hora", duration)

	switch strings.ToLower(strings.TrimSpace(ranking)) {
	case "uso":
		rows, err := r.db.QueryContext(ctx, `
SELECT TOP (`+strconv.Itoa(topValue)+`)
	LOWER(usuario) as usuario,
	COUNT(DISTINCT CONCAT(CAST(data_hora AS DATE), ':', CAST(DATEPART(HOUR, data_hora) AS VARCHAR(2)), ':', CAST(DATEPART(MINUTE, data_hora) AS VARCHAR(2)), ':', CAST(DATEPART(SECOND, data_hora) AS VARCHAR(2)))) as qtd
FROM `+logTable+`
WHERE secao <> 'SISTEMA'
`+durationSQL+`
AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
GROUP BY usuario
ORDER BY qtd DESC`, args...)
		return rowsToMaps(rows, err)
	case "pesquisa":
		switch strings.ToLower(strings.TrimSpace(parameter)) {
		case "cpf":
			pessoa, ok := r.models.Table("BD_PANDORA", "PESSOA")
			if !ok || pessoa == "" {
				return nil, types.ErrModelNotConfigured
			}
			rows, err := r.db.QueryContext(ctx, `
;WITH CPFS_MAIS_PESQUISADOS(CPF, QTD) AS (
	SELECT TOP (`+strconv.Itoa(topValue)+`) valor, COUNT(DISTINCT CONVERT(varchar(20), data_hora, 120)) as qtd
	FROM `+logTable+`
	WHERE secao = 'PESQUISA'
	AND item = 'PESSOA' AND chave = 'CPF'
	`+durationSQL+`
	AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
	GROUP BY valor
	ORDER BY qtd DESC
)
SELECT C.CPF as cpf, PF.nome as nome, C.QTD as qtd
FROM CPFS_MAIS_PESQUISADOS C
	LEFT OUTER JOIN `+pessoa+` PF ON (C.CPF = PF.cpf)`, args...)
			return rowsToMaps(rows, err)
		case "cnpj":
			pj, ok := r.models.Table("BD_RECEITA", "PJ")
			if !ok || pj == "" {
				return nil, types.ErrModelNotConfigured
			}
			rows, err := r.db.QueryContext(ctx, `
;WITH CNPJS_MAIS_PESQUISADOS(CNPJ, QTD) AS (
	SELECT TOP (`+strconv.Itoa(topValue)+`) valor, COUNT(*) as qtd
	FROM `+logTable+`
	WHERE secao = 'PESQUISA'
	AND item = 'EMPRESA' AND chave = 'CNPJ'
	`+durationSQL+`
	AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
	GROUP BY valor
	ORDER BY qtd DESC
)
SELECT C.CNPJ as cnpj, PJ.NomeFantasia as nomeFantasia, PJ.RazaoSocial as razaoSocial, C.QTD as qtd
FROM CNPJS_MAIS_PESQUISADOS C
	LEFT OUTER JOIN `+pj+` PJ ON (C.CNPJ = PJ.CNPJ COLLATE Latin1_General_CI_AS)`, args...)
			return rowsToMaps(rows, err)
		case "geral":
			rows, err := r.db.QueryContext(ctx, `
SELECT TOP (`+strconv.Itoa(topValue)+`) chave, UPPER(valor) as valor, COUNT(*) as qtd
FROM (
	SELECT chave, valor, CONVERT(VARCHAR, data_hora, 120) AS data_hora_formatted
	FROM `+logTable+`
	WHERE secao = 'PESQUISA'
	AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
	`+durationSQL+`
	GROUP BY chave, valor, CONVERT(VARCHAR, data_hora, 120)
) AS aggregated
GROUP BY chave, valor
ORDER BY COUNT(*) DESC`, args...)
			return rowsToMaps(rows, err)
		default:
			return nil, types.ErrInvalidParam
		}
	default:
		return nil, types.ErrInvalidParam
	}
}

func (r SQLUsuarioRepository) Resources(ctx context.Context, duration string, withKey string, profile string, year string, month string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	durationSQL, args := durationFilter("L.data_hora", duration)
	if withKey == "" {
		durationSQL, args = durationFilter("data_hora", duration)
		rows, err := r.db.QueryContext(ctx, `
SELECT item as recurso, COUNT(*) as qtd
FROM `+logTable+`
WHERE secao = 'PESQUISA'
`+durationSQL+`
AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
GROUP BY item
ORDER BY qtd DESC`, args...)
		return rowsToMaps(rows, err)
	}

	joinProfile := ""
	profileSQL := ""
	if strings.TrimSpace(profile) != "" {
		usuario, okUsuario := r.models.Table("BD_PANDORA", "USUARIO")
		perfil, okPerfil := r.models.Table("BD_PANDORA", "PERFIL")
		if !okUsuario || !okPerfil || usuario == "" || perfil == "" {
			return nil, types.ErrModelNotConfigured
		}
		joinProfile = `INNER JOIN ` + usuario + ` U ON L.usuario = U.login
INNER JOIN ` + perfil + ` P ON U.id_perfil = P.id`
		profileSQL = "AND P.descricao = @PERFIL"
		args = append(args, sql.Named("PERFIL", profile))
	}
	yearSQL := ""
	if parsed, err := strconv.Atoi(strings.TrimSpace(year)); err == nil && parsed > 0 {
		yearSQL = "AND YEAR(L.data_hora) = @ANO"
		args = append(args, sql.Named("ANO", parsed))
	}
	monthSQL := ""
	if parsed, err := strconv.Atoi(strings.TrimSpace(month)); err == nil && parsed > 0 {
		monthSQL = "AND MONTH(L.data_hora) = @MES"
		args = append(args, sql.Named("MES", parsed))
	}

	rows, err := r.db.QueryContext(ctx, `
SELECT L.item as recurso, L.chave, COUNT(*) as qtd
FROM `+logTable+` L
`+joinProfile+`
WHERE L.secao = 'PESQUISA'
`+durationSQL+`
`+profileSQL+`
`+yearSQL+`
`+monthSQL+`
AND (L.tipo = 'SIMPLIFICADA' OR L.tipo = 'DETALHADA' OR L.tipo = 'LOCAL')
GROUP BY L.item, L.chave
ORDER BY qtd DESC`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) ProcessesMostUsed(ctx context.Context, duration string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	durationSQL, args := durationFilter("data_hora", duration)
	rows, err := r.db.QueryContext(ctx, `
SELECT usuario, processo, COUNT(*) as qtd
FROM `+logTable+`
WHERE processo IS NOT NULL
AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
`+durationSQL+`
GROUP BY usuario, processo
ORDER BY qtd DESC`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) UsersSearchedValue(ctx context.Context, duration string, key string, value string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	durationSQL, args := durationFilter("data_hora", duration)
	args = append(args, sql.Named("CHAVE", key), sql.Named("VALOR", value))
	rows, err := r.db.QueryContext(ctx, `
SELECT usuario, COUNT(*) AS qtd
FROM (
	SELECT usuario
	FROM `+logTable+`
	WHERE secao = 'PESQUISA'
	AND chave = @CHAVE
	AND valor = @VALOR
	AND (tipo = 'SIMPLIFICADA' OR tipo = 'DETALHADA' OR tipo = 'LOCAL')
	`+durationSQL+`
	GROUP BY usuario
) AS aggregated
GROUP BY usuario
ORDER BY qtd DESC`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) UsageStats(ctx context.Context, category string, duration string) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	durationSQL, args := durationFilter("data_hora", duration)
	where := "secao='PESQUISA'"
	if category == "login" {
		where = "secao='SISTEMA' AND tipo IN ('LOGIN', 'TENTATIVA DE LOGIN', 'LOGIN EXTERNO')"
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT
	DATEFROMPARTS(YEAR(data_hora), MONTH(data_hora), DAY(data_hora)) as data,
	COUNT(*) as qtd
FROM `+logTable+`
WHERE `+where+`
`+durationSQL+`
GROUP BY YEAR(data_hora), MONTH(data_hora), DAY(data_hora)
ORDER BY YEAR(data_hora) DESC, MONTH(data_hora) DESC, DAY(data_hora) DESC`, args...)
	return rowsToMaps(rows, err)
}

func (r SQLUsuarioRepository) NotFoundRecords(ctx context.Context) ([]map[string]any, error) {
	logTable, ok := r.models.Table("BD_PANDORA", "LOG")
	if !ok || r.db == nil {
		return nil, types.ErrModelNotConfigured
	}
	pf, okPF := r.models.Table("BD_RECEITA", "PF")
	pj, okPJ := r.models.Table("BD_RECEITA", "PJ")
	if !okPF || !okPJ || pf == "" || pj == "" {
		return nil, types.ErrModelNotConfigured
	}
	cpfRows, err := r.db.QueryContext(ctx, `
;WITH CPFS_NAO_ENCONTRADOS(CPF) AS (
	SELECT valor
	FROM `+logTable+`
	WHERE secao = 'PESQUISA' AND item = 'PESSOA' AND chave = 'CPF' AND code = 'ENOTFOUND'
),
EXISTE_NA_BASE(CPF) AS (
	SELECT C.CPF as cpf
	FROM CPFS_NAO_ENCONTRADOS C
		INNER JOIN `+pf+` PF ON C.CPF = PF.CPF COLLATE Latin1_General_CI_AS
),
CPFS_RESULTADO(CPF) AS (
	SELECT CPF as cpf FROM CPFS_NAO_ENCONTRADOS
	EXCEPT
	SELECT CPF as cpf FROM EXISTE_NA_BASE
)
SELECT CPF as cpf, 'cpf' as tipo
FROM CPFS_RESULTADO`)
	cpfs, err := rowsToMaps(cpfRows, err)
	if err != nil {
		return nil, err
	}
	cnpjRows, err := r.db.QueryContext(ctx, `
;WITH CNPJS_NAO_ENCONTRADOS(CNPJ) AS (
	SELECT valor
	FROM `+logTable+`
	WHERE secao = 'PESQUISA' AND item = 'EMPRESA' AND chave = 'CNPJ' AND code = 'ENOTFOUND'
)
SELECT C.CNPJ as cnpj, 'cnpj' as tipo
FROM CNPJS_NAO_ENCONTRADOS C
	LEFT OUTER JOIN `+pj+` PJ ON C.CNPJ = PJ.CNPJ COLLATE Latin1_General_CI_AS
WHERE PJ.CNPJ IS NULL`)
	cnpjs, err := rowsToMaps(cnpjRows, err)
	if err != nil {
		return nil, err
	}
	return append(cnpjs, cpfs...), nil
}
