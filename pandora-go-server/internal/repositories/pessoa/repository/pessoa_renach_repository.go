package pessoa

// integradoLocalRenachPessoaSources consulta Renach local para complementar a aba pessoa.
func (m pessoaIntegradoLocalModel) integradoLocalRenachPessoaSources() []pessoaMapSource {
	renach, ok := m.models.Table("BD_RENACH_2014", "PF")
	if !ok || renach == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_RENACH_2014", "RN1"))
	return []pessoaMapSource{{
		category: "pessoa",
		query: `
SELECT TOP 1000
	nr_cpf as cpf,
	UPPER(nm_condutor) as nome,
	CASE WHEN isdate(dt_nascimento) = 1 THEN cast(dt_nascimento as date) ELSE NULL END as dataNascimento,
	UPPER(ds_local_nascimento) as naturalidade,
	CASE WHEN cd_sexo = 1 THEN 'MASCULINO' WHEN cd_sexo = 2 THEN 'FEMININO' ELSE 'OUTROS' END as sexo,
	CASE WHEN isdate(dt_cadastramento) = 1 THEN cast(dt_cadastramento as date) ELSE NULL END as dataCadastro,
	UPPER(nm_mae) as nomeMae,
	UPPER(nm_pai) as nomePai,
	nr_registro as cnh,
	nr_documento as rg,
	ds_orgao_emissor as orgEmissorRg,
	sg_uf_documento as ufOrgEmissorRG,
	` + fonte + ` as fonte
FROM ` + renach + `
WHERE nr_cpf=@CPF`,
		args: oneCPFArg,
	}}
}
