package pessoa

// integradoLocalCandidaturaSources consulta candidatura, bens, gastos e doacoes eleitorais.
// Retorna linhas para a aba eleitoral do integrado local.
func (m pessoaIntegradoLocalModel) integradoLocalCandidaturaSources(fonte string) []pessoaMapSource {
	sources := []pessoaMapSource{}
	if candidatos, ok := m.models.Table("ELEITORAL", "VW_TSE_DADOS_CANDIDATO"); ok && candidatos != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000
	ANO_ELEICAO as ano,
	NR_TURNO as turno,
	DS_SIT_TOT_TURNO as situacao,
	SG_UF as uf,
	NM_UE as ue,
	DS_CARGO as cargo,
	SG_PARTIDO as partido,
	NR_CANDIDATO as numCandidato,
	NM_URNA_CANDIDATO as nomeUrna,
	DS_SITUACAO_CANDIDATURA as situacaoCandidatura,
	DS_COMPOSICAO_COLIGACAO as coligacao,
	NM_COLIGACAO as nomeColigacao,
	'candidato' as tipo,
	` + fonte + ` as fonte
FROM ` + candidatos + `
WHERE NR_CPF_CANDIDATO=@CPF`,
			args: oneCPFArg,
		})
	}
	if bens, ok := m.models.Table("ELEITORAL", "VW_TSE_BENS_CANDIDATO"); ok && bens != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000
	ANO_ELEICAO as ano,
	DS_TIPO_BEM_CANDIDATO as classe,
	DS_BEM_CANDIDATO as descricao,
	VR_BEM_CANDIDATO as valor,
	'bem' as tipo,
	` + fonte + ` as fonte
FROM ` + bens + `
WHERE NR_CPF_CANDIDATO=@CPF`,
			args: oneCPFArg,
		})
	}
	if gastos, ok := m.models.Table("ELEITORAL", "VW_TSE_GASTOS_CANDIDATO"); ok && gastos != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000 ANO_ELEICAO as ano, SG_UF as uf, DS_CARGO as cargo,
	COUNT(*) as qtd, SUM(VR_DESPESA) as valor, AVG(VR_DESPESA) as media,
	MIN(VR_DESPESA) as menor, MAX(VR_DESPESA) as maior,
	'gastos' as tipo, ` + fonte + ` as fonte
FROM ` + gastos + `
WHERE NR_CPF_CANDIDATO=@CPF
GROUP BY ANO_ELEICAO, SG_UF, DS_CARGO`,
			args: oneCPFArg,
		})
	}
	if recebidas, ok := m.models.Table("ELEITORAL", "VW_TSE_DOACOES_RECEBIDAS_CANDIDATO"); ok && recebidas != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000 ANO_ELEICAO as ano, SG_UF as uf, NM_UE as ue,
	COUNT(*) as qtd, SUM(VR_RECEITA) as valor, MAX(VR_RECEITA) as maior,
	MIN(VR_RECEITA) as menor, AVG(VR_RECEITA) as media,
	'doador' as tipo, ` + fonte + ` as fonte
FROM ` + recebidas + `
WHERE NR_CPF_CANDIDATO=@CPF
GROUP BY ANO_ELEICAO, SG_UF, NM_UE`,
			args: oneCPFArg,
		})
	}
	if feitas, ok := m.models.Table("ELEITORAL", "VW_TSE_DOACOES_FEITAS_PESSOAS"); ok && feitas != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000 ANO_ELEICAO as ano, SG_UF as uf, NM_UE as ue,
	UPPER(DS_CARGO) as cargo, SG_PARTIDO as partido, NR_CANDIDATO as numeroCandidato,
	NR_CPF_CANDIDATO as cpf, NM_CANDIDATO as nome, COUNT(*) as qtd,
	SUM(VR_RECEITA) as valor, 'doacao' as tipo, ` + fonte + ` as fonte
FROM ` + feitas + `
WHERE NR_CPF_CNPJ_DOADOR=@CPF
GROUP BY ANO_ELEICAO, SG_UF, NM_UE, DS_CARGO, SG_PARTIDO, NR_CANDIDATO, NR_CPF_CANDIDATO, NM_CANDIDATO`,
			args: oneCPFArg,
		})
	}
	if fornecedores, ok := m.models.Table("ELEITORAL", "VW_TSE_FORNECEDORES_CANDIDATO"); ok && fornecedores != "" {
		sources = append(sources, pessoaMapSource{
			category: "eleitoral",
			query: `
SELECT TOP 1000 ANO_ELEICAO as ano, SG_UF as uf, NM_UE as ue,
	DS_CARGO as cargo, SG_PARTIDO as partido, NR_CANDIDATO as numeroCandidato,
	NR_CPF_CANDIDATO as cpf, NM_CANDIDATO as nome, COUNT(*) as qtd,
	SUM(VR_DESPESA) as valor, AVG(VR_DESPESA) as media,
	MIN(VR_DESPESA) as menor, MAX(VR_DESPESA) as maior,
	'forneceu' as tipo, ` + fonte + ` as fonte
FROM ` + fornecedores + `
WHERE NR_CPF_CNPJ_FORNECEDOR=@CPF
GROUP BY ANO_ELEICAO, SG_UF, NM_UE, DS_CARGO, SG_PARTIDO, NR_CANDIDATO, NR_CPF_CANDIDATO, NM_CANDIDATO`,
			args: oneCPFArg,
		})
	}
	return sources
}
