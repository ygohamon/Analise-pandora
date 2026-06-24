package pessoa

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func (m pessoaIntegradoLocalModel) integradoLocalVizinhoSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if pf, ok := m.models.Table("BD_RECEITA", "PF"); ok && pf != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
		sources = append(sources, m.integradoLocalVizinhoSource(pf, fonte, true))
	}
	return sources
}

func (m pessoaIntegradoLocalModel) integradoLocalVizinhoSource(table string, fonte string, trimName bool) pessoaMapSource {
	return pessoaMapSource{
		category: "vizinho",
		timeout:  8 * time.Second,
		run: func(ctx context.Context, cpf string) ([]map[string]any, error) {
			targetRows, err := m.queryMaps(ctx, `
SELECT TOP 1 Logradouro as logradouro, Municipio as municipio,
	NumeroLogradouro as numero
FROM `+table+`
WHERE CPF=@CPF AND Logradouro IS NOT NULL AND Municipio IS NOT NULL AND NumeroLogradouro IS NOT NULL`, sql.Named("CPF", cpf))
			if err != nil || len(targetRows) == 0 {
				return targetRows, err
			}
			target := targetRows[0]
			logradouroSearch := logradouroTextSearch(fmt.Sprint(target["logradouro"]))
			numero := intValueForSQL(target["numero"], 0)
			if logradouroSearch == "" || numero == 0 {
				return []map[string]any{}, nil
			}
			nome := "P.NOME as nome"
			logradouro := "P.Logradouro as logradouro"
			complemento := "P.Complemento as complemento"
			if trimName {
				nome = "TRIM(P.NOME) as nome"
				logradouro = "TRIM(P.Logradouro) as logradouro"
				complemento = "TRIM(P.Complemento) as complemento"
			}
			return m.queryMaps(ctx, `
;WITH PESSOAS_MESMA_RUA(cpf)
AS
(
	SELECT CPF as cpf
	FROM `+table+`
	WHERE CONTAINS(Logradouro, @LOGRADOURO) AND Municipio = @MUNICIPIO
)
SELECT TOP 1000 P.CPF as cpf, `+nome+`, P.DataNascimento as dataNascimento,
	`+logradouro+`,
	CASE WHEN TRY_CAST(P.NumeroLogradouro as int) IS NULL THEN 0 ELSE CAST(P.NumeroLogradouro as int) END as numero,
	P.TipoLogradouro as tipoLogradouro, `+complemento+`,
	`+fonte+` as fonte, 0 as rank
FROM PESSOAS_MESMA_RUA R
INNER JOIN `+table+` P ON P.CPF = R.cpf
WHERE TRY_CAST(P.NumeroLogradouro AS INT) IS NOT NULL
	AND TRY_CAST(P.NumeroLogradouro AS INT) BETWEEN @NUMERO_MIN AND @NUMERO_MAX
	AND P.CPF <> @CPF`,
				sql.Named("CPF", cpf),
				sql.Named("LOGRADOURO", logradouroSearch),
				sql.Named("MUNICIPIO", target["municipio"]),
				sql.Named("NUMERO_MIN", numero-10),
				sql.Named("NUMERO_MAX", numero+10),
			)
		},
	}
}

func logradouroTextSearch(logradouro string) string {
	stop := map[string]struct{}{
		"AV": {}, "AV.": {}, "AVENIDA": {}, "R": {}, "R.": {}, "RUA": {},
		"DA": {}, "DAS": {}, "DE": {}, "DES": {}, "DO": {}, "DOS": {}, "E": {},
	}
	parts := []string{}
	for _, part := range strings.Fields(strings.ToUpper(logradouro)) {
		part = strings.Trim(part, ".,-/")
		if part == "" {
			continue
		}
		if _, skip := stop[part]; skip {
			continue
		}
		parts = append(parts, part)
	}
	return strings.Join(parts, " AND ")
}

func intValueForSQL(value any, fallback int) int {
	switch typed := value.(type) {
	case int:
		return typed
	case int64:
		return int(typed)
	case int32:
		return int(typed)
	case float64:
		return int(typed)
	case float32:
		return int(typed)
	case string:
		parsed, err := strconv.Atoi(strings.TrimSpace(typed))
		if err == nil {
			return parsed
		}
	}
	return fallback
}
