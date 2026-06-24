package empresa

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
)

// SimplificadoCNPJ consulta empresas por CNPJ nas fontes locais equivalentes ao Node.
func (m SQLRepository) SimplificadoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return m.collect(m.bdReceitaCNPJ(ctx, cnpj), m.receitaNovoCNPJ(ctx, cnpj))
}

// DetalhadoCNPJ reaproveita fontes cadastrais locais e Cortex quando permitido.
func (m SQLRepository) DetalhadoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) ([]map[string]any, error) {
	out, err := m.SimplificadoCNPJ(ctx, cnpj)
	if err != nil {
		return nil, err
	}
	if options.Cortex {
		if groups, err := m.CortexExternoCNPJ(ctx, cnpj, options); err == nil {
			out = append(out, groups["empresa"]...)
		}
	}
	return dedupeRows(out), nil
}

// SimplificadoRazaoSocial consulta empresas por razao social.
func (m SQLRepository) SimplificadoRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	query := textSearch(razaoSocial)
	return m.collect(m.bdReceitaTexto(ctx, "RazaoSocial", "RAZAOSOCIAL", query), m.receitaNovoTexto(ctx, "RazaoSocial", "RAZAOSOCIAL", query))
}

// SimplificadoNomeFantasia consulta empresas por nome fantasia.
func (m SQLRepository) SimplificadoNomeFantasia(ctx context.Context, nomeFantasia string) ([]map[string]any, error) {
	query := textSearch(nomeFantasia)
	return m.collect(m.bdReceitaTexto(ctx, "NomeFantasia", "NOMEFANTASIA", query), m.receitaNovoTexto(ctx, "NomeFantasia", "NOMEFANTASIA", query))
}

// SimplificadoEndereco consulta empresas por logradouro.
func (m SQLRepository) SimplificadoEndereco(ctx context.Context, endereco string) ([]map[string]any, error) {
	query := textSearch(endereco)
	return m.collect(m.receitaNovoTexto(ctx, "Logradouro", "LOGRADOURO", query), m.bdReceitaTexto(ctx, "Logradouro", "LOGRADOURO", query))
}

// SimplificadoTelefone consulta empresas por telefone em Receita e base de telefones.
func (m SQLRepository) SimplificadoTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	return m.collect(m.sispesquisaTelefone(ctx, telefone), m.bdReceitaTelefone(ctx, telefone))
}

// SimplificadoEmail consulta empresas por e-mail em Receita e base virtual.
func (m SQLRepository) SimplificadoEmail(ctx context.Context, email string) ([]map[string]any, error) {
	return m.collect(m.bdReceitaEmail(ctx, email), m.sispesquisaEmail(ctx, email))
}

// SimplificadoSocioPFCPF consulta empresas em que um CPF consta como socio.
func (m SQLRepository) SimplificadoSocioPFCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	rows, err := m.bdReceitaSocioPFCPF(ctx, cpf)
	return dedupeRows(rows), err
}

// SimplificadoSocioPFNome consulta empresas pelo nome do socio pessoa fisica.
func (m SQLRepository) SimplificadoSocioPFNome(ctx context.Context, nome string) ([]map[string]any, error) {
	rows, err := m.bdReceitaSocioPFNome(ctx, textSearch(nome))
	return dedupeRows(rows), err
}

// SimplificadoSocioPJCNPJ consulta empresas em que um CNPJ consta como socio.
func (m SQLRepository) SimplificadoSocioPJCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	rows, err := m.bdReceitaSocioPJCNPJ(ctx, cnpj)
	return dedupeRows(rows), err
}

type queryResult struct {
	rows []map[string]any
	err  error
}

func (m SQLRepository) collect(results ...queryResult) ([]map[string]any, error) {
	out := []map[string]any{}
	for _, result := range results {
		if result.err != nil {
			return nil, result.err
		}
		out = append(out, result.rows...)
	}
	return dedupeRows(out), nil
}

func (m SQLRepository) query(ctx context.Context, sqlText string, args ...any) queryResult {
	rows, err := rowsToMaps(m.db.QueryContext(ctx, sqlText, args...))
	return queryResult{rows: rows, err: err}
}

func (m SQLRepository) empty() queryResult {
	return queryResult{rows: []map[string]any{}}
}

func (m SQLRepository) bdReceitaCNPJ(ctx context.Context, cnpj string) queryResult {
	table, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(NomeFantasia) as nomeFantasia,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(Municipio) as municipio,
	TRIM(Uf) as uf,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + table + `
WHERE CNPJ=@CNPJ`
	return m.query(ctx, query, sql.Named("CNPJ", cnpj))
}

func (m SQLRepository) receitaNovoCNPJ(ctx context.Context, cnpj string) queryResult {
	table, ok := m.table("BD_RECEITANOVO", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(NomeFantasia) as nomeFantasia,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(Municipio) as municipio,
	TRIM(UF) as uf,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	` + sqlLiteral(m.sigla("BD_RECEITANOVO", "BD_RECEITANOVO")) + ` as fonte
FROM ` + table + `
WHERE CNPJ=@CNPJ`
	return m.query(ctx, query, sql.Named("CNPJ", cnpj))
}

func (m SQLRepository) bdReceitaTexto(ctx context.Context, column string, param string, value string) queryResult {
	table, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(NomeFantasia) as nomeFantasia,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(Municipio) as municipio,
	TRIM(Uf) as uf,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + table + `
WHERE CONTAINS(` + column + `, @` + param + `)`
	return m.query(ctx, query, sql.Named(param, value))
}

func (m SQLRepository) receitaNovoTexto(ctx context.Context, column string, param string, value string) queryResult {
	table, ok := m.table("BD_RECEITANOVO", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(NomeFantasia) as nomeFantasia,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(Municipio) as municipio,
	TRIM(UF) as uf,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	` + sqlLiteral(m.sigla("BD_RECEITANOVO", "BD_RECEITANOVO")) + ` as fonte
FROM ` + table + `
WHERE CONTAINS(` + column + `, @` + param + `)`
	return m.query(ctx, query, sql.Named(param, value))
}

func (m SQLRepository) bdReceitaTelefone(ctx context.Context, telefone string) queryResult {
	table, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(NomeFantasia) as nomeFantasia,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(Municipio) as municipio,
	TRIM(Uf) as uf,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + table + `
WHERE DddTelefone1=@TELEFONE OR DddTelefone2=@TELEFONE`
	return m.query(ctx, query, sql.Named("TELEFONE", telefone))
}

func (m SQLRepository) bdReceitaEmail(ctx context.Context, email string) queryResult {
	table, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	CNPJ as cnpj,
	TRIM(RazaoSocial) as razaoSocial,
	TRIM(NomeFantasia) as nomeFantasia,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(Municipio) as municipio,
	TRIM(Uf) as uf,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + table + `
WHERE CorreioEletronico=@EMAIL`
	return m.query(ctx, query, sql.Named("EMAIL", email))
}

func (m SQLRepository) sispesquisaTelefone(ctx context.Context, telefone string) queryResult {
	tel, ok := m.table("BD_TELEFONE", "TELEFONE")
	if !ok {
		return m.empty()
	}
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	PJ.CNPJ as cnpj,
	TRIM(PJ.NomeFantasia) as nomeFantasia,
	TRIM(PJ.RazaoSocial) as razaoSocial,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(PJ.Municipio) as municipio,
	TRIM(PJ.UF) as uf,
	` + sqlLiteral(m.sigla("BD_TELEFONE", "BD_TELEFONE")) + ` as fonte
FROM ` + tel + ` T
	INNER JOIN ` + pj + ` PJ ON (T.cpf_cnpj = PJ.CNPJ)
WHERE telefone=@TELEFONE`
	return m.query(ctx, query, sql.Named("TELEFONE", telefone))
}

func (m SQLRepository) sispesquisaEmail(ctx context.Context, email string) queryResult {
	emailTable, ok := m.table("BD_VIRTUAL", "EMAIL")
	if !ok {
		return m.empty()
	}
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return m.empty()
	}
	query := `
SELECT TOP 1000
	PJ.CNPJ as cnpj,
	TRIM(PJ.NomeFantasia) as nomeFantasia,
	TRIM(PJ.RazaoSocial) as razaoSocial,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	TRIM(PJ.Municipio) as municipio,
	TRIM(PJ.UF) as uf,
	` + sqlLiteral(m.sigla("BD_VIRTUAL", "BD_VIRTUAL")) + ` as fonte
FROM ` + emailTable + ` E
	INNER JOIN ` + pj + ` PJ ON (E.cpf_cnpj = PJ.CNPJ)
WHERE E.EMAIL=@EMAIL`
	return m.query(ctx, query, sql.Named("EMAIL", email))
}

func (m SQLRepository) bdReceitaSocioPFCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	socio, ok := m.table("BD_RECEITA", "SOCIO_HISTORICO")
	if !ok {
		return []map[string]any{}, nil
	}
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000
	S.NOME as socio_nome,
	S.NUM_CPF as socio_cpf,
	CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
	CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,
	S.NUM_CNPJ_EMPRESA as cnpj,
	PJ.RazaoSocial as razaoSocial,
	PJ.NomeFantasia as nomeFantasia,
	PJ.Municipio as municipio,
	PJ.UF as uf,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S
	LEFT OUTER JOIN ` + pj + ` PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
WHERE S.NUM_CPF=@CPF`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CPF", cpf)))
}

func (m SQLRepository) bdReceitaSocioPFNome(ctx context.Context, nome string) ([]map[string]any, error) {
	socio, ok := m.table("BD_RECEITA", "SOCIO_HISTORICO")
	if !ok {
		return []map[string]any{}, nil
	}
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000
	S.NOME as socio_nome,
	RIGHT(S.NUM_CPF, 11) as socio_cpf,
	CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
	CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,
	S.NUM_CNPJ_EMPRESA as cnpj,
	PJ.RazaoSocial as razaoSocial,
	PJ.NomeFantasia as nomeFantasia,
	PJ.Municipio as municipio,
	PJ.UF as uf,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S
	INNER JOIN ` + pj + ` PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
WHERE CONTAINS(S.NOME, @NOME)`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("NOME", nome)))
}

func (m SQLRepository) bdReceitaSocioPJCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	socio, ok := m.table("BD_RECEITA", "SOCIO_HISTORICO")
	if !ok {
		return []map[string]any{}, nil
	}
	pj, ok := m.table("BD_RECEITA", "PJ")
	if !ok {
		return []map[string]any{}, nil
	}
	query := `
SELECT TOP 1000
	S.NOME as socio_razaoSocial,
	S.NUM_CNPJ as socio_cnpj,
	CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
	CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,
	S.NUM_CNPJ_EMPRESA as cnpj,
	PJ.RazaoSocial as razaoSocial,
	PJ.NomeFantasia as nomeFantasia,
	PJ.Municipio as municipio,
	PJ.UF as uf,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	` + sqlLiteral(m.sigla("BD_RECEITA", "RF6")) + ` as fonte
FROM ` + socio + ` S
	INNER JOIN ` + pj + ` PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
WHERE S.NUM_CNPJ=@CNPJ`
	return rowsToMaps(m.db.QueryContext(ctx, query, sql.Named("CNPJ", cnpj)))
}
