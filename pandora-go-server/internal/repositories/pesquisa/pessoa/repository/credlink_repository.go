package pessoa

import (
	"context"

	credlinkapi "pandora-go-server/internal/integrations/credlink"
)

func (m pessoaIntegradoExternoModel) consultaCredlinkCompleto(ctx context.Context, cpf string) (map[string]any, error) {
	model, ok := m.models.Get("CREDLINK")
	if !ok || !model.Ativado {
		return nil, nil
	}
	return credlinkapi.NewClient(model).Completo(ctx, cpf)
}
