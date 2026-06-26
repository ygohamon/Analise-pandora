package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalPEPSources() []pessoaMapSource {
	pep, ok := m.models.Table("BD_PEP", "PEP")
	if !ok || pep == "" {
		return nil
	}
	return []pessoaMapSource{{
		category: "pep",
		query: `
SELECT TOP 1000 p.CPF_PEP as cpf, p.NOME_PEP as nome, p.Sigla_Funcao_PEP as sigla,
	p.Descricao_Funcao_PEP as descricao, p.Nivel_Funcao_PEP as nivel, p.Nome_Orgao_PEP as orgao,
	p.Dt_Inicio_Exercicio as dtInicioExercicio, p.Dt_Fim_Exercicio as dtFimExercicio,
	p.Dt_Final_Carencia as dtFimCarencia, 'BD_PEP' as fonte
FROM ` + pep + ` p
WHERE p.CPF_PEP=@CPF
ORDER BY p.Dt_Fim_Exercicio`,
		args: oneCPFArg,
	}}
}

func (m pessoaIntegradoLocalModel) integradoLocalRIFSources() []pessoaMapSource {
	investigados, ok := m.models.Table("BD_RIF", "INVESTIGADOS")
	if !ok || investigados == "" {
		return nil
	}
	return []pessoaMapSource{{
		category: "rif",
		query: `
SELECT TOP 1 CPF_CNPJ as cpf, COUNT(*) as qtd, 'BD_RIF' as fonte
FROM ` + investigados + `
WHERE CPF_CNPJ=@CPF
GROUP BY CPF_CNPJ`,
		args: oneCPFArg,
	}}
}
