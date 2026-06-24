package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalVirtualSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if socio, ok := m.models.Table("BD_RECEITA", "SOCIO_HISTORICO"); ok && socio != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
		sources = append(sources, pessoaMapSource{
			category: "virtual",
			query: `
SELECT DISTINCT TOP 1000 NUM_CPF as cpf, lower(DESCR_EMAIL) as email, 'email' as tipo, ` + fonte + ` as fonte
FROM ` + socio + `
WHERE NUM_CPF=@CPF AND (DESCR_EMAIL IS NOT NULL AND DESCR_EMAIL <> '')`,
			args: oneCPFArg,
		})
	}
	if email, ok := m.models.Table("BD_VIRTUAL", "EMAIL"); ok && email != "" {
		sources = append(sources, pessoaMapSource{
			category: "virtual",
			query: `
SELECT DISTINCT TOP 1000 CPF_CNPJ as cpf, LOWER(EMAIL) as email, 'email' as tipo, fonte
FROM ` + email + `
WHERE CPF_CNPJ=@CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
