package pessoa

import "database/sql"

// integradoLocalOrcrimPessoaSources consulta Orcrim local para abas pessoa e orcrim.
func (m pessoaIntegradoLocalModel) integradoLocalOrcrimPessoaSources() []pessoaMapSource {
	orcrim, ok := m.models.Table("BD_ORCRIM", "FACCIONADOS")
	if !ok || orcrim == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_ORCRIM", "FACC"))
	return []pessoaMapSource{
		{
			category: "pessoa",
			query: `
SELECT TOP 1000
	CPF1 as cpf,
	TRIM(NOME) as nome,
	TRY_CAST(DT_NASCIMENTO as date) as dataNascimento,
	CASE WHEN NOME_MAE = '' THEN NULL ELSE TRIM(NOME_MAE) END as nomeMae,
	CASE WHEN NOME_PAI = '' THEN NULL ELSE TRIM(NOME_PAI) END as nomePai,
	RG1 as rg,
	` + fonte + ` as fonte
FROM ` + orcrim + `
WHERE CPF1=@CPF14`,
			args: func(cpf string) []any { return []any{sql.Named("CPF14", formatCPF(cpf))} },
		},
		{
			category: "orcrim",
			query: `
SELECT TOP 1000
	ID as id,
	CPF1 as cpf,
	RG1 as documento,
	NOME as nome,
	VULGO as vulgo,
	NOME_PAI as pai,
	NOME_MAE as mae,
	DT_NASCIMENTO as dataNascimento,
	REGIAO as DDD,
	MANDADO_PRISAO as mandado,
	FUNCAO as funcao,
	OBS as obs,
	SITUACAO_PESSOAL as situacaoPessoal,
	SITUACAO_PROCESSUAL as situacaoProcessual,
	TATUAGEM as tatuagem,
	MATRICULA_SAP as matricula,
	FONTE as fonteOrcrim,
	SEGREDO_JUSTICA as segredo,
	PIC as pic,
	PROCESSO as processo,
	NM_OPERACAO as operacao,
	DT_DENUNCIA as denuncia,
	FONTES_ABERTAS as abertas,
	IMG as img,
	ADVOGADO as advogado,
	img_adv as img_adv,
	OAB_ADV as oab,
	'ORCRIM' as fonte
FROM ` + orcrim + `
WHERE CPF1=@CPF14`,
			args: func(cpf string) []any { return []any{sql.Named("CPF14", formatCPF(cpf))} },
		},
	}
}
