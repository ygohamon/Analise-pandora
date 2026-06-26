package pessoa

import (
	"context"

	"pandora-go-server/internal/types"
)

// SimplificadoCPF consulta o CPF nas fontes basicas de pessoa.
func (m SQLRepository) SimplificadoCPF(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoCPF(ctx, cpf)
}

func (m SQLRepository) SimplificadoNome(ctx context.Context, nome string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoNome(ctx, nome)
}

// SimplificadoRG e uma consulta especifica por RG; retorna vazio ate a fonte ser migrada.
func (m SQLRepository) SimplificadoRG(ctx context.Context, rg string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoRG(ctx, rg)
}

// SimplificadoCNH e uma consulta especifica por CNH; retorna vazio ate a fonte ser migrada.
func (m SQLRepository) SimplificadoCNH(ctx context.Context, cnh string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoCNH(ctx, cnh)
}

// SimplificadoTitulo e uma consulta especifica por titulo eleitoral; retorna vazio ate a fonte ser migrada.
func (m SQLRepository) SimplificadoTitulo(ctx context.Context, titulo string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoTitulo(ctx, titulo)
}

func (m SQLRepository) SimplificadoNomePai(ctx context.Context, nomePai string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoNomePai(ctx, nomePai)
}

func (m SQLRepository) SimplificadoNomeMae(ctx context.Context, nomeMae string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoNomeMae(ctx, nomeMae)
}

func (m SQLRepository) SimplificadoTelefone(ctx context.Context, telefone string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoTelefone(ctx, telefone)
}

func (m SQLRepository) SimplificadoEmail(ctx context.Context, email string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoEmail(ctx, email)
}

func (m SQLRepository) SimplificadoEndereco(ctx context.Context, endereco string) ([]types.PessoaSimplificada, error) {
	return m.simplificadoModel().SimplificadoEndereco(ctx, endereco)
}
