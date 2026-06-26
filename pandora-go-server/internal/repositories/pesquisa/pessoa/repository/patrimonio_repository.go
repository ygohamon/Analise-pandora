package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalTransportPropertySources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if rab, ok := m.models.Table("BD_RAB", "RAB"); ok && rab != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RAB", "RAB"))
		sources = append(sources, pessoaMapSource{
			category: "aeronave",
			query: `
SELECT TOP 1000
	CASE WHEN CPF_CNPJ = @CPF THEN 'proprietario' WHEN CPF_CNPJ2 = @CPF THEN 'operador' ELSE NULL END as tipo,
	PROPRIETARIO as proprietario,
	OUTROS_PROPRIETARIOS as outros_proprietarios,
	UF as uf,
	CPF_CNPJ as cpf_cnpj,
	CPF_CNPJ2 as cpf_cnpj2,
	OPERADOR as operador,
	OUTROS_OPERADORES as outros_operadores,
	UF_OPERADOR as uf_operador,
	MARCA as marca,
	MATRICULA as matricula,
	DT_MATRICULA as dt_matricula,
	NUM_SERIE as num_serie,
	CATEGORIA as categoria,
	CD_TIPO as cd_tipo,
	MODELO as modelo,
	NOME_FABRICANTE as fabricante,
	CLASSE as classe,
	PMD as pmd,
	NR_TRIPULACAO_MIN as tripulacao_min,
	NR_PASSAGEIROS_MAX as passageiros_max,
	ASSENTOS as assentos,
	ANO_FABRICACAO as ano_fabricacao,
	VAL_SEG as dt_seg,
	VAL_CA as val_ca,
	DATA_CANC as dt_can,
	MOTIVO as motivo,
	CD_INTERDICAO as cd_interdicao,
	MARCA_NAC1 as marca_nac_1,
	MARCA_NAC2 as marca_nac_2,
	MARCA_NAC3 as marca_nac_3,
	MARCA_EST as marca_est,
	DESCRICAO_GRAVAME as descricao_gravame,
	` + fonte + ` as fonte
FROM ` + rab + `
WHERE CPF_CNPJ=@CPF OR CPF_CNPJ2=@CPF`,
			args: oneCPFArg,
		})
	}
	if embarcacoes, ok := m.models.Table("BD_EMBARCACOES", "EMBARCACOES"); ok && embarcacoes != "" {
		fonte := sqlLiteral(m.modelVar("BD_EMBARCACOES", "FONTE_EMB", m.modelSigla("BD_EMBARCACOES", "EMB")))
		sources = append(sources, pessoaMapSource{
			category: "embarcacao",
			query: `
SELECT TOP 1000
	TRIM(CPF_CNPJ) as cpfCnpj,
	NOME_PESSOA as nome,
	TIPO_PESSOA_FISICA_JURIDICA as tipoPessoa,
	DS_NOME_EMBARCACAO as embarcacao,
	TIPO_EMBARCACAO as descricao,
	ANO_CONSTRUCAO as anoConstrucao,
	CAST(CAST(NR_COMPRIMENTO AS money)/10000 AS FLOAT) as comprimento,
	CONSTRUTOR_CASCO as constCasco,
	NR_INSCRICAO as inscricao,
	SITUACAO_EMBARCACAO as situacao,
	DT_INSCRICAO_EMB as dataInscricao,
	DT_VALIDADE_DOC_EMB as dataValidade,
	ORGAO_INSCRICAO as orgaoInscricao,
	DS_CIDADE_ORGAO as cidadeOrgao,
	DATA_AQUISICAO as dataAquisicao,
	ULT_LOCAL_AQUISICAO_PROP_ATUAL as localAquisicao,
	CASE WHEN ULT_VALOR_AQUISICAO_PROP_ATUAL = ',00' THEN NULL ELSE CAST(CAST(ULT_VALOR_AQUISICAO_PROP_ATUAL AS money)/100 AS FLOAT) END as valor,
	ANO_MES_CARGA as dataCarga,
	` + fonte + ` as fonte
FROM ` + embarcacoes + `
WHERE CPF_CNPJ=@CPF`,
			args: oneCPFArg,
		})
	}
	if fisco, ok := m.models.Table("BD_EMBARCACOES", "FISCO"); ok && fisco != "" {
		pf, _ := m.models.Table("BD_RECEITA", "PF")
		if pf != "" {
			fonte := sqlLiteral(m.modelVar("BD_EMBARCACOES", "FONTE_FISCO", "N1"))
			sources = append(sources, pessoaMapSource{
				category: "embarcacao",
				query: `
SELECT TOP 1000
	TRIM(E.CPF_CNPJ) as cpfCnpj,
	TRIM(PF.Nome) as nome,
	TRIM(E.Descricao) as descricao,
	E.Valor as valor,
	E.DataEmissaNFe as dataAquisicao,
	` + fonte + ` as fonte
FROM ` + fisco + ` E
LEFT OUTER JOIN ` + pf + ` PF ON E.CPF_CNPJ = PF.CPF
WHERE E.CPF_CNPJ=@CPF`,
				args: oneCPFArg,
			})
		}
	}
	return sources
}
