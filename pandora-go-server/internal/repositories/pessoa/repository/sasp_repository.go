package pessoa

import (
	"context"
	"database/sql"
)

// LocalSASPCPF consulta tabelas SASP quando o model local estiver configurado.
// Retorna resultados nas categorias sasp, fato, abordagem e ocorrencia.
func (m SQLRepository) LocalSASPCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalSASPSources()
	})
}

func (m pessoaIntegradoLocalModel) integradoLocalSASPSources() []pessoaMapSource {
	documentos, ok := m.models.Table("BD_SASP_PMPB", "DOCUMENTOS")
	if !ok || documentos == "" {
		return nil
	}
	fonte := sqlLiteral(m.modelSigla("BD_SASP_PMPB", "SASP"))
	source := func(name, category, selectSQL, joins string) pessoaMapSource {
		return pessoaMapSource{
			sourceName: name,
			category:   category,
			query: `SELECT TOP 1000 ` + selectSQL + `, ` + fonte + ` as fonte
FROM ` + documentos + ` documento
` + joins + `
WHERE documento.numeracao=@CPF`,
			args: func(cpf string) []any { return []any{sql.Named("CPF", cpf)} },
		}
	}
	return []pessoaMapSource{
		source("sasp.pessoa", "sasp", "documento.*", ""),
		source("sasp.fatos", "fato", "documento.numeracao as cpf, fatos.*", optionalJoin(m, "BD_SASP_PMPB", "FATOS_PESSOAS", "fpessoa", "documento.id_pessoa = fpessoa.id_pessoa")+optionalJoin(m, "BD_SASP_PMPB", "FATOS", "fatos", "fpessoa.id_fato = fatos.id")),
		source("sasp.abordagens", "abordagem", "documento.numeracao as cpf, apessoa.*", optionalJoin(m, "BD_SASP_PMPB", "ABORDAGENS_PESSOAS", "apessoa", "documento.id_pessoa = apessoa.id_pessoa")),
		source("sasp.ocorrencias", "ocorrencia", "documento.numeracao as cpf, opessoas.*", optionalJoin(m, "BD_SASP_PMPB", "OCORRENCIAS_ENVOLVIDOS", "opessoas", "documento.id_pessoa = opessoas.id_pessoa")),
	}
}

func optionalJoin(m pessoaIntegradoLocalModel, model, key, alias, on string) string {
	table, ok := m.models.Table(model, key)
	if !ok || table == "" {
		return ""
	}
	return "LEFT OUTER JOIN " + table + " " + alias + " ON " + on + "\n"
}
