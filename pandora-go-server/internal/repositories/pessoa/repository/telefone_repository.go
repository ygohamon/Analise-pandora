package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalPhoneSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if pf, ok := m.models.Table("BD_RECEITAFULL", "PF"); ok && pf != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITAFULL", "RF2"))
		sources = append(sources, pessoaMapSource{
			category: "telefone",
			query: `
SELECT TOP 1000 CPF as cpf, Nome as nome,
	CASE WHEN Telefone = '00000000' OR Telefone = '' THEN NULL ELSE CASE WHEN DDD = '0000' THEN NULL ELSE RIGHT(DDD, 2) END END as ddd,
	CASE WHEN Telefone = '00000000' OR Telefone = '' THEN NULL ELSE Telefone END as telefone,
	` + fonte + ` as fonte, 1 as rank
FROM ` + pf + `
WHERE CPF=@CPF AND (Telefone <> '00000000' AND Telefone <> '')`,
			args: oneCPFArg,
		})
	}
	if socio, ok := m.models.Table("BD_RECEITA", "SOCIO_HISTORICO"); ok && socio != "" {
		fonte := sqlLiteral(m.modelSigla("BD_RECEITA", "RF6"))
		sources = append(sources, pessoaMapSource{
			category: "telefone",
			query: `
SELECT TOP 1000 NUM_CPF as cpf,
	CASE WHEN NUM_TELEFONE = '0' OR NUM_TELEFONE IS NULL THEN NULL ELSE CASE WHEN NUM_DDD = '0' THEN NULL ELSE NUM_DDD END END as ddd,
	CASE WHEN NUM_TELEFONE = '0' OR NUM_TELEFONE IS NULL THEN NULL ELSE NUM_TELEFONE END as telefone,
	` + fonte + ` as fonte, 0 as rank
FROM ` + socio + `
WHERE NUM_CPF=@CPF AND (NUM_TELEFONE <> '0' AND NUM_TELEFONE IS NOT NULL)`,
			args: oneCPFArg,
		})
	}
	return sources
}
