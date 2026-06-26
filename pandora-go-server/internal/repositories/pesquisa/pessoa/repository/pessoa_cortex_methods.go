package pessoa

import (
	"context"

	"pandora-go-server/internal/types"
)

// CortexPessoaBaseCPF executa a chamada Cortex pessoafisica e mapeia pessoa/endereco/telefone.
func (m SQLRepository) CortexPessoaBaseCPF(ctx context.Context, cpf string, options types.SearchOptions) []SourceResult {
	if m.db == nil {
		return []SourceResult{{Name: "cortex", Err: types.ErrNotMigrated}}
	}
	return m.integradoExternoModel().consultaCortexPessoaBaseCPF(ctx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexEmpresasResponsavelCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexEmpresasResponsavelCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexEmpresasContadorCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexEmpresasContadorCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexQuadroSocietarioCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexQuadroSocietarioCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexCondutorCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexCondutorCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexCasamentoCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexCasamentoCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexObitoCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexObitoCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexAmadorCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexAmadorCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexMandadoCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexMandadoCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexVeiculoCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexVeiculoCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) CortexEmbarcacaoCPF(ctx context.Context, cpf string, options types.SearchOptions) ([]map[string]any, error) {
	ext, cx := m.cortexExternalModel()
	if !cx.ok {
		return nil, nil
	}
	return ext.consultaCortexEmbarcacaoCPF(ctx, cx, cpf, options.CPFUsuario)
}

func (m SQLRepository) cortexExternalModel() (pessoaIntegradoExternoModel, *cortexContext) {
	ext := m.integradoExternoModel()
	return ext, ext.cortexClient()
}
