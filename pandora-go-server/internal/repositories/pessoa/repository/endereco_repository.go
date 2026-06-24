package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalAddressPhoneSources() []pessoaMapSource {
	sources := m.integradoLocalAddressSources()
	return append(sources, m.integradoLocalPhoneSources()...)
}

func (m pessoaIntegradoLocalModel) integradoLocalAddressSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if pf, ok := m.models.Table("BD_RECEITANOVO", "PF"); ok && pf != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITANOVO", "RF4"))
		sources = append(sources, pessoaMapSource{
			category: "endereco",
			query: `
SELECT TOP 1000 CPF as cpf, Nome as nome, TipoLogradouro as tipoLogradouro, Logradouro as logradouro,
	CASE WHEN TRY_CAST(NumeroLogradouro as int) IS NULL THEN 0 ELSE CAST(NumeroLogradouro as int) END as numero,
	Complemento as complemento, Bairro as bairro, CEP as cep, UF as uf, Municipio as municipio,
	` + fonte + ` as fonte, 1 as rank
FROM ` + pf + `
WHERE CPF=@CPF`,
			args: oneCPFArg,
		})
	}
	if pf, ok := m.models.Table("BD_RECEITAFULL", "PF"); ok && pf != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITAFULL", "RF2"))
		sources = append(sources, pessoaMapSource{
			category: "endereco",
			query: `
SELECT TOP 1000 CPF as cpf, Nome as nome, TipoLogradouro as tipoLogradouro, Logradouro as logradouro,
	NumeroLogradouro as numero, Complemento as complemento, Bairro as bairro, CEP as cep, UF as uf, Municipio as municipio,
	` + fonte + ` as fonte, 3 as rank
FROM ` + pf + `
WHERE CPF=@CPF`,
			args: oneCPFArg,
		})
	}
	if renach, ok := m.models.Table("BD_RENACH_2014", "PF"); ok && renach != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RENACH_2014", "RN1"))
		sources = append(sources, pessoaMapSource{
			category: "endereco",
			query: `
SELECT TOP 1000 nr_cpf as cpf, nm_condutor as nome, ds_endereco as logradouro,
	nr_endereco as numero, ds_municipio_endereco as municipio, sg_uf_endereco as uf,
	nr_cep_endereco as cep, ds_complemento_endereco as complemento, ` + fonte + ` as fonte, 2 as rank
FROM ` + renach + `
WHERE nr_cpf=@CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
