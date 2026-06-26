package pessoa

import "context"

// LocalPatrimonioCPF consulta fontes locais de patrimonio, aeronave e embarcacao.
func (m SQLRepository) LocalPatrimonioCPF(ctx context.Context, cpf string) ([]SourceResult, error) {
	return m.queryLocalSources(ctx, cpf, func(local pessoaIntegradoLocalModel) []pessoaMapSource {
		return local.integradoLocalTransportPropertySources()
	})
}
