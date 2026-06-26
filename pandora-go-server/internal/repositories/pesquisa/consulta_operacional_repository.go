package repositories

import (
	"context"
	"encoding/json"

	"pandora-go-server/internal/types"
)

// ConsultaOperacionalRepository compoe fontes de pessoa e empresa para rotas isoladas.
//
// UseCases de pesquisa operacional chamam este adapter; ele nao registra rota nem decide permissao.
type ConsultaOperacionalRepository struct {
	pessoa  pessoaOperationalRepository
	empresa empresaOperationalRepository
}

type pessoaOperationalRepository interface {
	EnderecosPorCPF(context.Context, string) ([]map[string]any, error)
	SimplificadoEndereco(context.Context, string) ([]types.PessoaSimplificada, error)
	SimplificadoNome(context.Context, string) ([]types.PessoaSimplificada, error)
	VeiculosPorCPF(context.Context, string) ([]map[string]any, error)
	VeiculosPorNome(context.Context, string) ([]map[string]any, error)
	VeiculosPorChassi(context.Context, string) ([]map[string]any, error)
	VeiculosPorRenavam(context.Context, string) ([]map[string]any, error)
	VeiculosPorPlaca(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorCPF(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorNome(context.Context, string) ([]map[string]any, error)
	EmbarcacoesPorInscricao(context.Context, string) ([]map[string]any, error)
	AeronavesPorCPF(context.Context, string) ([]map[string]any, error)
	AeronavesPorNome(context.Context, string) ([]map[string]any, error)
	AeronavesPorMatricula(context.Context, string) ([]map[string]any, error)
	ObitosPorCPF(context.Context, string) ([]map[string]any, error)
	ObitosPorNome(context.Context, string) ([]map[string]any, error)
	BeneficiosPorCPF(context.Context, string) ([]map[string]any, error)
	TelefonesPorCPF(context.Context, string) ([]map[string]any, error)
	TelefonesPorNome(context.Context, string) ([]map[string]any, error)
	TelefonesPorTelefone(context.Context, string) ([]map[string]any, error)
	ListaOrcrins(context.Context) ([]map[string]any, error)
	OrcrinsPorNome(context.Context, string) ([]map[string]any, error)
}

type empresaOperationalRepository interface {
	LocalEnderecoCNPJ(context.Context, string) ([]map[string]any, error)
	CortexEnderecoCNPJ(context.Context, string) ([]map[string]any, error)
	SimplificadoEndereco(context.Context, string) ([]map[string]any, error)
	SimplificadoRazaoSocial(context.Context, string) ([]map[string]any, error)
	LocalVeiculoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalEmbarcacaoCNPJ(context.Context, string) ([]map[string]any, error)
	CortexEmbarcacaoCNPJ(context.Context, string) ([]map[string]any, error)
	LocalAeronaveCNPJ(context.Context, string) ([]map[string]any, error)
	LocalTelefoneCNPJ(context.Context, string) ([]map[string]any, error)
	TelefonesPorRazaoSocial(context.Context, string) ([]map[string]any, error)
	TelefonesPorTelefone(context.Context, string) ([]map[string]any, error)
}

func NewConsultaOperacionalRepository(pessoa pessoaOperationalRepository, empresa empresaOperationalRepository) ConsultaOperacionalRepository {
	return ConsultaOperacionalRepository{pessoa: pessoa, empresa: empresa}
}

func (r ConsultaOperacionalRepository) EnderecosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.EnderecosPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) EnderecosPorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	local, localErr := r.empresa.LocalEnderecoCNPJ(ctx, cnpj)
	cortex, _ := r.empresa.CortexEnderecoCNPJ(ctx, cnpj)
	return mergeRows(local, cortex), localErr
}

func (r ConsultaOperacionalRepository) EnderecosPorLogradouro(ctx context.Context, logradouro string) ([]map[string]any, error) {
	pessoas, errPessoa := r.pessoa.SimplificadoEndereco(ctx, logradouro)
	empresas, errEmpresa := r.empresa.SimplificadoEndereco(ctx, logradouro)
	return mergeRows(pessoasToMaps(pessoas, "pessoa"), tagRows(empresas, "empresa")), firstErr(errPessoa, errEmpresa)
}

func (r ConsultaOperacionalRepository) EnderecosPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	pessoas, err := r.pessoa.SimplificadoNome(ctx, nome)
	return pessoasToMaps(pessoas, "pessoa"), err
}

func (r ConsultaOperacionalRepository) EnderecosPorRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	rows, err := r.empresa.SimplificadoRazaoSocial(ctx, razaoSocial)
	return tagRows(rows, "empresa"), err
}

func (r ConsultaOperacionalRepository) VeiculosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.VeiculosPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) VeiculosPorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return r.empresa.LocalVeiculoCNPJ(ctx, cnpj)
}

func (r ConsultaOperacionalRepository) VeiculosPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return r.pessoa.VeiculosPorNome(ctx, nome)
}

func (r ConsultaOperacionalRepository) VeiculosPorChassi(ctx context.Context, chassi string) ([]map[string]any, error) {
	return r.pessoa.VeiculosPorChassi(ctx, chassi)
}

func (r ConsultaOperacionalRepository) VeiculosPorRenavam(ctx context.Context, renavam string) ([]map[string]any, error) {
	return r.pessoa.VeiculosPorRenavam(ctx, renavam)
}

func (r ConsultaOperacionalRepository) VeiculosPorPlaca(ctx context.Context, placa string) ([]map[string]any, error) {
	return r.pessoa.VeiculosPorPlaca(ctx, placa)
}

func (r ConsultaOperacionalRepository) EmbarcacoesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.EmbarcacoesPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) EmbarcacoesPorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	local, localErr := r.empresa.LocalEmbarcacaoCNPJ(ctx, cnpj)
	cortex, _ := r.empresa.CortexEmbarcacaoCNPJ(ctx, cnpj)
	return mergeRows(local, cortex), localErr
}

func (r ConsultaOperacionalRepository) EmbarcacoesPorNome(ctx context.Context, embarcacao string) ([]map[string]any, error) {
	return r.pessoa.EmbarcacoesPorNome(ctx, embarcacao)
}

func (r ConsultaOperacionalRepository) EmbarcacoesPorInscricao(ctx context.Context, inscricao string) ([]map[string]any, error) {
	return r.pessoa.EmbarcacoesPorInscricao(ctx, inscricao)
}

func (r ConsultaOperacionalRepository) AeronavesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.AeronavesPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) AeronavesPorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return r.empresa.LocalAeronaveCNPJ(ctx, cnpj)
}

func (r ConsultaOperacionalRepository) AeronavesPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return r.pessoa.AeronavesPorNome(ctx, nome)
}

func (r ConsultaOperacionalRepository) AeronavesPorMatricula(ctx context.Context, matricula string) ([]map[string]any, error) {
	return r.pessoa.AeronavesPorMatricula(ctx, matricula)
}

func (r ConsultaOperacionalRepository) ObitosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.ObitosPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) ObitosPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return r.pessoa.ObitosPorNome(ctx, nome)
}

func (r ConsultaOperacionalRepository) BeneficiosPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.BeneficiosPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) TelefonesPorCPF(ctx context.Context, cpf string) ([]map[string]any, error) {
	return r.pessoa.TelefonesPorCPF(ctx, cpf)
}

func (r ConsultaOperacionalRepository) TelefonesPorCNPJ(ctx context.Context, cnpj string) ([]map[string]any, error) {
	return r.empresa.LocalTelefoneCNPJ(ctx, cnpj)
}

func (r ConsultaOperacionalRepository) TelefonesPorNome(ctx context.Context, nome string) ([]map[string]any, error) {
	return r.pessoa.TelefonesPorNome(ctx, nome)
}

func (r ConsultaOperacionalRepository) TelefonesPorRazaoSocial(ctx context.Context, razaoSocial string) ([]map[string]any, error) {
	return r.empresa.TelefonesPorRazaoSocial(ctx, razaoSocial)
}

func (r ConsultaOperacionalRepository) TelefonesPorTelefone(ctx context.Context, telefone string) ([]map[string]any, error) {
	pessoas, errPessoa := r.pessoa.TelefonesPorTelefone(ctx, telefone)
	empresas, errEmpresa := r.empresa.TelefonesPorTelefone(ctx, telefone)
	return mergeRows(pessoas, empresas), firstErr(errPessoa, errEmpresa)
}

func (r ConsultaOperacionalRepository) ListaOrcrins(ctx context.Context) ([]map[string]any, error) {
	return r.pessoa.ListaOrcrins(ctx)
}

func (r ConsultaOperacionalRepository) OrcrinsPorNome(ctx context.Context, orcrim string) ([]map[string]any, error) {
	return r.pessoa.OrcrinsPorNome(ctx, orcrim)
}

func pessoasToMaps(rows []types.PessoaSimplificada, tipo string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		raw, _ := json.Marshal(row)
		item := map[string]any{}
		_ = json.Unmarshal(raw, &item)
		item["tipoResultado"] = tipo
		out = append(out, item)
	}
	return out
}

func tagRows(rows []map[string]any, tipo string) []map[string]any {
	out := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		item := map[string]any{}
		for key, value := range row {
			item[key] = value
		}
		item["tipoResultado"] = tipo
		out = append(out, item)
	}
	return out
}

func mergeRows(groups ...[]map[string]any) []map[string]any {
	out := []map[string]any{}
	for _, rows := range groups {
		out = append(out, rows...)
	}
	return out
}

func firstErr(errs ...error) error {
	for _, err := range errs {
		if err != nil {
			return err
		}
	}
	return nil
}
