package pessoa

import (
	"context"
	"net/url"
)

// consultaCortexMandadoCPF consulta BNMP/Cortex para a aba mandado.
func (m pessoaIntegradoExternoModel) consultaCortexMandadoCPF(ctx context.Context, cx *cortexContext, cpf, cpfUsuario string) ([]map[string]any, error) {
	lista, err := cx.client.Get(ctx, cx.basePessoas+"/bnmp/cpf/listagem?cpf="+url.QueryEscape(cpf), cpfUsuario)
	if err != nil || lista == nil {
		return nil, err
	}
	out := []map[string]any{}
	for _, item := range arrayOfMaps(lista) {
		idPessoa := cleanText(firstMapValue(item, "idpessoa", "idPessoa", "id"))
		if idPessoa == "" {
			continue
		}
		detalhe, err := cx.client.Get(ctx, cx.basePessoas+"/bnmp/"+url.PathEscape(idPessoa), cpfUsuario)
		if err != nil || detalhe == nil {
			continue
		}
		row := cleanMap(asMap(detalhe))
		row["fonte"] = cx.sigla
		row["rank"] = 0
		out = append(out, row)
	}
	return out, nil
}
