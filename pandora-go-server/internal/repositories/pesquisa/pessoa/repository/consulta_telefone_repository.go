package pessoa

import (
	"context"
	"database/sql"
)

// TelefonesPorCPF reaproveita as fontes locais de telefone usadas pelo integrado.
func (m SQLRepository) TelefonesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	results, err := m.LocalTelefoneCPF(ctx, cpf)
	return flattenSourceRows(results), err
}

func (m SQLRepository) TelefonesPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	pf, ok := m.models.Table("BD_RECEITAFULL", "PF")
	if !ok || pf == "" || m.db == nil {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000 CPF as cpf, Nome as nome,
	CASE WHEN Telefone = '00000000' OR Telefone = '' THEN NULL ELSE CASE WHEN DDD = '0000' THEN NULL ELSE RIGHT(DDD, 2) END END as ddd,
	CASE WHEN Telefone = '00000000' OR Telefone = '' THEN NULL ELSE Telefone END as telefone,
	` + sqlLiteral(m.modelSigla("BD_RECEITAFULL", "RF2")) + ` as fonte
FROM ` + pf + `
WHERE CONTAINS(Nome, @NOME) AND (Telefone <> '00000000' AND Telefone <> '')`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("NOME", textSearch(nome))))
}

func (m SQLRepository) TelefonesPorTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	out := []map[string]any{}
	var firstErr error
	telefoneCompleto := onlyDigits(telefone)
	telefoneCurto := telefoneCompleto
	if len(telefoneCurto) > 8 {
		telefoneCurto = telefoneCurto[len(telefoneCurto)-8:]
	}
	telefoneBusca := telefoneCompleto
	if len(telefoneCompleto) > 8 {
		telefoneBusca = telefoneCurto
	}
	if pf, ok := m.models.Table("BD_RECEITAFULL", "PF"); ok && pf != "" && m.db != nil {
		query := `
SELECT TOP 1000 CPF as cpf, Nome as nome,
	CASE WHEN DDD = '0000' THEN NULL ELSE RIGHT(DDD, 2) END as ddd,
	Telefone as telefone,
	` + sqlLiteral(m.modelSigla("BD_RECEITAFULL", "RF2")) + ` as fonte
FROM ` + pf + `
WHERE Telefone=@TELEFONE`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query,
			sql.Named("TELEFONE", telefoneBusca),
		))
		if err == nil {
			out = append(out, splitVeiculoCpfCNPJ(rows)...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if pf, ok := m.models.Table("BD_RECEITA", "PF"); ok && pf != "" && m.db != nil {
		query := `
SELECT TOP 1000 CPF as cpf, Nome as nome,
	CAST(NULL AS varchar(8)) as ddd,
	Telefone as telefone,
	` + sqlLiteral(m.modelSigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + pf + `
WHERE Telefone=@TELEFONE`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query,
			sql.Named("TELEFONE", telefoneBusca),
		))
		if err == nil {
			out = append(out, rows...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if len(out) > 0 {
		return out, nil
	}
	if tel, ok := m.models.Table("BD_TELEFONE", "TELEFONE"); ok && tel != "" && m.db != nil {
		pf, _ := m.models.Table("BD_RECEITA", "PF")
		joinPF := ""
		nomePF := "CAST(NULL AS varchar(255)) as nome"
		if pf != "" {
			joinPF = " LEFT OUTER JOIN " + pf + " PF ON T.cpf_cnpj = PF.CPF"
			nomePF = "PF.Nome as nome"
		}
		query := `
SELECT TOP 1000 T.cpf_cnpj as cpf, ` + nomePF + `,
	CAST(NULL AS varchar(8)) as ddd, T.telefone,
	COALESCE(NULLIF(T.fonte, ''), ` + sqlLiteral(m.modelSigla("BD_TELEFONE", "RF1")) + `) as fonte
FROM ` + tel + ` T` + joinPF + `
WHERE T.telefone=@TELEFONE`
		rows, err := rowsToMaps(m.db.QueryContext(ctx, query,
			sql.Named("TELEFONE", telefoneBusca),
		))
		if err == nil {
			out = append(out, rows...)
		} else if firstErr == nil {
			firstErr = err
		}
	}
	if len(out) > 0 {
		return out, nil
	}
	return []map[string]any{}, firstErr
}
