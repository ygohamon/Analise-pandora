package pessoa

import "context"

// LocalITBICPF consulta transferencias ITBI pela funcao configurada da prefeitura.
// Chamado pelo IntegradoCPFUseCase para complementar a aba imovel.
func (m SQLRepository) LocalITBICPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		fn, ok := local.models.Table("BD_PREFEITURA", "FUNCAO_BD_STAR")
		if !ok || fn == "" {
			return nil
		}
		return []pessoaMapSource{{
			sourceName: "itbi.cpf",
			category:   "imovel",
			query: `SELECT TOP 1000 proprietarioAnterior, cpfCnPJAnterior, nome, cpfCnpj,
	tipoLogradouro, logradouro, numero, bloco, apto, bairro, cep,
	natureza, transacao, valorMercado, valorAvaliacao, areaPrivTotal, valorMetro,
	dtAvaliacao, dtLancamento, fonte
FROM ` + fn + `(@CPF)
ORDER BY proprietarioAnterior, dtLancamento`,
			args: oneCPFArg,
		}}
	})
}
