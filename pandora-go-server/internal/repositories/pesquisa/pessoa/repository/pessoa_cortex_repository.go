package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexPessoaBaseCPF consulta pessoa fisica uma vez e retorna as abas derivadas.
func (m pessoaIntegradoExternoModel) consultaCortexPessoaBaseCPF(ctx context.Context, cpf, cpfUsuario string) []SourceResult {
	cx := m.cortexClient()
	if !cx.ok {
		return nil
	}
	payload, err := cx.pessoaFisica(ctx, cpf, cpfUsuario)
	if err != nil {
		return []SourceResult{{Name: "cortex.pessoafisica", Category: "pessoa", Err: err}}
	}
	mapped := asMap(payload)
	if len(mapped) == 0 {
		return nil
	}
	return []SourceResult{
		{Name: "cortex.pessoafisica", Category: "pessoa", Rows: mappers.CortexPessoaFisicaRows(mapped, cx.sigla)},
		{Name: "cortex.endereco", Category: "endereco", Rows: mappers.CortexEnderecoRows(mapped, cx.sigla)},
		{Name: "cortex.telefone", Category: "telefone", Rows: mappers.CortexTelefoneRows(mapped, cx.sigla)},
	}
}

// consultaCortexPessoaCPF consulta pessoa fisica Cortex e devolve dados da aba pessoa.
// Chamado pelo integrado externo de pessoa como uma fonte especifica.
func (m pessoaIntegradoExternoModel) consultaCortexPessoaCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.pessoaFisica(ctx, cpf, cpfUsuario)
	return mappers.CortexPessoaFisicaRows(asMap(payload), cx.sigla), err
}

// consultaCortexEnderecoCPF reaproveita o payload de pessoa fisica Cortex para a aba endereco.
func (m pessoaIntegradoExternoModel) consultaCortexEnderecoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.pessoaFisica(ctx, cpf, cpfUsuario)
	return mappers.CortexEnderecoRows(asMap(payload), cx.sigla), err
}

// consultaCortexTelefoneCPF reaproveita o payload de pessoa fisica Cortex para a aba telefone.
func (m pessoaIntegradoExternoModel) consultaCortexTelefoneCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.pessoaFisica(ctx, cpf, cpfUsuario)
	return mappers.CortexTelefoneRows(asMap(payload), cx.sigla), err
}
