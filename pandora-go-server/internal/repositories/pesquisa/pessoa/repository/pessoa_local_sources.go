package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalReceitaSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if pf, ok := m.models.Table("BD_RECEITA", "PF"); ok && pf != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
		sources = append(sources,
			pessoaMapSource{
				category: "endereco",
				query: `
SELECT TOP 1000 CPF as cpf, NOME as nome, TipoLogradouro as tipoLogradouro, Logradouro as logradouro,
	CASE WHEN TRY_CAST(NumeroLogradouro as int) IS NULL THEN 0 ELSE CAST(NumeroLogradouro as int) END as numero,
	Complemento as complemento, Bairro as bairro, Cep as cep, Municipio as municipio, UF as uf, ` + fonte + ` as fonte, 0 as rank
FROM ` + pf + `
WHERE CPF=@CPF`,
				args: oneCPFArg,
			},
			pessoaMapSource{
				category: "telefone",
				query: `
SELECT TOP 1000 CPF as cpf, NOME as nome,
	CASE WHEN TELEFONE = '00000000' OR TELEFONE = '' THEN NULL ELSE CASE WHEN DDD = '0000' THEN NULL ELSE RIGHT(DDD, 2) END END as ddd,
	CASE WHEN TELEFONE = '00000000' OR TELEFONE = '' THEN NULL ELSE TELEFONE END as telefone,
	` + fonte + ` as fonte, 0 as rank
FROM ` + pf + `
WHERE CPF=@CPF AND (TELEFONE <> '00000000' AND TELEFONE <> '')`,
				args: oneCPFArg,
			},
		)
	}
	if socio, ok := m.models.Table("BD_RECEITA", "SOCIO_HISTORICO"); ok && socio != "" {
		pj, _ := m.models.Table("BD_RECEITA", "PJ")
		if pj != "" {
			fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
			sources = append(sources, pessoaMapSource{
				category: "empresa",
				query: `
SELECT TOP 1000 S.NUM_CPF as socio_cpf, S.NOME as socio_nome,
	CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
	CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
	TRY_CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,
	S.NUM_CNPJ_EMPRESA as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
	PJ.Municipio as municipio, PJ.UF as uf, TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	` + fonte + ` as fonte, 0 as rank
FROM ` + socio + ` S
LEFT JOIN ` + pj + ` PJ ON PJ.CNPJ = S.NUM_CNPJ_EMPRESA
WHERE S.NUM_CPF=@CPF`,
				args: oneCPFArg,
			})
		}
	}
	if contador, ok := m.models.Table("BD_RECEITA", "CONTADOR"); ok && contador != "" {
		pj, _ := m.models.Table("BD_RECEITA", "PJ")
		if pj != "" {
			fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
			sources = append(sources, pessoaMapSource{
				category: "empresa",
				query: `
SELECT TOP 1000 PJ.CNPJ as cnpj, TRIM(PJ.RazaoSocial) as razaoSocial, TRIM(PJ.NomeFantasia) as nomeFantasia,
	TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade, TRIM(PJ.Municipio) as municipio,
	TRIM(PJ.Uf) as uf, 'contador' as vinculo, ` + fonte + ` as fonte, 0 as rank
FROM ` + contador + ` C
INNER JOIN ` + pj + ` PJ ON C.NUM_CNPJ_EMPRESA = PJ.CNPJ
WHERE C.NUM_CPF=@CPF`,
				args: oneCPFArg,
			})
		}
	}
	if pj, ok := m.models.Table("BD_RECEITA", "PJ"); ok && pj != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
		sources = append(sources, pessoaMapSource{
			category: "empresa",
			query: `
SELECT TOP 1000 CNPJ as cnpj, TRIM(RazaoSocial) as razaoSocial, TRIM(NomeFantasia) as nomeFantasia,
	TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade, TRIM(Municipio) as municipio,
	TRIM(Uf) as uf, 'responsavel' as vinculo, ` + fonte + ` as fonte, 0 as rank
FROM ` + pj + `
WHERE CpfResponsavel=@CPF`,
			args: oneCPFArg,
		})
	}
	if socio, ok := m.models.Table("BD_RECEITANOVO", "SOCIO"); ok && socio != "" {
		pj, _ := m.models.Table("BD_RECEITANOVO", "PJ")
		if pj != "" {
			sources = append(sources, pessoaMapSource{
				category: "empresa",
				query: `
SELECT TOP 1000 S.NomeSocio as socio_nome, RIGHT(S.CpfSocio, 11) as socio_cpf,
	TRY_CAST(S.PercentualCapitalSocial AS float)/100 as socio_percCapital,
	S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
	PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
	PJ.Municipio as municipio, PJ.UF as uf, TRY_CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
	'BD_RECEITANOVO' as fonte
FROM ` + socio + ` S
INNER JOIN ` + pj + ` PJ ON S.CNPJ = PJ.CNPJ
WHERE S.CpfSocio=@CPF14 AND S.IdentificadorSocio=2`,
				args: cpf14Arg,
			})
		}
	}
	if pj, ok := m.models.Table("BD_RECEITANOVO", "PJ"); ok && pj != "" {
		sources = append(sources, pessoaMapSource{
			category: "empresa",
			query: `
SELECT TOP 1000 CNPJ as cnpj, NomeFantasia as nomeFantasia, RazaoSocial as razaoSocial,
	Municipio as municipio, UF as uf, TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
	'responsavel' as vinculo, 'BD_RECEITANOVO' as fonte
FROM ` + pj + `
WHERE CPFResponsavel=@CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
