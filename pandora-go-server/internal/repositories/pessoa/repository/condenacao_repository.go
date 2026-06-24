package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalCondemnationSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if contas, ok := m.models.Table("BD_CONDENACOES", "CONTAS_ELEITORAIS_IRREGULARES_PB"); ok && contas != "" {
		sources = append(sources, pessoaMapSource{
			category: "processo",
			query: `
SELECT TOP 1000 processo, Município as municipio, uf, Deliberações as deliberacoes,
	TRY_CONVERT(DATE, [Trânsito em julgado], 103) as dataTransitoJulgado,
	TRY_CONVERT(DATE, [Data final], 103) as dataFinal, 'CEI' as fonte
FROM ` + contas + `
WHERE CPF=@CPF`,
			args: oneCPFArg,
		})
	}
	if cadicon, ok := m.models.Table("BD_CONDENACOES", "CADICON"); ok && cadicon != "" {
		sources = append(sources, pessoaMapSource{
			category: "processo",
			query: `
SELECT TOP 1000 DATA_TRANSITO_JULGADO as dataTransitoJulgado, SIGLA_TRIBUNAL as siglaTribunal,
	TEXTO_ACORDAO as acordao, URL_ACORDAO as urlAcordao, TEXTO_PROCESSO as processo,
	URL_PROCESSO as urlProcesso, COLEGIADO as colegiado, VALOR_DEBITO as vDebito,
	VALOR_MULTA as vMulta, 'CADICON' as fonte
FROM ` + cadicon + `
WHERE NUM_CPF=@CPF`,
			args: oneCPFArg,
		})
	}
	return sources
}
