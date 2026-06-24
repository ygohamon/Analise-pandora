package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalTipologiaSources() []pessoaMapSource {
	table, ok := m.models.Table("BD_TIPOLOGIAS", "PF")
	if !ok || table == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_TIPOLOGIAS", "TIPOLOGIAS"))
	return []pessoaMapSource{{
		category: "tipologia",
		query: `
SELECT TOP 1000 CPF as cpf, Credor as nome,
	T1 as t1, T2 as t2, T3 as t3, T4 as t4, T5 as t5,
	T6 as t6, T7 as t7, T8 as t8, T9 as t9, T10 as t10,
	T11 as t11, T12 as t12, T13 as t13, T14 as t14, T15 as t15,
	T16 as t16, T17 as t17, T18 as t18, T19 as t19, T20 as t20,
	T21 as t21, T22 as t22, T23 as t23, T24 as t24, T25 as t25,
	T26 as t26, T27 as t27, T28 as t28, T29 as t29, T30 as t30,
	T31 as t31, TotalOcorrencias as totalOcorrencias, TotalPesoTipologia as totalPeso,
	DoacaoEleitoral as doacaoEleitoral, TaxaDoacao as taxaDoacao, TotalTCS as totalTCS,
	` + fonte + ` as fonte
FROM ` + table + `
WHERE CPF=@CPF AND TotalOcorrencias > 0`,
		args: oneCPFArg,
	}}
}
