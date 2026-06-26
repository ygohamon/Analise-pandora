package repositories

import (
	"context"
)

// TelefoneRepository define consultas especificas de telefone.
type TelefoneRepository interface {
	LocalTelefoneCPF(context.Context, string) ([]SourceResult, error)
}

// TelefoneConsultaRepository atende as rotas isoladas da tela pesquisa/telefone.
type TelefoneConsultaRepository interface {
	TelefonesPorCPF(context.Context, string) ([]map[string]any, error)
	TelefonesPorCNPJ(context.Context, string) ([]map[string]any, error)
	TelefonesPorNome(context.Context, string) ([]map[string]any, error)
	TelefonesPorRazaoSocial(context.Context, string) ([]map[string]any, error)
	TelefonesPorTelefone(context.Context, string) ([]map[string]any, error)
}
