package pessoa

// integradoLocalFiliacaoSources consulta filiacao partidaria pelo titulo eleitoral derivado do CPF.
// Retorna linhas para a aba filiacao do integrado local.
func (m pessoaIntegradoLocalModel) integradoLocalFiliacaoSources(fonte string) []pessoaMapSource {
	filiacao, ok := m.models.Table("ELEITORAL", "FILIACAO")
	if !ok || filiacao == "" {
		return nil
	}
	full, _ := m.models.Table("BD_RECEITAFULL", "PF")
	novo, _ := m.models.Table("BD_RECEITANOVO", "PF")
	if full == "" || novo == "" {
		return nil
	}
	return []pessoaMapSource{{
		category: "filiacao",
		query: `
SELECT DISTINCT TOP 1000
	F.dataExtracao, R.cpf, F.siglaPartido, F.nomePartido, F.uf, F.municipio,
	F.zonaEleitoral, F.secaoEleitoral, F.dataFiliacao, F.situacaoRegistro,
	F.tipoRegistro, F.dataProcessamento, F.dataDesfiliacao, F.dataCancelamento,
	F.dataRegularizacao, UPPER(F.motivoCancelamento) as motivoCancelamento,
	` + fonte + ` as fonte
FROM ` + filiacao + ` F
OUTER APPLY (
	SELECT CPF, PF.TituloEleitor FROM ` + full + ` PF WHERE PF.CPF=@CPF
	UNION
	SELECT CPF, PF.TituloEleitor FROM ` + novo + ` PF WHERE PF.CPF=@CPF
) R
WHERE F.numInscricao = TRY_CONVERT(FLOAT, R.TITULOELEITOR)`,
		args: oneCPFArg,
	}}
}
