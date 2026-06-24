package usecases

import (
	"context"

	"pandora-go-server/internal/repositories"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// PessoaUseCase valida entradas e escolhe o fluxo de consulta de pessoas.
type PessoaUseCase struct {
	repo      repositories.IntegradoPessoaRepository
	integrado IntegradoCPFUseCase
}

// NewPessoaUseCase monta o caso de uso usado pelos handlers HTTP.
func NewPessoaUseCase(repo repositories.IntegradoPessoaRepository) PessoaUseCase {
	return PessoaUseCase{repo: repo, integrado: NewIntegradoCPFUseCase(repo)}
}

// IntegradoCPF delega a orquestracao integrada para o usecase especifico.
func (u PessoaUseCase) IntegradoCPF(ctx context.Context, cpf string, options types.SearchOptions) (any, error) {
	return u.integrado.IntegradoCPF(ctx, cpf, options)
}

// IntegradoRG preserva a rota legada do Node e retorna abas a partir das fontes ja migradas por RG.
func (u PessoaUseCase) IntegradoRG(ctx context.Context, rg string, options types.SearchOptions) (any, error) {
	if len(rg) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.integrado.IntegradoRG(ctx, rg, options)
}

// IntegradoNome preserva a rota legada do Node e retorna abas a partir das fontes ja migradas por nome.
func (u PessoaUseCase) IntegradoNome(ctx context.Context, nome string, options types.SearchOptions) (any, error) {
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.integrado.IntegradoNome(ctx, nome, options)
}

// AntecedentePDFRG valida a rota de clique no RG e delega ao repository SISMP.
func (u PessoaUseCase) AntecedentePDFRG(ctx context.Context, rg string, login string) ([]map[string]any, error) {
	if len(rg) < 3 || len(login) < 2 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.AntecedentePDFRG(ctx, rg, login)
}

// SimplificadoCPF consulta uma pessoa pelo CPF nas fontes simplificadas.
func (u PessoaUseCase) SimplificadoCPF(ctx context.Context, cpf string) ([]types.PessoaSimplificada, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return u.repo.SimplificadoCPF(ctx, cpf)
}

// SimplificadoNome consulta pessoas pelo nome.
func (u PessoaUseCase) SimplificadoNome(ctx context.Context, nome string) ([]types.PessoaSimplificada, error) {
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoNome(ctx, nome)
}

// SimplificadoRG consulta pessoas por RG.
func (u PessoaUseCase) SimplificadoRG(ctx context.Context, rg string) ([]types.PessoaSimplificada, error) {
	if len(rg) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoRG(ctx, rg)
}

// SimplificadoCNH consulta pessoas por CNH.
func (u PessoaUseCase) SimplificadoCNH(ctx context.Context, cnh string) ([]types.PessoaSimplificada, error) {
	if len(cnh) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoCNH(ctx, cnh)
}

// SimplificadoTitulo consulta pessoas por titulo eleitoral.
func (u PessoaUseCase) SimplificadoTitulo(ctx context.Context, titulo string) ([]types.PessoaSimplificada, error) {
	if len(titulo) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoTitulo(ctx, titulo)
}

// SimplificadoNomePai consulta pessoas pelo nome do pai.
func (u PessoaUseCase) SimplificadoNomePai(ctx context.Context, nomePai string) ([]types.PessoaSimplificada, error) {
	if len(nomePai) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoNomePai(ctx, nomePai)
}

// SimplificadoNomeMae consulta pessoas pelo nome da mae.
func (u PessoaUseCase) SimplificadoNomeMae(ctx context.Context, nomeMae string) ([]types.PessoaSimplificada, error) {
	if len(nomeMae) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoNomeMae(ctx, nomeMae)
}

// SimplificadoTelefone consulta pessoas por telefone.
func (u PessoaUseCase) SimplificadoTelefone(ctx context.Context, telefone string) ([]types.PessoaSimplificada, error) {
	if len(telefone) < 8 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoTelefone(ctx, telefone)
}

// SimplificadoEmail consulta pessoas por email.
func (u PessoaUseCase) SimplificadoEmail(ctx context.Context, email string) ([]types.PessoaSimplificada, error) {
	if len(email) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoEmail(ctx, email)
}

// SimplificadoEndereco consulta pessoas por endereco.
func (u PessoaUseCase) SimplificadoEndereco(ctx context.Context, endereco string) ([]types.PessoaSimplificada, error) {
	if len(endereco) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoEndereco(ctx, endereco)
}
