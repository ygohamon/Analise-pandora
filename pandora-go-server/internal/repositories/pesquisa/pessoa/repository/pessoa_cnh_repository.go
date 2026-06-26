package pessoa

// integradoLocalCNHSources consulta CNH local para complementar a aba pessoa.
func (m pessoaIntegradoLocalModel) integradoLocalCNHSources() []pessoaMapSource {
	cnh, ok := m.models.Table("BD_DETRAN", "CNH")
	if !ok || cnh == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_DETRAN", "DET"))
	return []pessoaMapSource{{
		category: "pessoa",
		query: `
SELECT TOP 1000
	CPF as cpf,
	TRIM(Nome_Condutor) as nome,
	CAST(NULL AS varchar(32)) as sexo,
	TRIM(Nome_Mae) as nomeMae,
	TRIM(Nome_Pai) as nomePai,
	CAST(NULL AS varchar(255)) as municipio,
	UPPER(UF_Emissor_Identidade) as uf,
	CAST(NULL AS date) as dataNascimento,
	Numero_Identidade as rg,
	Orgao_Emissor_Identidade as orgEmissorRg,
	UF_Emissor_Identidade as ufOrgEmissorRG,
	Numero_Renach as renach,
	Numero_Registro_CNH as cnh,
	Categoria_Atual as catAtual,
	Resultado_Exame_Psicotecnico as resPsicotecnico,
	TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Psicotecnico, 5, 0, '/'), 3, 0, '/'), 103) as dtPsicotecnico,
	Resultado_Exame_Medico as resMedico,
	TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Medico, 5, 0, '/'), 3, 0, '/'), 103) as dtMedico,
	Resultado_Exame_Legislacao as resLegislacao,
	TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Legislacao, 5, 0, '/'), 3, 0, '/'), 103) as dtLegislacao,
	` + fonte + ` + ANO as fonte
FROM ` + cnh + `
WHERE CPF=@CPF
ORDER BY ANO DESC`,
		args: oneCPFArg,
	}}
}
