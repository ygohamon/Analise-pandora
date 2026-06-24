package pessoa

import "context"

// LocalFichaSujaCPF consulta condenacoes eleitorais da fonte Ficha Suja.
// Chamado pelo IntegradoCPFUseCase para a aba ficha_suja.
func (m SQLRepository) LocalFichaSujaCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		table, ok := local.models.Table("BD_FICHA_SUJA", "ELEITORAL_FS")
		if !ok || table == "" {
			return nil
		}
		return []pessoaMapSource{{
			sourceName: "ficha_suja.cpf",
			category:   "ficha_suja",
			query: `SELECT TOP 1000 *, ` + sqlLiteral(local.modelSigla("BD_FICHA_SUJA", "FS")) + ` as fonte
FROM ` + table + `
WHERE cpf=@CPF AND numero_processo IS NOT NULL AND numero_processo <> '-'`,
			args: oneCPFArg,
		}}
	})
}

// LocalCartorioCPF consulta atos cartorarios por CPF.
func (m SQLRepository) LocalCartorioCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		table, ok := local.models.Table("BD_CARTORIOS", "BD_ATOS_CARTORIOS_BR_JP_CPF_CNPJ")
		if !ok || table == "" {
			return nil
		}
		return []pessoaMapSource{{
			sourceName: "cartorio.cpf",
			category:   "cartorio",
			query: `SELECT TOP 1000 Data_Ato as data_ato, Tipo_Ato_Natureza_e_Valor as tipo_ato_natureza_e_valor,
	Cartorio as cartorio, Municipio_UF as municipio_uf, Livro as livro, Folha as folha,
	Nome_Parte as nome_parte, CPF_CNPJ_Parte as cpf_cnpj_parte, Qualidade as qualidade,
	num_Partes as num_partes, num_Atos as num_atos, ` + sqlLiteral(local.modelSigla("BD_CARTORIOS", "CART")) + ` as fonte
FROM ` + table + `
WHERE CPF_CNPJ_Parte=@CPF`,
			args: oneCPFArg,
		}}
	})
}

// LocalCandidatoCPF consulta a fonte DivulgaCand distinta da aba eleitoral.
func (m SQLRepository) LocalCandidatoCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		table, ok := local.models.Table("BD_DIVULGACAN", "CANDIDATOS_2024")
		if !ok || table == "" {
			return nil
		}
		return []pessoaMapSource{{
			sourceName: "divulgacan.candidato",
			category:   "candidato",
			query: `SELECT TOP 1000 *, ` + sqlLiteral(local.modelSigla("BD_DIVULGACAN", "CAND")) + ` as fonte
FROM ` + table + `
WHERE cpf=@CPF OR CPF=@CPF`,
			args: oneCPFArg,
		}}
	})
}
