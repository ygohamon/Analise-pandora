package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalRegistrySources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if obito, ok := m.models.Table("BD_SISOBI", "OBITO"); ok && obito != "" {
		sources = append(sources, pessoaMapSource{
			category: "obito",
			query: `
SELECT DISTINCT TOP 1000 CPF as obito_cpf, FALECIDO as obito_nome, MAE as obito_nomeMae,
	DT_NASC as obito_dataNascimento, DT_OBITO as obito_dataObito,
	UPPER(MUNICIPIO) as obito_municipioServentia, UF as obito_ufServentia,
	CARTORIO as obito_nomeFantasia, NR_LIVRO as obito_livro, NR_FOLHA as obito_folha,
	NR_TERMO as obito_termo, 'BD_SISOBI' as fonte
FROM ` + obito + `
WHERE CPF=@CPF`,
			args: oneCPFArg,
		})
	}
	if doi, ok := m.models.Table("BD_DOI", "DOI"); ok && doi != "" {
		pj, _ := m.models.Table("BD_RECEITA", "PJ")
		joinPJ := ""
		cartorioLocal := "CAST(NULL AS varchar(255)) as cartorioMunicipio, CAST(NULL AS varchar(2)) as cartorioUf"
		if pj != "" {
			joinPJ = " LEFT OUTER JOIN " + pj + " PJ ON D.CNPJ_CARTORIO = PJ.CNPJ"
			cartorioLocal = "TRIM(PJ.Municipio) as cartorioMunicipio, PJ.Uf as cartorioUf"
		}
		base := `
SELECT CNPJ_CARTORIO as cartorioCnpj, ` + cartorioLocal + `,
	NOME_CARTORIO as cartorioRazaoSocial, TP_CARTORIO as tipoCartorio,
	TRY_CONVERT(DATE, DT_LAVRATURA, 103) as dataLavratura, NR_LIVRO as livro, FOLHA as folha,
	MATRICULA as matricula, REGISTRO as registro, CPF_CNPJ_ALIENANTE as cpfCnpjAlienante,
	NOME_ALIENANTE as alientante, CPF_CNPJ_ADQUIRENTE as cpfCnpjAdquirente, NOME_ADQUIRENTE as adquirente,
	TRY_CONVERT(DATE, DT_CARGA, 103) as dataCarga, 'BD_DOI' as fonte`
		sources = append(sources,
			pessoaMapSource{
				category: "imovel",
				query:    base + `, 'adquirente' as tipo FROM ` + doi + ` D` + joinPJ + ` WHERE CPF_CNPJ_ADQUIRENTE=@CPF`,
				args:     oneCPFArg,
			},
			pessoaMapSource{
				category: "imovel",
				query:    base + `, 'alienante' as tipo FROM ` + doi + ` D` + joinPJ + ` WHERE CPF_CNPJ_ALIENANTE=@CPF`,
				args:     oneCPFArg,
			},
		)
	}
	if cge, ok := m.models.Table("BD_CGE", "SERVIDORES_ESTADUAL"); ok && cge != "" {
		sources = append(sources, pessoaMapSource{
			category: "servidor_estadual",
			query: `
SELECT TOP 1000 NOME as nome, CPF as cpf, RG as rg, NATURAL as naturalidade, EST_CIVIL as estadoCivil,
	DT_NASCTO as dataNascimento, COD_CAR as codigoCargo, CARGO as cargo,
	[REGIME DE CONTRATACAO] as regimeContratacao, ORGAO as orgao, UO as unidadeOrcamentaria,
	UD as unidadeDespesa, LOTACAO as lotacao, INGRESSO as ingresso, NOMEACAO as nomeacao,
	VCTOS_MES as vencimentosMes, [SITUACAO FUNCIONAL] as situacaoFuncional, [Coluna 17] as coluna17,
	'BD_CGE' as fonte
FROM ` + cge + `
WHERE REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), '/', '') = @CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
