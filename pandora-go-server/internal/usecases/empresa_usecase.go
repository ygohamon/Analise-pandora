package usecases

import (
	"context"
	"strings"

	"pandora-go-server/internal/repositories"
	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
	"pandora-go-server/internal/validators"
)

// EmpresaUseCase valida entradas e chama consultas especificas de Empresa/CNPJ.
type EmpresaUseCase struct {
	repo      repositories.IntegradoEmpresaRepository
	integrado IntegradoEmpresaUseCase
}

// NewEmpresaUseCase cria o caso de uso chamado pelos handlers de empresa.
func NewEmpresaUseCase(repo repositories.IntegradoEmpresaRepository) EmpresaUseCase {
	return EmpresaUseCase{repo: repo, integrado: NewIntegradoEmpresaUseCase(repo)}
}

// IntegradoCNPJ monta a resposta categorizada esperada pela tela integrada de empresa.
func (u EmpresaUseCase) IntegradoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) (any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return u.integrado.IntegradoCNPJ(ctx, cnpj, options)
}

// DetalhadoCNPJ consulta dados cadastrais detalhados equivalentes ao endpoint legado do Node.
func (u EmpresaUseCase) DetalhadoCNPJ(ctx context.Context, cnpj string, options types.SearchOptions) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return u.repo.DetalhadoCNPJ(ctx, cnpj, options)
}

// SimplificadoCNPJ consulta empresas pelo CNPJ.
func (u EmpresaUseCase) SimplificadoCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return u.repo.SimplificadoCNPJ(ctx, cnpj)
}

// SimplificadoRazaoSocial consulta empresas por razao social.
func (u EmpresaUseCase) SimplificadoRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	razaoSocial = strings.TrimSpace(razaoSocial)
	if len(razaoSocial) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoRazaoSocial(ctx, razaoSocial)
}

// SimplificadoNomeFantasia consulta empresas por nome fantasia.
func (u EmpresaUseCase) SimplificadoNomeFantasia(ctx context.Context, nomeFantasia string) ([]map[string]any, error) {
	nomeFantasia = strings.TrimSpace(nomeFantasia)
	if len(nomeFantasia) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoNomeFantasia(ctx, nomeFantasia)
}

// SimplificadoEndereco consulta empresas por logradouro.
func (u EmpresaUseCase) SimplificadoEndereco(ctx context.Context, endereco string) ([]map[string]any, error) {
	endereco = strings.TrimSpace(endereco)
	if len(endereco) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoEndereco(ctx, endereco)
}

// SimplificadoTelefone consulta empresas por telefone.
func (u EmpresaUseCase) SimplificadoTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	telefone = utils.OnlyDigits(telefone)
	if len(telefone) < 8 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoTelefone(ctx, telefone)
}

// SimplificadoEmail consulta empresas por e-mail.
func (u EmpresaUseCase) SimplificadoEmail(ctx context.Context, email string) ([]map[string]any, error) {
	email = strings.TrimSpace(email)
	if len(email) < 3 {
		return nil, types.ErrInvalidEmail
	}
	return u.repo.SimplificadoEmail(ctx, email)
}

// SimplificadoSocioPFCPF consulta empresas relacionadas a um socio CPF.
func (u EmpresaUseCase) SimplificadoSocioPFCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	cpf = utils.NormalizeCPF(cpf)
	if !validators.ValidCPF(cpf) {
		return nil, types.ErrInvalidCPF
	}
	return u.repo.SimplificadoSocioPFCPF(ctx, cpf)
}

// SimplificadoSocioPFNome consulta empresas relacionadas ao nome do socio PF.
func (u EmpresaUseCase) SimplificadoSocioPFNome(ctx context.Context, nome string) ([]map[string]any, error) {
	nome = strings.TrimSpace(nome)
	if len(nome) < 3 {
		return nil, types.ErrInvalidParam
	}
	return u.repo.SimplificadoSocioPFNome(ctx, nome)
}

// SimplificadoSocioPJCNPJ consulta empresas relacionadas a um socio CNPJ.
func (u EmpresaUseCase) SimplificadoSocioPJCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	cnpj = utils.NormalizeCNPJ(cnpj)
	if !validators.ValidCNPJ(cnpj) {
		return nil, types.ErrInvalidCNPJ
	}
	return u.repo.SimplificadoSocioPJCNPJ(ctx, cnpj)
}
