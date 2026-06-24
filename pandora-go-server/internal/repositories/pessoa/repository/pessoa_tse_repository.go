package pessoa

// integradoLocalTSEPessoaSources consulta dados de eleitor para complementar a aba pessoa.
func (m pessoaIntegradoLocalModel) integradoLocalTSEPessoaSources() []pessoaMapSource {
	eleitor, ok := m.models.Table("BD_TSE", "ELEITOR")
	if !ok || eleitor == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_TSE", "TSE2019"))
	return []pessoaMapSource{{
		category: "pessoa",
		query: `
SELECT TOP 1000
	NUM_CPF AS cpf,
	NOM_ELEITOR as nome,
	CAST(NULL AS varchar(32)) as sexo,
	NOM_MAE as nomeMae,
	NOM_PAI as nomePai,
	DAT_NASC_FORMATADA as dataNascimento,
	CAST(NULL AS varchar(255)) as municipio,
	CAST(NULL AS varchar(2)) as uf,
	NUM_INSCRICAO as tituloEleitor,
	` + fonte + ` as fonte
FROM ` + eleitor + `
WHERE NUM_CPF=@CPF`,
		args: oneCPFArg,
	}}
}
