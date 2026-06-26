package repositories

import (
	"context"
)

// EnderecoRepository define consultas especificas de endereco e vizinhanca.
type EnderecoRepository interface {
	LocalReceitaCPF(context.Context, string) ([]SourceResult, error)
	LocalEnderecoCPF(context.Context, string) ([]SourceResult, error)
}

// EnderecoConsultaRepository atende as rotas isoladas da tela pesquisa/endereco.
//
// UseCases chamam estes metodos para obter linhas ja no shape legado do front.
type EnderecoConsultaRepository interface {
	EnderecosPorCPF(context.Context, string) ([]map[string]any, error)
	EnderecosPorCNPJ(context.Context, string) ([]map[string]any, error)
	EnderecosPorLogradouro(context.Context, string) ([]map[string]any, error)
	EnderecosPorNome(context.Context, string) ([]map[string]any, error)
	EnderecosPorRazaoSocial(context.Context, string) ([]map[string]any, error)
}
