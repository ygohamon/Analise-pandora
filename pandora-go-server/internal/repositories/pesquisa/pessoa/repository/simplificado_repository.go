package pessoa

import (
	"context"

	"pandora-go-server/internal/types"
)

func (m pessoaSimplificadoModel) SimplificadoCPF(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	return dedupePessoas(collectPessoaRows(ctx, cpf, m.pessoaBDReceita, m.pessoaReceitaFull, m.pessoaReceitaNovo)), nil
}

// SimplificadoNome consulta a fonte local de pessoa por busca textual.
func (m pessoaSimplificadoModel) SimplificadoNome(ctx context.Context, nome string) ([]types.PessoaSimplificada, error) {
	return m.pessoasPorTexto(ctx, "Nome", nome)
}

func (m pessoaSimplificadoModel) SimplificadoRG(ctx context.Context, rg string) ([]types.PessoaSimplificada, error) {
	return []types.PessoaSimplificada{}, nil
}

func (m pessoaSimplificadoModel) SimplificadoCNH(ctx context.Context, cnh string) ([]types.PessoaSimplificada, error) {
	return []types.PessoaSimplificada{}, nil
}

func (m pessoaSimplificadoModel) SimplificadoTitulo(ctx context.Context, titulo string) ([]types.PessoaSimplificada, error) {
	return []types.PessoaSimplificada{}, nil
}

func (m pessoaSimplificadoModel) SimplificadoNomePai(ctx context.Context, nomePai string) ([]types.PessoaSimplificada, error) {
	return m.pessoasPorTexto(ctx, "NomePai", nomePai)
}

func (m pessoaSimplificadoModel) SimplificadoNomeMae(ctx context.Context, nomeMae string) ([]types.PessoaSimplificada, error) {
	return m.pessoasPorTexto(ctx, "NomeMae", nomeMae)
}

func (m pessoaSimplificadoModel) SimplificadoTelefone(ctx context.Context, telefone string) ([]types.PessoaSimplificada, error) {
	table, ok := m.models.Table("BD_RECEITA", "PF")
	if !ok || m.db == nil {
		return []types.PessoaSimplificada{}, nil
	}
	query := `
SELECT TOP 1000
	CPF as cpf, TRIM(Nome) as nome,
	CASE WHEN NomeMae = '' THEN NULL ELSE TRIM(NomeMae) END as nome_mae,
	TRIM(Municipio) as municipio, TRIM(UF) as uf,
	TRY_CAST(DataNascimento as date) as data_nascimento,
	CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo,
	CAST(NULL AS varchar(100)) as situacao_cadastral,
	CAST(NULL AS varchar(100)) as natureza_ocupacao,
	CAST(NULL AS varchar(100)) as ocupacao_principal,
	CASE WHEN AnoObito = 0 THEN NULL ELSE TRY_CAST(AnoObito AS varchar(16)) END as ano_obito,
	CASE WHEN ExercicioOcupacao = 0 THEN NULL ELSE TRY_CAST(ExercicioOcupacao AS varchar(16)) END as ano_exercicio_ocupacao
FROM ` + table + `
WHERE Telefone=@TELEFONE OR Telefone=RIGHT(@TELEFONE, 8)`
	rows, err := m.queryPessoas(ctx, query, onlyDigits(telefone), "BD_RECEITA")
	if err != nil {
		return []types.PessoaSimplificada{}, nil
	}
	return rows, nil
}

func (m pessoaSimplificadoModel) SimplificadoEmail(ctx context.Context, email string) ([]types.PessoaSimplificada, error) {
	return []types.PessoaSimplificada{}, nil
}

func (m pessoaSimplificadoModel) SimplificadoEndereco(ctx context.Context, endereco string) ([]types.PessoaSimplificada, error) {
	return m.pessoasPorTexto(ctx, "Logradouro", endereco)
}

// pessoasPorTexto executa consultas especificas por campos textuais da pessoa.
func (m pessoaSimplificadoModel) pessoasPorTexto(ctx context.Context, column string, value string) ([]types.PessoaSimplificada, error) {
	table, ok := m.models.Table("BD_RECEITA", "PF")
	if !ok || m.db == nil {
		return []types.PessoaSimplificada{}, nil
	}
	value = textSearch(value)
	query := `
SELECT TOP 1000
	CPF as cpf, TRIM(Nome) as nome,
	CASE WHEN NomeMae = '' THEN NULL ELSE TRIM(NomeMae) END as nome_mae,
	TRIM(Municipio) as municipio, TRIM(UF) as uf,
	TRY_CAST(DataNascimento as date) as data_nascimento,
	CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo,
	CAST(NULL AS varchar(100)) as situacao_cadastral,
	CAST(NULL AS varchar(100)) as natureza_ocupacao,
	CAST(NULL AS varchar(100)) as ocupacao_principal,
	CASE WHEN AnoObito = 0 THEN NULL ELSE TRY_CAST(AnoObito AS varchar(16)) END as ano_obito,
	CASE WHEN ExercicioOcupacao = 0 THEN NULL ELSE TRY_CAST(ExercicioOcupacao AS varchar(16)) END as ano_exercicio_ocupacao
FROM ` + table + `
WHERE CONTAINS(` + column + `, @CPF)`
	rows, err := m.queryPessoas(ctx, query, value, "BD_RECEITA")
	if err != nil {
		return []types.PessoaSimplificada{}, nil
	}
	return rows, nil
}
