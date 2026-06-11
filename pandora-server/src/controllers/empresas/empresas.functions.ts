import * as empresaModel from './../../models/empresa';
import * as filialModel from './../../models/filial';
import * as enderecoModel from './../../models/endereco';
import * as telefoneModel from './../../models/telefone';
import * as socioModel from './../../models/socio';
import * as veiculoModel from './../../models/veiculo';
import * as aeronaveModel from './../../models/aeronave';
import * as tipologiaModel from './../../models/tipologia';
import * as empenhoModel from './../../models/empenho';
import * as rifModel from './../../models/rif';
import * as operacaoModel from './../../models/operacao';
import * as quadroSocietarioModel from './../../models/historico_quadro_societario';
import * as empregadorModel from './../../models/empregador';
import * as virtualModel from './../../models/virtual';
import * as contadorModel from './../../models/contador';
import * as crawlersModel from './../../models/crawler';
import * as eleitoralModel from '../../models/eleitoral';
import * as processoModel from '../../models/processo';
import * as dnaModel from '../../models/_apps/dna/index'
import * as embarcacaoModel from '../../models/embarcacao'
import * as imovelModel from '../../models/imovel'
import * as atividadeEconomicaModel from '../../models/atividade_economica';
import * as zoomModel from '../../models/zoom';

import {
  filtraNaoEncontrados,
  trataRequisicaNome,
  toTextSearch,
  registraNaoEncontrados,
  print,
  filtraLogradouro,
  limpaNumero,
} from './../../utils';
import { LOG_SECOES } from '../../config';


export let procuraEmpresaDetalhado = function (cnpj: string, cpfUsuario: string = '') {
  const _cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    empresaModel.getEmpresaDetalhadoCNPJ_BD_Receita(_cnpj),
    empresaModel.getEmpresaDetalhadoCNPJ_CORTEX(_cnpj, cpfUsuario),
    empresaModel.getEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica(_cnpj)
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
    .then(empresas => registraNaoEncontrados(empresas, LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME, LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES.CNPJ, _cnpj))
}

export let procuraEmpresaSimplificadoCNPJ = function (cnpj: string, cpfUsuario: string = '') {
  const _cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    empresaModel.getEmpresaSimplificadoCNPJ_BD_Receita(_cnpj),
    empresaModel.getEmpresaSimplificadoCNPJ_CORTEX(_cnpj, cpfUsuario),
    empresaModel.getEmpresaSimplificadoCNPJ_ReceitaNovo_PessoaJuridica(_cnpj),
    empresaModel.getEmpresaSimplificadoCNPJ_CREDILINK(_cnpj)
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
    .then(empresas => registraNaoEncontrados(empresas, LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME, LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES.CNPJ, _cnpj))
}

export let procuraEmpresaSimplificadoRazaoSocial = function (razaoSocial: string) {
  const razaoSocialTextSearch = toTextSearch(trataRequisicaNome(razaoSocial));

  return Promise.all([
    empresaModel.getEmpresaSimplificadoRazaoSocial_BD_Receita(razaoSocialTextSearch),
    empresaModel.getEmpresaSimplificadoRazaoSocial_ReceitaNovo_PessoaJuridica(razaoSocialTextSearch)
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaSimplificadoNomeFantasia = function (nomeFantasia: string) {
  const nomeFantasiaTextSearch = toTextSearch(trataRequisicaNome(nomeFantasia));

  return Promise.all([
    empresaModel.getEmpresaSimplificadoNomeFantasia_BD_Receita(nomeFantasiaTextSearch),
    empresaModel.getEmpresaSimplificadoNomeFantasia_ReceitaNovo_PessoaJuridica(nomeFantasiaTextSearch)
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaSimplificadoTelefone = function (telefone: string) {
  const _telefone = limpaNumero(telefone);

  return Promise.all([
    empresaModel.getEmpresaTelefone_Sispesquisa_Telefones(_telefone),
    empresaModel.getEmpresaSimplificadoTelefone_BD_Receita(_telefone),
    telefoneModel.getTelefonePorTelefone_CREDILINK(telefone)
  ])
    .then(pessoas => filtraNaoEncontrados(pessoas))
}

export let procuraEmpresaSimplificadoEmail = function (email: string) {

  return Promise.all([
    empresaModel.getEmpresaSimplificadoEmail_BD_Receita(email),
    empresaModel.getEmpresaEmail_Sispesquisa_Emails(email),
    virtualModel.getEmailPorEmail_CREDILINK(email)
  ])
    .then(pessoas => filtraNaoEncontrados(pessoas))
}

export let procuraEmpresaSimplificadoLogradouro = function (logradouro: string) {
  const logradouroTextSearch = toTextSearch(filtraLogradouro(logradouro));

  return Promise.all([
    empresaModel.getEmpresaSimplificadoLogradouro_ReceitaNovo_PessoaJuridica(logradouroTextSearch),
    empresaModel.getEmpresaSimplificadoLogradouro_BD_Receita(logradouroTextSearch),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaSimplificadoNomeSocioPF = function (nome: string) {
  const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

  return Promise.all([
    empresaModel.getEmpresaSimplificadoSocioPFNome_BD_Receita(nomeTextSearch),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaSimplificadoCPFSocioPF = function (cpf: string) {
  const _cpf = limpaNumero(cpf);

  return Promise.all([
    empresaModel.getEmpresaSimplificadoSocioPFCPF_BD_Receita(_cpf),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaSimplificadoCNPJSocioPJ = function (cnpj: string) {
  const _cnpj = limpaNumero(cnpj);

  return Promise.all([
    empresaModel.getEmpresaSimplificadoSocioPJCNPJ_BD_Receita(_cnpj),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
}

export let procuraEmpresaIntegradoCNPJ = function (cnpj: string, cpfUsuario: string = '') {
  cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    procuraEmpresaIntegradoCNPJ_Local(cnpj),
    procuraEmpresaIntegradoCNPJ_Externo(cnpj, true, cpfUsuario),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
    .then(empresas => registraNaoEncontrados(empresas, LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME, LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES.CNPJ, cnpj))
}

export let procuraEmpresaIntegradoCNPJ_Local = function (cnpj) {
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    empresaModel.getEmpresaDetalhadoCNPJ_ReceitaFull_PJ(cnpj),
    empresaModel.getEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica(cnpj),
    empresaModel.getEmpresaDetalhadoCNPJ_BD_Receita(cnpj),

    // ATIVIDADE ECONOMICA
    dnaModel.getAtividadeEconomicaCNPJ(cnpj),

    // FILIAIS
    filialModel.getFilialEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica(cnpj),

    // CONTADOR
    contadorModel.getContadorCNPJ_Receita_Full(cnpj),
    contadorModel.getContadorPJCNPJ_BD_Receita(cnpj),
    contadorModel.getContadorPFCNPJ_BD_Receita(cnpj),

    // TELEFONE
    telefoneModel.getTelefoneCNPJ_BD_Receita(cnpj),
    telefoneModel.getTelefoneCNPJ_BD_Receita_Socio(cnpj),
    telefoneModel.getTelefoneCNPJ_ReceitaFull_PJ(cnpj),
    telefoneModel.getTelefoneCNPJ_Sispesquisa_Telefones(cnpj),
    telefoneModel.getTelefoneCNPJ_CAGEPA(cnpj),

    // ENDERECO
    enderecoModel.getEnderecoCNPJ_BD_Receita(cnpj),
    enderecoModel.getEnderecoCNPJ_ReceitaFull_PJ(cnpj),
    enderecoModel.getEnderecoCNPJ_ReceitaNovo_PessoaJuridica(cnpj),
    enderecoModel.getEnderecoCNPJ_Sispesquisa_VeiculosNovo(cnpj),
    enderecoModel.getEnderecoCNPJ_Sispesquisa_Enderecos(cnpj),
    enderecoModel.getEnderecoCNPJ_BD_CAGEPA(cnpj),

    // EMPENHO
    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCNPJ_BD_SAGRES_SM(cnpj),
    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCNPJ_BD_SAGRES_SE(cnpj),

    // EMBARCAÇÃO
    embarcacaoModel.getEmbarcacaoCNPJ_BD_Embarcacao_RE(cnpj),
    embarcacaoModel.getEmbarcacaoDetalhadoCNPJ_BD_Embarcacao_Embarcacao(cnpj),

    // VEICULO
    veiculoModel.getVeiculoDetalhadoCNPJ_Sispesquisa_VeiculosNovo(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_Renavam_2020(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_IPVA(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_BD_Detran(cnpj),

    // AERONAVE
    aeronaveModel.getAeronaveDetalhadoCNPJ_BD_RAB(cnpj),

    // HISTORICO QUADRO SOCIETARIO
    quadroSocietarioModel.getHistoricoQuadroPFDetalhadoCNPJ_CNE(cnpj),
    quadroSocietarioModel.getHistoricoQuadroPJDetalhadoCNPJ_CNE(cnpj),

    quadroSocietarioModel.getHistoricoQuadroPFDetalhadoCNPJ_BD_Receita(cnpj),
    quadroSocietarioModel.getHistoricoQuadroPJDetalhadoCNPJ_BD_Receita(cnpj),

    //EMPREGADOR ()
    empregadorModel.getEstatisticasEmpregadoresCNPJ_RAIS(cnpj),

    // TIPOLOGIA
    tipologiaModel.getTipologiaSimplificadoCNPJ_Tipologias(cnpj),
    tipologiaModel.getTipologiasPJSimplificadoTCEFinger_Tipologias(cnpj),
    tipologiaModel.getTipologiasLicitacoesPJTCEFinger_Tipologias(cnpj),

    // RIF
    rifModel.existeRIFCNPJ_Sispesquisa_RIF(cnpj),

    // OPERACOES
    operacaoModel.getInvestigadosOperacoesCNPJ_BD_GAECO(cnpj),

    // VIRTUAL
    virtualModel.getEmailCNPJ_BD_Receita_PJ(cnpj),
    virtualModel.getEmailCNPJ_SispesquisaEmail(cnpj),
    virtualModel.getEmailCNPJ_BD_Receita_Socio(cnpj),
    virtualModel.getEmailCNPJ_CAGEPA(cnpj),

    // PROCESSO
    processoModel.getCondenacaoCEISCNPJ(cnpj),
    processoModel.getProcessoPGFNDividaAtivaCNPJ(cnpj),

    // Imoveis
    imovelModel.getImovelCNPJAdquirente_BD_DOI(cnpj),
    imovelModel.getImovelCNPJAlienante_BD_DOI(cnpj),
    imovelModel.getMovelDetalhadoCNPJ_BD_ITBI(cnpj),

    // ELEITORAL
    eleitoralModel.getDoacoesFeitasSimplificadoCNPJ_Eleitoral(cnpj),
    eleitoralModel.getCandidatosFornecedoresSimplificadoFornecedorCNPJ_Eleitoral(cnpj),

    // ZOOM
    zoomModel.getDadosGrafoPJ_ZOOM(cnpj)
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
    .then(empresas => registraNaoEncontrados(empresas, LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME, LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES.CNPJ, cnpj))
}

export let procuraEmpresaIntegradoCNPJ_Externo = function (cnpj, useCrawlers = true, cpfUsuario: string = '') {
  cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([

    // EMPRESA
    empresaModel.getEmpresaDetalhadoCNPJ_CORTEX(cnpj, cpfUsuario),
    empresaModel.getEmpresaDetalhadoCNPJ_CREDILINK(cnpj),

    // TELEFONE
    telefoneModel.getTelefoneCNPJ_CORTEX(cnpj, cpfUsuario),
    telefoneModel.getTelefoneCNPJ_CREDILINK(cnpj),

    // EMAIL
    virtualModel.getEmailCNPJ_CREDILINK(cnpj),

    // ENDERECO
    enderecoModel.getEnderecoCNPJ_CORTEX(cnpj, cpfUsuario),
    enderecoModel.getEnderecoCNPJ_CREDILINK(cnpj),

    //EMBARCACAO
    embarcacaoModel.getEmbarcacaoCNPJ_CORTEX(cnpj, cpfUsuario),

    // VEICULO
    veiculoModel.getVeiculoDetalhadoProprietarioCNPJ_CORTEX(cnpj, cpfUsuario),

    // PROCESSO
    processoModel.getTransparenciaAcordoLenienciaCNPJ(cnpj),
    processoModel.getTransparenciaCNEP_CNPJ(cnpj),
    processoModel.getTransparenciaCEPIM_CNPJ(cnpj),
    processoModel.getTransparenciaCEIS_CNPJ(cnpj),

    processoModel.getAcordaoCNPJ_WebserviceTCU(cnpj),
    processoModel.getProcessoCNPJ_WebserviceTCU(cnpj),
    processoModel.getCondenacaoCNPJ_WebserviceTCU(cnpj),

    socioModel.getSocioPFCNPJ_CORTEX(cnpj, cpfUsuario),
    contadorModel.getContadorCNPJ_CORTEX(cnpj, cpfUsuario),
    atividadeEconomicaModel.getAtividadesEconomicasCNPJ_Cortex(cnpj, cpfUsuario),

    // CRAWLERS
    ...(useCrawlers && [
      // crawlersModel.getTransparenciaCrawlerCNPJ(cnpj),

      crawlersModel.getJusBrasilCNPJ_PandoraCrawlers(cnpj),
      crawlersModel.getDOPBCNPJ_PandoraCrawlers(cnpj),

      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj),
      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj, 'jus.br'),
      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj, 'mp.br'),
      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj, 'edu.br'),
      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj, 'gov.br'),
      crawlersModel.getRegistrosMotoresBuscaCNPJ_PandoraCrawlers(cnpj, 'mil.br'),
    ]),
  ])
    .then(empresas => filtraNaoEncontrados(empresas))
    .then(empresas => registraNaoEncontrados(empresas, LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME, LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES.CNPJ, cnpj))
}
