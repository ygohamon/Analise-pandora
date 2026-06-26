package pessoa

// integradoLocalEleitorSources consulta cadastro eleitoral basico por CPF.
// Retorna linhas para a aba eleitoral do integrado local.
func (m pessoaIntegradoLocalModel) integradoLocalEleitorSources() []pessoaMapSource {
	if eleitor, ok := m.models.Table("BD_TSE", "ELEITOR"); ok && eleitor != "" {
		return []pessoaMapSource{{
			category: "eleitoral",
			query: `
SELECT TOP 1000 NUM_CPF as cpf, NOM_ELEITOR as nome, NUM_INSCRICAO as tituloEleitor,
	NOM_MAE as nomeMae, NOM_PAI as nomePai, DAT_NASC_FORMATADA as dataNascimento, 'TSE' as fonte
FROM ` + eleitor + `
WHERE NUM_CPF=@CPF`,
			args: oneCPFArg,
		}}
	}
	return nil
}
