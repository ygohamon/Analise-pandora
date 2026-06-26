package pessoa

// integradoLocalElectoralSources agrega fontes eleitorais locais usadas no integrado por CPF.
// Chamado pelo fluxo local; cada helper abaixo representa um consumo especifico.
func (m pessoaIntegradoLocalModel) integradoLocalElectoralSources() []pessoaMapSource {
	fonte := sqlLiteral(m.modelSigla("ELEITORAL", "TSE"))
	sources := []pessoaMapSource{}
	sources = append(sources, m.integradoLocalEleitorSources()...)
	sources = append(sources, m.integradoLocalCandidaturaSources(fonte)...)
	sources = append(sources, m.integradoLocalFiliacaoSources(fonte)...)
	return sources
}
