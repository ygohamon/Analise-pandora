package pessoa

// integradoLocalPessoaExtraSources agrega fontes locais que enriquecem a aba pessoa.
// Chamado pelo fluxo integrado local; cada helper representa uma fonte especifica.
func (m pessoaIntegradoLocalModel) integradoLocalPessoaExtraSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	sources = append(sources, m.integradoLocalCNHSources()...)
	sources = append(sources, m.integradoLocalTSEPessoaSources()...)
	sources = append(sources, m.integradoLocalRenachPessoaSources()...)
	sources = append(sources, m.integradoLocalOrcrimPessoaSources()...)
	return sources
}

func formatCPF(cpf string) string {
	digits := onlyDigits(cpf)
	if len(digits) != 11 {
		return cpf
	}
	return digits[0:3] + "." + digits[3:6] + "." + digits[6:9] + "-" + digits[9:11]
}
