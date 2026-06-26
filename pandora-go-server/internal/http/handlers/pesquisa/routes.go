package pesquisa

import (
	"net/http"

	pesquisauc "pandora-go-server/internal/usecases/pesquisa"
)

// Handler concentra as entradas HTTP da secao Pesquisa.
// Ele nao executa SQL; cada rota delega para o usecase especifico.
type Handler struct {
	pessoas    pesquisauc.PessoaUseCase
	empresa    pesquisauc.EmpresaUseCase
	endereco   pesquisauc.EnderecoUseCase
	veiculo    pesquisauc.VeiculoConsultaUseCase
	embarcacao pesquisauc.EmbarcacaoUseCase
	aeronave   pesquisauc.AeronaveUseCase
	obito      pesquisauc.ObitoUseCase
	beneficio  pesquisauc.BeneficioUseCase
	telefone   pesquisauc.TelefoneUseCase
	orcrim     pesquisauc.OrcrimUseCase
	pesquisa   pesquisauc.UseCases
	bcccs      pesquisauc.BCCCSUseCase
}

func NewHandler(pessoas pesquisauc.PessoaUseCase, empresa pesquisauc.EmpresaUseCase, endereco pesquisauc.EnderecoUseCase, veiculo pesquisauc.VeiculoConsultaUseCase, embarcacao pesquisauc.EmbarcacaoUseCase, aeronave pesquisauc.AeronaveUseCase, obito pesquisauc.ObitoUseCase, beneficio pesquisauc.BeneficioUseCase, telefone pesquisauc.TelefoneUseCase, orcrim pesquisauc.OrcrimUseCase, pesquisa pesquisauc.UseCases, bcccs pesquisauc.BCCCSUseCase) Handler {
	return Handler{pessoas: pessoas, empresa: empresa, endereco: endereco, veiculo: veiculo, embarcacao: embarcacao, aeronave: aeronave, obito: obito, beneficio: beneficio, telefone: telefone, orcrim: orcrim, pesquisa: pesquisa, bcccs: bcccs}
}

func (h Handler) Register(mux *http.ServeMux, protected func(http.Handler) http.Handler, admin func(http.Handler) http.Handler) {
	mux.Handle("GET /pessoas/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaSimplificadoCPF)))
	mux.Handle("GET /pessoas/simplificado/nome/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNome)))
	mux.Handle("GET /pessoas/simplificado/rg/{rg}", protected(http.HandlerFunc(h.pessoaSimplificadoRG)))
	mux.Handle("GET /pessoas/simplificado/cnh/{cnh}", protected(http.HandlerFunc(h.pessoaSimplificadoCNH)))
	mux.Handle("GET /pessoas/simplificado/titulo/{titulo}", protected(http.HandlerFunc(h.pessoaSimplificadoTitulo)))
	mux.Handle("GET /pessoas/simplificado/nomepai/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNomePai)))
	mux.Handle("GET /pessoas/simplificado/nomemae/{nome}", protected(http.HandlerFunc(h.pessoaSimplificadoNomeMae)))
	mux.Handle("GET /pessoas/simplificado/telefone/{telefone}", protected(http.HandlerFunc(h.pessoaSimplificadoTelefone)))
	mux.Handle("GET /pessoas/simplificado/email/{email}", protected(http.HandlerFunc(h.pessoaSimplificadoEmail)))
	mux.Handle("GET /pessoas/simplificado/endereco/{endereco}", protected(http.HandlerFunc(h.pessoaSimplificadoEndereco)))
	mux.Handle("GET /pessoas/integrado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaIntegradoCPF)))
	mux.Handle("GET /v1/pessoas/integrado/cpf/{cpf}", protected(http.HandlerFunc(h.pessoaIntegradoCPF)))
	mux.Handle("GET /pessoas/integrado/rg/{rg}", protected(http.HandlerFunc(h.pessoaIntegradoRG)))
	mux.Handle("GET /pessoas/integrado/nome/{nome}", protected(http.HandlerFunc(h.pessoaIntegradoNome)))
	mux.Handle("GET /antecedentes/rg/{rg}/{login}", protected(http.HandlerFunc(h.antecedentePDFRG)))

	mux.Handle("GET /empresas/simplificado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaSimplificadoCNPJ)))
	mux.Handle("GET /empresas/simplificado/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.empresaSimplificadoRazaoSocial)))
	mux.Handle("GET /empresas/simplificado/nomefantasia/{nomefantasia}", protected(http.HandlerFunc(h.empresaSimplificadoNomeFantasia)))
	mux.Handle("GET /empresas/simplificado/endereco/{endereco}", protected(http.HandlerFunc(h.empresaSimplificadoEndereco)))
	mux.Handle("GET /empresas/simplificado/telefone/{telefone}", protected(http.HandlerFunc(h.empresaSimplificadoTelefone)))
	mux.Handle("GET /empresas/simplificado/email/{email}", protected(http.HandlerFunc(h.empresaSimplificadoEmail)))
	mux.Handle("GET /empresas/simplificado/sociopf_cpf/{cpf}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPFCPF)))
	mux.Handle("GET /empresas/simplificado/sociopf_nome/{nome}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPFNome)))
	mux.Handle("GET /empresas/simplificado/sociopj_cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaSimplificadoSocioPJCNPJ)))
	mux.Handle("GET /empresas/detalhado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaDetalhadoCNPJ)))
	mux.Handle("GET /empresas/integrado/cnpj/{cnpj}", protected(http.HandlerFunc(h.empresaIntegradoCNPJ)))

	mux.Handle("GET /enderecos/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.enderecoCPF)))
	mux.Handle("GET /enderecos/simplificado/cnpj/{cnpj}", protected(http.HandlerFunc(h.enderecoCNPJ)))
	mux.Handle("GET /enderecos/simplificado/logradouro/{logradouro}", protected(http.HandlerFunc(h.enderecoLogradouro)))
	mux.Handle("GET /enderecos/simplificado/nome/{nome}", protected(http.HandlerFunc(h.enderecoNome)))
	mux.Handle("GET /enderecos/simplificado/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.enderecoRazaoSocial)))
	mux.Handle("GET /veiculos/detalhado/cpf/{cpf}", protected(http.HandlerFunc(h.veiculoCPF)))
	mux.Handle("GET /veiculos/detalhado/cnpj/{cnpj}", protected(http.HandlerFunc(h.veiculoCNPJ)))
	mux.Handle("GET /veiculos/detalhado/nome/{nome}", protected(http.HandlerFunc(h.veiculoNome)))
	mux.Handle("GET /veiculos/detalhado/chassi/{chassi}", protected(http.HandlerFunc(h.veiculoChassi)))
	mux.Handle("GET /veiculos/detalhado/renavam/{renavam}", protected(http.HandlerFunc(h.veiculoRenavam)))
	mux.Handle("GET /veiculos/detalhado/placa/{placa}", protected(http.HandlerFunc(h.veiculoPlaca)))
	mux.Handle("GET /embarcacoes/cpf/{cpf}", protected(http.HandlerFunc(h.embarcacaoCPF)))
	mux.Handle("GET /embarcacoes/cnpj/{cnpj}", protected(http.HandlerFunc(h.embarcacaoCNPJ)))
	mux.Handle("GET /embarcacoes/embarcacao/{embarcacao}", protected(http.HandlerFunc(h.embarcacaoNome)))
	mux.Handle("GET /embarcacoes/inscricao/{inscricao}", protected(http.HandlerFunc(h.embarcacaoInscricao)))
	mux.Handle("GET /aeronaves/cpf/{cpf}", protected(http.HandlerFunc(h.aeronaveCPF)))
	mux.Handle("GET /aeronaves/cnpj/{cnpj}", protected(http.HandlerFunc(h.aeronaveCNPJ)))
	mux.Handle("GET /aeronaves/nome/{nome}", protected(http.HandlerFunc(h.aeronaveNome)))
	mux.Handle("GET /aeronaves/matricula/{matricula}", protected(http.HandlerFunc(h.aeronaveMatricula)))
	mux.Handle("GET /obitos/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.obitoCPF)))
	mux.Handle("GET /obitos/simplificado/nome/{nome}", protected(http.HandlerFunc(h.obitoNome)))
	mux.Handle("POST /beneficios/cpf/{cpf}", protected(http.HandlerFunc(h.beneficioCPF)))
	mux.Handle("GET /telefones/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.telefoneCPF)))
	mux.Handle("GET /telefones/simplificado/cnpj/{cnpj}", protected(http.HandlerFunc(h.telefoneCNPJ)))
	mux.Handle("GET /telefones/simplificado/nome/{nome}", protected(http.HandlerFunc(h.telefoneNome)))
	mux.Handle("GET /telefones/simplificado/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.telefoneRazaoSocial)))
	mux.Handle("GET /telefones/simplificado/nomefantasia/{nomefantasia}", protected(http.HandlerFunc(h.telefoneRazaoSocial)))
	mux.Handle("GET /telefones/simplificado/telefone/{telefone}", protected(http.HandlerFunc(h.telefoneNumero)))
	mux.Handle("GET /telefones/simplificado/buscaprofunda/telefone/{telefone}", protected(http.HandlerFunc(h.telefoneNumero)))
	mux.Handle("GET /orcrins/", admin(http.HandlerFunc(h.orcrimLista)))
	mux.Handle("GET /orcrins/orcrim/{orcrim}", admin(http.HandlerFunc(h.orcrimNome)))

	mux.Handle("GET /gpu/cpf/{cpf}", protected(http.HandlerFunc(h.gpuCPF)))
	mux.Handle("GET /gpu/nome/{nome}", protected(http.HandlerFunc(h.gpuNome)))
	mux.Handle("GET /gpu/rg/{rg}", protected(http.HandlerFunc(h.gpuRG)))
	mux.Handle("GET /gpu/oab/{oab}", protected(http.HandlerFunc(h.gpuOAB)))
	mux.Handle("GET /gpu/detalhado/{cpf}", protected(http.HandlerFunc(h.gpuDetalhadoCPF)))
	mux.Handle("GET /gpu/advogado/consultar-atendimentos", protected(http.HandlerFunc(h.gpuAtendimentosAdvogado)))
	mux.Handle("GET /presos/simplificado/cpf/{cpf}", protected(http.HandlerFunc(h.presoSimplificadoCPF)))
	mux.Handle("GET /presos/simplificado/nome/{nome}", protected(http.HandlerFunc(h.presoSimplificadoNome)))
	mux.Handle("GET /presos/simplificado/vulgo/{vulgo}", protected(http.HandlerFunc(h.presoSimplificadoVulgo)))
	mux.Handle("GET /presos/simplificado/cnc/{cnc}", protected(http.HandlerFunc(h.presoSimplificadoCNC)))
	mux.Handle("GET /presos/simplificado/nomemae/{nomemae}", protected(http.HandlerFunc(h.presoSimplificadoNomeMae)))
	mux.Handle("GET /presos/detalhado/cpf/{cpf}", protected(http.HandlerFunc(h.presoDetalhadoCPF)))
	mux.Handle("GET /presos/detalhado/cnc/{cnc}", protected(http.HandlerFunc(h.presoDetalhadoCNC)))
	mux.Handle("GET /armas/simplificado/serie/{serie}", protected(http.HandlerFunc(h.armaSerie)))
	mux.Handle("GET /armas/simplificado/sinarm/{sinarm}", protected(http.HandlerFunc(h.armaSINARM)))
	mux.Handle("GET /utils/orgao", protected(http.HandlerFunc(h.orgaosPesquisa)))
	mux.Handle("GET /folhapagamento/municipal", protected(http.HandlerFunc(h.folhaMunicipal)))
	mux.Handle("GET /folhapagamento/estadual", protected(http.HandlerFunc(h.folhaEstadual)))
	mux.Handle("GET /imoveis/cpf/{cpf}", protected(http.HandlerFunc(h.imovelCPF)))
	mux.Handle("GET /imoveis/cnpj/{cnpj}", protected(http.HandlerFunc(h.imovelCNPJ)))
	mux.Handle("GET /investigados/cpf/{cpf}", protected(http.HandlerFunc(h.investigadoCPF)))
	mux.Handle("GET /investigados/cnpj/{cnpj}", protected(http.HandlerFunc(h.investigadoCNPJ)))
	mux.Handle("GET /investigados/nome/{nome}", protected(http.HandlerFunc(h.investigadoNome)))
	mux.Handle("GET /investigados/razaosocial/{razaosocial}", protected(http.HandlerFunc(h.investigadoRazaoSocial)))
	mux.Handle("GET /investigados/operacao/{operacao}", protected(http.HandlerFunc(h.investigadoOperacao)))
	mux.Handle("GET /investigados/alcunha/{alcunha}", protected(http.HandlerFunc(h.investigadoAlcunha)))
	mux.Handle("GET /prontuarios/cpf/{cpf}", protected(http.HandlerFunc(h.prontuarioCPF)))
	mux.Handle("GET /prontuarios/nome/{nome}", protected(http.HandlerFunc(h.prontuarioNome)))
	mux.Handle("GET /prontuarios/rg/{rg}", protected(http.HandlerFunc(h.prontuarioRG)))
	mux.Handle("GET /prontuarios/alcunha/{alcunha}", protected(http.HandlerFunc(h.prontuarioAlcunha)))
	mux.Handle("GET /fichasuja/cpf/{cpf}", protected(http.HandlerFunc(h.fichaSujaCPF)))
	mux.Handle("GET /fichasuja/rg/{rg}", protected(http.HandlerFunc(h.fichaSujaRG)))
	mux.Handle("GET /fichasuja/nome/{nome}", protected(http.HandlerFunc(h.fichaSujaNome)))
	mux.Handle("GET /fichasuja/nomemae/{nomemae}", protected(http.HandlerFunc(h.fichaSujaNomeMae)))
	mux.Handle("GET /fichasuja/titulo/{titulo}", protected(http.HandlerFunc(h.fichaSujaTitulo)))
	mux.Handle("GET /processo/processos/{processo}", protected(http.HandlerFunc(h.processoNumero)))
	mux.Handle("GET /processo/cpf/{cpf}", protected(http.HandlerFunc(h.processoCPF)))
	mux.Handle("GET /processo/cnpj/{cnpj}", protected(http.HandlerFunc(h.processoCNPJ)))

	mux.Handle("POST /bcccs/pix/cpf/{cpf}", protected(http.HandlerFunc(h.bcccsPixCPF)))
	mux.Handle("POST /bcccs/pix/cnpj/{cnpj}", protected(http.HandlerFunc(h.bcccsPixCNPJ)))
	mux.Handle("POST /bcccs/pix/chave/{chave}", protected(http.HandlerFunc(h.bcccsPixChave)))
}
