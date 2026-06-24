package pessoa

import (
	"context"

	"pandora-go-server/internal/mappers"
)

// consultaCortexEmpresasResponsavelCPF consulta empresas Cortex onde o CPF e responsavel.
func (m pessoaIntegradoExternoModel) consultaCortexEmpresasResponsavelCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/pessoajuridica/"+cpf+"/listagemresponsavel", cpfUsuario)
	return mappers.CortexEmpresasResponsavelRows(payload, cx.sigla), err
}

// consultaCortexEmpresasContadorCPF consulta empresas Cortex onde o CPF e contador.
func (m pessoaIntegradoExternoModel) consultaCortexEmpresasContadorCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/pessoajuridica/"+cpf+"/listagemcontador", cpfUsuario)
	return mappers.CortexEmpresasContadorRows(payload, cx.sigla), err
}

// consultaCortexQuadroSocietarioCPF consulta sociedades Cortex relacionadas ao CPF.
func (m pessoaIntegradoExternoModel) consultaCortexQuadroSocietarioCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	payload, err := cx.client.Get(ctx, cx.basePessoas+"/pessoajuridica/"+cpf+"/listagemsocio", cpfUsuario)
	return mappers.CortexQuadroSocietarioRows(payload, cx.sigla), err
}
