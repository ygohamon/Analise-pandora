package pessoa

import (
	"context"
	"fmt"

	"pandora-go-server/internal/types"
)

func (m pessoaStore) pessoaBDReceita(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	model, table, ok := m.modelTable("BD_RECEITA", "PF")
	if !ok {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITA.PF"))
	}
	situacao, _ := m.models.Table("BD_RECEITA", "SITUACAO")
	natureza, _ := m.models.Table("BD_RECEITA", "NATUREZA")
	ocupacao, _ := m.models.Table("BD_RECEITA", "OCUPACAO")
	if situacao == "" || natureza == "" || ocupacao == "" {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITA joins"))
	}

	query := `
SELECT TOP 1000
	PF.CPF as cpf,
	TRIM(PF.Nome) as nome,
	CASE WHEN PF.NomeMae = '' THEN NULL ELSE TRIM(PF.NomeMae) END as nome_mae,
	TRIM(PF.Municipio) as municipio,
	TRIM(PF.UF) as uf,
	TRY_CAST(PF.DataNascimento as date) as data_nascimento,
	CASE WHEN PF.Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo,
	UPPER(SITUACAO.Descricao) as situacao_cadastral,
	UPPER(NATUREZA.Descricao) as natureza_ocupacao,
	UPPER(OCUPACAO.Descricao) as ocupacao_principal,
	CASE WHEN PF.AnoObito = 0 THEN NULL ELSE TRY_CAST(PF.AnoObito AS varchar(16)) END as ano_obito,
	CASE WHEN PF.ExercicioOcupacao = 0 THEN NULL ELSE TRY_CAST(PF.ExercicioOcupacao AS varchar(16)) END as ano_exercicio_ocupacao
FROM ` + table + ` PF
	LEFT OUTER JOIN ` + situacao + ` SITUACAO ON (PF.SituacaoCadastral = SITUACAO.SituacaoCadastralID)
	LEFT OUTER JOIN ` + natureza + ` NATUREZA ON (PF.NaturezaOcupacao = NATUREZA.NaturezaOcupacaoID)
	LEFT OUTER JOIN ` + ocupacao + ` OCUPACAO ON (PF.OcupacaoPrincipal = OCUPACAO.OcupacaoPrincipalID)
WHERE PF.CPF = @CPF`

	return m.queryPessoas(ctx, query, cpf, model.Sigla)
}

func (m pessoaStore) pessoaReceitaFull(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	model, table, ok := m.modelTable("BD_RECEITAFULL", "PF")
	if !ok {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITAFULL.PF"))
	}
	situacao, _ := m.models.Table("BD_RECEITAFULL", "SITUACAO")
	natureza, _ := m.models.Table("BD_RECEITAFULL", "NATUREZA")
	ocupacao, _ := m.models.Table("BD_RECEITAFULL", "OCUPACAO")
	if situacao == "" || natureza == "" || ocupacao == "" {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITAFULL joins"))
	}

	query := `
SELECT TOP 1000
	PF.CPF as cpf,
	UPPER(PF.Nome) as nome,
	UPPER(PF.NomeMae) as nome_mae,
	UPPER(PF.Municipio) as municipio,
	UPPER(PF.UF) as uf,
	CASE WHEN isdate(PF.DataNascimento) = 1 THEN cast(PF.DataNascimento as date) ELSE NULL END AS data_nascimento,
	CASE WHEN PF.Sexo = 1 THEN 'MASCULINO' WHEN PF.Sexo = 2 THEN 'FEMININO' ELSE NULL END AS sexo,
	UPPER(SITUACAO.Descricao) as situacao_cadastral,
	UPPER(NATUREZA.Descricao) as natureza_ocupacao,
	UPPER(OCUPACAO.Descricao) as ocupacao_principal,
	CASE WHEN PF.AnoObito = 0 THEN NULL ELSE TRY_CAST(PF.AnoObito AS varchar(16)) END as ano_obito,
	CASE WHEN PF.ExercicioOcupacao = 0 THEN NULL ELSE TRY_CAST(PF.ExercicioOcupacao AS varchar(16)) END as ano_exercicio_ocupacao
FROM ` + table + ` PF
	INNER JOIN ` + situacao + ` SITUACAO ON (PF.SituacaoCadastral = SITUACAO.SituacaoCadastral)
	LEFT OUTER JOIN ` + natureza + ` NATUREZA ON (PF.NaturezaOcupacao = NATUREZA.NaturezaOcupacao)
	LEFT OUTER JOIN ` + ocupacao + ` OCUPACAO ON (PF.OcupacaoPrincipal = OCUPACAO.OcupacaoPrincipal)
WHERE PF.CPF = @CPF`

	return m.queryPessoas(ctx, query, cpf, model.Sigla)
}

func (m pessoaStore) pessoaReceitaNovo(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	model, table, ok := m.modelTable("BD_RECEITANOVO", "PF")
	if !ok {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITANOVO.PF"))
	}
	natureza, _ := m.models.Table("BD_RECEITANOVO", "NATUREZA")
	ocupacao, _ := m.models.Table("BD_RECEITANOVO", "OCUPACAO")
	if natureza == "" || ocupacao == "" {
		return nil, types.ErrModelNotConfigured.WithCause(fmt.Errorf("BD_RECEITANOVO joins"))
	}

	query := `
SELECT TOP 1000
	PF.CPF as cpf,
	UPPER(PF.Nome) as nome,
	UPPER(PF.NomeMae) as nome_mae,
	UPPER(PF.Municipio) as municipio,
	UPPER(PF.UF) as uf,
	TRY_CAST(PF.DataNascimento AS date) AS data_nascimento,
	CASE WHEN PF.Sexo = 1 THEN 'MASCULINO' WHEN PF.Sexo = 2 THEN 'FEMININO' ELSE NULL END AS sexo,
	CAST(NULL AS varchar(100)) as situacao_cadastral,
	UPPER(NATUREZA.Descricao) as natureza_ocupacao,
	UPPER(OCUPACAO.Descricao) as ocupacao_principal,
	CASE WHEN PF.AnoObito = 0 THEN NULL ELSE TRY_CAST(PF.AnoObito AS varchar(16)) END as ano_obito,
	CASE WHEN PF.ExercicioOcupacao = '0000' THEN NULL ELSE TRY_CAST(PF.ExercicioOcupacao AS varchar(16)) END as ano_exercicio_ocupacao
FROM ` + table + ` PF
	LEFT OUTER JOIN ` + natureza + ` NATUREZA ON (PF.NaturezaOcupacao = NATUREZA.NaturezaOcupacaoID)
	LEFT OUTER JOIN ` + ocupacao + ` OCUPACAO ON (PF.OcupacaoPrincipal = OCUPACAO.OcupacaoPrincipalID)
WHERE PF.CPF = @CPF`

	return m.queryPessoas(ctx, query, cpf, model.Sigla)
}
