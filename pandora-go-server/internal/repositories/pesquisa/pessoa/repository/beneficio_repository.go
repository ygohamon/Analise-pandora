package pessoa

func (m pessoaIntegradoLocalModel) integradoLocalBenefitSources() []pessoaMapSource {
	sources := []pessoaMapSource{}
	if cartao, ok := m.models.Table("BD_BENEFICIOS", "CARTAO_ALIMENTACAO_PB"); ok && cartao != "" {
		sources = append(sources, pessoaMapSource{
			category: "beneficio",
			query: `
SELECT TOP 1000 CIDADE as cidade, NIS_BENEFICIARIO as nis, NOME_BENEFICIARIO as nome,
	NOME_RESPONSAVEL as responsavel, CPF_RESPONSAVEL as cpf, FONE_CONTATO as fone,
	ENDERECO as endereco, RG_RESPONSAVEL as rgResponsavel, 'cartao_alimentacao_pb' as tipo,
	'cartao_alimentacao_pb' as fonte
FROM ` + cartao + `
WHERE CPF_RESPONSAVEL=@CPF`,
			args: oneCPFArg,
		})
	}
	if bf2014, ok := m.models.Table("BOLSAFAMILIA", "BF2014"); ok && bf2014 != "" {
		bf2015, _ := m.models.Table("BOLSAFAMILIA", "BF2015")
		bf2016, _ := m.models.Table("BOLSAFAMILIA", "BF2016")
		cad, _ := m.models.Table("BOLSAFAMILIA", "CAD")
		if bf2015 != "" && bf2016 != "" && cad != "" {
			sources = append(sources, pessoaMapSource{
				category: "beneficio",
				query: `
SELECT TOP 1000 BF.Municipio as agenciaMunicipio, BF.UF as agenciaUf, BF.NomeTitular as nome,
	CAD.CPF as cpf, BF.NisTitular as nis, BF.CompetFolha as competenciaFolha, BF.VlrTotal as vlrTotal,
	BF.Endereco as logradouro, BF.Localidade as municipio, BF.NISDEPENDEN as nisDependente,
	BF.Dependente as nomeDependente, BF.Idade as idadeDependente, BF.RendaPerc as rendaPerCapita,
	BF.Renda_com_PBF as rendaComPBF, BF.QTDE_MEMBROS as qtdMembros, CAD.COD_FAMILIAR as codFamiliar,
	CAD.NUM_MEMBROS_FAM as numMembros, CAD.VLR_RENDA_FAM as vlrRendaFamilia, 'bolsa_familia' as tipo,
	'BOLSAFAMILIA' as fonte
FROM (
	SELECT * FROM ` + bf2014 + `
	UNION ALL SELECT * FROM ` + bf2015 + `
	UNION ALL SELECT * FROM ` + bf2016 + `
) BF
INNER JOIN ` + cad + ` CAD ON BF.NISTitular = CAD.NIS
WHERE CAD.CPF=@CPF`,
				args: oneCPFArg,
			})
		}
	}
	if rais, ok := m.models.Table("BD_RAIS", "RAIS"); ok && rais != "" {
		pj, _ := m.models.Table("BD_RECEITA", "PJ")
		joinPJ := ""
		pjSelect := "CAST(NULL AS varchar(14)) as cnpj, CAST(NULL AS varchar(255)) as razaoSocial, CAST(NULL AS varchar(255)) as nomeFantasia, CAST(NULL AS varchar(100)) as uf, CAST(NULL AS varchar(255)) as municipio"
		if pj != "" {
			joinPJ = " LEFT OUTER JOIN " + pj + " PJ ON PJ.CNPJ = R.CO_CNPJ_CEI"
			pjSelect = "R.CO_CNPJ_CEI as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia, PJ.Uf as uf, PJ.Municipio as municipio"
		}
		sources = append(sources, pessoaMapSource{
			category: "empregador",
			query: `
SELECT TOP 1000 R.ANO_RAIS as ano, R.CO_CPF as cpf, R.NO_PARTIC_RAIS as nome, ` + pjSelect + `,
	R.CO_PIS as pis, R.CO_CTPS_NUMERO as ctpsNumero, R.CO_CTPS_SERIE as ctpsSerie,
	R.DA_ADMISSAO_RAIS_DMA as dtAdmissao, R.DA_DESLIGAMENTO_RAIS_DM as dtDesligamento,
	R.QT_HORA_SEMANA_RAIS as cargaHoraria, R.VA_SALARIO_CONT_RAIS as salarioContratado,
	'RAIS' as fonte
FROM ` + rais + ` R` + joinPJ + `
WHERE R.CO_CPF=@CPF
ORDER BY R.ANO_RAIS DESC`,
			args: oneCPFArg,
		})
	}
	return sources
}
