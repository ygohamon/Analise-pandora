import * as pessoaModel from './../../models/pessoa';
import * as enderecoModel from './../../models/endereco';
import * as empresaModel from './../../models/empresa';
import * as veiculoModel from './../../models/veiculo';
import * as aeronaveModel from './../../models/aeronave';
import * as servidorModel from './../../models/servidor';
import * as mandadoModel from './../../models/mandado';
import * as telefoneModel from './../../models/telefone';
import * as presoModel from './../../models/preso';
import * as fotoModel from './../../models/foto';
import * as obitoModel from './../../models/obito';
import * as tipologiaModel from './../../models/tipologia';
import * as empenhoModel from './../../models/empenho';
import * as rifModel from './../../models/rif';
import * as operacaoModel from './../../models/operacao';
import * as beneficioModel from './../../models/beneficios';
import * as empregadorModel from './../../models/empregador';
import * as quadroSocietarioModel from './../../models/historico_quadro_societario';
import * as crawlersModel from './../../models/crawler';
import * as conselhoModel from './../../models/conselho';
import * as filiacaoModel from './../../models/filiacao';
import * as virtualModel from './../../models/virtual';
import * as processoModel from './../../models/processo';
import * as relacionamentoModel from './../../models/relacionamentos';
import * as vizinhoModel from '../../models/vizinho';
import * as boletimOcorrenciaModel from '../../models/boletim_ocorrencia';
import * as eleitoralModel from '../../models/eleitoral';
import * as embarcacaoModel from '../../models/embarcacao';
import * as prontuarioModel from '../../models/prontuario';
import * as amadorModel from '../../models/amador';
import * as saspModel from '../../models/sasp';
import * as imovelModel from '../../models/imovel';
import * as alertasModel from '../../models/alertas';
import * as zoomModel from '../../models/zoom';
import * as fichaSujaModel from '../../models/ficha_suja';
import * as pepModel from '../../models/pep';

import {
  trataRequisicaNome,
  toTextSearch,
  agrupaEFiltraDuplicados,
  filtraNaoEncontrados,
  desagrupa,
  print,
  flat,
  registraNaoEncontrados,
  filtraLogradouro,
  limpaNumero,
  filtraNulos,
} from './../../utils';

import { API_CODES, LOG_SECOES } from './../../config';
import { logger } from '../../services/log.service';

export let procuraPessoaDetalhadoCPF = function(cpf: string, cpfUsuario: string) {
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    pessoaModel.getPessoaDetalhadoCPF_IPC(cpf),
    pessoaModel.getPessoaDetalhadoCPF_CORTEX(cpf, cpfUsuario),
    pessoaModel.getPessoaDetalhadoCPF_BD_Receita(cpf),
    pessoaModel.getPessoaDetalhadoCPF_ReceitaNovo_PessoaFisica(cpf),
    pessoaModel.getPessoaSimplificadoCPF_LINCE(cpf)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.CPF, cpf));
};

export let procuraPessoaDetalhadoRG = function(rg) {
  rg = limpaNumero(rg);

  return Promise.all([
    pessoaModel.getPessoaDetalhadoRG_IPC(rg),
    pessoaModel.getPessoaSimplificadoRG_LINCE(rg),
    pessoaModel.getPessoaDetalhadoRG_BD_Detran(rg),
    pessoaModel.getPessoaDetalhadoRG_Sispesquisa_CNH(rg),
    presoModel.getPresoDetalhadoRG_SDS_Prisional(rg),
    presoModel.getPresoDetalhadoRG_SISDEPEN(rg)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.RG, rg));
};

export let procuraPessoaSimplificadoCPF = function(cpf: string, cpfUsuario: string) {
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    pessoaModel.getPessoaSimplificadoCPF_BD_Receita(cpf),
    pessoaModel.getPessoaSimplificadoCPF_ReceitaNovo_PessoaFisica(cpf),
    pessoaModel.getPessoaSimplificadoCPF_IPC(cpf),
    pessoaModel.getPessoaSimplificadoCPF_CORTEX(cpf, cpfUsuario),
    pessoaModel.getPessoaSimplificadoCPF_LINCE(cpf)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.CPF, cpf));
};

export let procuraPessoaSimplificadoCNH = function(cnh) {
  cnh = limpaNumero(cnh);

  return Promise.all([
    pessoaModel.getPessoaSimplificadoCNH_Sispesquisa_CNH(cnh),
    pessoaModel.getPessoaSimplificadoCNH_BD_Detran(cnh),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoTitulo = function(titulo) {
  titulo = limpaNumero(titulo);

  return Promise.all([
    pessoaModel.getPessoaSimplificadoTitulo_TSE_Eleitor(titulo),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoRG = function(rg) {
  rg = limpaNumero(rg);

  return Promise.all([
    pessoaModel.getPessoaSimplificadoRG_BD_Detran(rg),
    pessoaModel.getPessoaSimplificadoRG_Sispesquisa_CNH(rg),
    pessoaModel.getPessoaSimplificadoRG_IPC(rg),
    pessoaModel.getPessoaDetalhadoRG_VEP(rg),
    pessoaModel.getPessoaSimplificadoRG_LINCE(rg),
    presoModel.getPresoSimplificadoRG_SDS_Prisional(rg),
    presoModel.getPresoSimplificadoRG_SISDEPEN(rg)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoNome = function(nome) {
  const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

  return Promise.all([
    pessoaModel.getPessoaSimplificadoNome_BD_Receita(nomeTextSearch),
    pessoaModel.getPessoaSimplificadoNome_TSE_Eleitor(nomeTextSearch),
    pessoaModel.getPessoaSimplificadoNome_IPC(nome),
    pessoaModel.getPessoaSimplificadoCPF_LINCE(nome)

  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoNomePai = function(nomePai) {
  const nomePaiTextSearch = toTextSearch(trataRequisicaNome(nomePai));

  return Promise.all([
    pessoaModel.getPessoaSimplificadoNomePai_IPC(nomePai),
    pessoaModel.getPessoaSimplificadoNomePai_Sispesquisa_CNH(nomePaiTextSearch),
    pessoaModel.getPessoaSimplificadoNomePai_BD_Detran(nomePaiTextSearch),
    pessoaModel.getPessoaSimplificadoNomePai_TSE_Eleitor(nomePaiTextSearch),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoNomeMae = function(nomeMae) {
  const nomeMaeTextSearch = toTextSearch(trataRequisicaNome(nomeMae));

  return Promise.all([
    pessoaModel.getPessoaSimplificadoNomeMae_IPC(nomeMae),
    pessoaModel.getPessoaSimplificadoNomeMae_BD_Receita(nomeMaeTextSearch),
    pessoaModel.getPessoaSimplificadoNomeMae_TSE_Eleitor(nomeMaeTextSearch),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoEndereco = function(endereco) {
  const enderecoTextSearch = toTextSearch(filtraLogradouro(endereco));

  return Promise.all([
    pessoaModel.getPessoaSimplificadoLogradouro_BD_Receita(enderecoTextSearch),
    pessoaModel.getPessoaSimplificadoLogradouro_ReceitaNovo_PessoaFisica(enderecoTextSearch),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoTelefone = function(telefone) {
  telefone = limpaNumero(telefone);

  return Promise.all([
    pessoaModel.getPessoaSimplificadoTelefone_BD_Receita(telefone),
    pessoaModel.getPessoaTelefone_Sispesquisa_Telefones(telefone),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaSimplificadoEmail = function(email) {
  return Promise.all([
    pessoaModel.getPessoaEmail_Sispesquisa_Emails(email)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraVizinhosPessoaCPF = function(cpf) {
  cpf = limpaNumero(cpf);

  return Promise.all([
    vizinhoModel.getVizinhosReceitaNovoCPF(cpf),
    vizinhoModel.getVizinhosCPF_BD_Receita(cpf),
    vizinhoModel.getVizinhosCPF_Energisa(cpf),
  ])
    .then(pessoas => filtraNaoEncontrados(pessoas));
};

export let procuraPessoaQualificacaoPF = function(cpf) {
  cpf = limpaNumero(cpf);

  return Promise.all([
    // PESSOA
    pessoaModel.getPessoaDetalhadoCPF_IPC(cpf),
    pessoaModel.getPessoaDetalhadoCPF_BD_Receita(cpf),
    pessoaModel.getPessoaDetalhadoCPF_ReceitaFull_PF(cpf),
    pessoaModel.getPessoaDetalhadoCPF_ReceitaNovo_PessoaFisica(cpf),
    pessoaModel.getPessoaDetalhadoCPF_TSE_Eleitor(cpf),

    // ENDERECO
    enderecoModel.getEnderecoCPF_Sispesquisa_Enderecos(cpf),
    enderecoModel.getEnderecoCPF_IPC(cpf),
    enderecoModel.getEnderecoCPF_ReceitaNovo_PessoaFisica(cpf),
    enderecoModel.getEnderecoCPF_BD_Receita(cpf),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
};

export let procuraPessoaQualificacaoPF_RG = function(rg) {
  rg = limpaNumero(rg);

  return Promise.all([
    // PESSOA
    pessoaModel.getPessoaDetalhadoRG_IPC(rg),
    pessoaModel.getPessoaDetalhadoRG_BD_Detran(rg),
    pessoaModel.getPessoaDetalhadoRG_Sispesquisa_CNH(rg),
    pessoaModel.getPessoaDetalhadoRG_VEP(rg),
    pessoaModel.getPessoaSimplificadoRG_LINCE(rg),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
};

export let procuraPessoaIntegradoNome = function(nome){
  return Promise.all([
    procuraPessoaIntegradoNome_Local(nome),
    procuraPessoaIntegradoNome_Externo(nome),
  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.NOME, nome));
};

export let procuraPessoaIntegradoNome_Local = function(nome) {

  return Promise.all([

        //Pessoa
        pessoaModel.getPessoaSimplificadoNome_BD_Detran(nome),
        pessoaModel.getPessoaSimplificadoNome_BD_Receita(nome),
        pessoaModel.getPessoaSimplificadoNome_ReceitaFull_PF(nome),
        pessoaModel.getPessoaSimplificadoNome_TREPB_Eleitor(nome),
        pessoaModel.getPessoaSimplificadoNome_TSE_Eleitor(nome),
        pessoaModel.getPessoaSimplificadoNome_Sispesquisa_CNH(nome),
        pessoaModel.getPessoaSimplificadoNome_ReceitaNovo_PessoaFisica(nome),
        pessoaModel.getPessoaSimplificadoNome_IPC(nome),
        pessoaModel.getPessoaSimplificadoNome_LINCE(nome),

        //SASP
        saspModel.getInvestigadosPessoaNome(nome),
        saspModel.getInvestigadosFatosNome(nome),
        saspModel.getInvestigadosAbordagensNome(nome),
        saspModel.getInvestigadosOcorrenciaNome(nome),
        //TELEFONE
        telefoneModel.getTelefoneNome_BD_Receita(nome),
        telefoneModel.getTelefoneNome_ReceitaFull_PF(nome),
        telefoneModel.getTelefoneNome_Sispesquisa_Telefones(nome),
  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.NOME, nome));

}

export let procuraPessoaIntegradoNome_Externo = function(nome, useCrawlers = true) {

  return Promise.all([

    //PRONTUARIO
    prontuarioModel.getProntuarioNome_LINCE(nome),

    // CRAWLERS
    ...(useCrawlers && [
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome),
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome, 'jus.br'),
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome, 'mp.br'),
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome, 'edu.br'),
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome, 'gov.br'),
        crawlersModel.getRegistrosMotoresBuscaNome_PandoraCrawlers(nome, 'mil.br'),

        crawlersModel.getDOPBNome_PandoraCrawlers(nome),
        crawlersModel.getJusBrasilNome_PandoraCrawlers(nome),

        crawlersModel.getFacebookNome_PandoraCrawlers(nome),
        crawlersModel.getInstagramNome_PandoraCrawlers(nome),
        crawlersModel.getLinkedinNome_PandoraCrawlers(nome),
        crawlersModel.getTransparenciaCrawlerNome(nome)
    ]),
  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.NOME, nome));

}

export let procuraPessoaIntegradoRG = function(rg){
  return Promise.all([
    procuraPessoaIntegradoRG_Local(rg),
    procuraPessoaIntegradoRG_Externo(rg),
  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.RG, rg));
};

export let procuraPessoaIntegradoRG_Local = function(rg) {

  return Promise.all([

        //Pessoa
        pessoaModel.getPessoaDetalhadoRG_VEP(rg),

        pessoaModel.getPessoaSimplificadoRG_LINCE(rg),

        //ENDERECO
        enderecoModel.getEnderecoRG_VEP(rg),

        //TELEFONE
        telefoneModel.getTelefoneRG_VEP(rg),

        // SASP
        saspModel.getInvestigadosPessoaRG(rg),
        saspModel.getInvestigadosFatosRG(rg),
        saspModel.getInvestigadosAbordagensRG(rg),
        saspModel.getInvestigadosOcorrenciaRG(rg),
        // CONSELHO
        // ADVOGADO
        conselhoModel.getAdvogadoDetalhadoRG_VEP(rg),

        // VIRTUAL
        virtualModel.getEmailRG_VEP(rg),

        // PROCESSO
        processoModel.getPenaProcessoRG_VEP(rg),
        processoModel.getProcessoRG_VEP(rg),

  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.RG, rg));

}

export let procuraPessoaIntegradoRG_Externo = function(rg, useCrawlers = true) {

  return Promise.all([

    //PESSOA
    pessoaModel.getPessoaDetalhadoRG_IPC(rg),

    //ENDERECO
    enderecoModel.getEnderecoRG_IPC(rg),

    //PRONTUARIO
    prontuarioModel.getProntuarioRG_LINCE(rg),

    // CRAWLERS
    ...(useCrawlers && [
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg),
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg, 'jus.br'),
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg, 'mp.br'),
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg, 'edu.br'),
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg, 'gov.br'),
        crawlersModel.getRegistrosMotoresBuscaRG_PandoraCrawlers(rg, 'mil.br'),

        crawlersModel.getDOPBRG_PandoraCrawlers(rg),
        crawlersModel.getJusBrasilRG_PandoraCrawlers(rg),

        crawlersModel.getFacebookRG_PandoraCrawlers(rg),
        crawlersModel.getInstagramRG_PandoraCrawlers(rg),
        crawlersModel.getLinkedinRG_PandoraCrawlers(rg),
        crawlersModel.getTransparenciaCrawlerRG(rg)
    ]),
  ])
  .then(pessoas => filtraNulos(pessoas))
  .then(pessoas => filtraNaoEncontrados(pessoas))
  .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.RG, rg));

}

export let procuraPessoaIntegradoCPF = function(cpf: string, cpfUsuario: string = '') {
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    procuraPessoaIntegradoCPF_Local(cpf),
    procuraPessoaIntegradoCPF_Externo(cpf, true, cpfUsuario),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.CPF, cpf));
};

export let procuraPessoaIntegradoCPF_Local = function(cpf) {
  cpf = limpaNumero(cpf);

  return Promise.all([
    // PESSOA
    pessoaModel.getPessoaDetalhadoCPF_BD_Receita(cpf),
    pessoaModel.getPessoaDetalhadoCPF_ReceitaFull_PF(cpf),
    pessoaModel.getPessoaDetalhadoCPF_ReceitaNovo_PessoaFisica(cpf),
    pessoaModel.getPessoaDetalhadoCPF_Sispesquisa_CNH(cpf),
    pessoaModel.getPessoaDetalhadoCPF_BD_Detran(cpf),
    pessoaModel.getPessoaDetalhadoCPF_TSE_Eleitor(cpf),
    pessoaModel.getPessoaDetalhadoCPF_TREPB_Eleitor(cpf),
    pessoaModel.getPessoaDetalhadoCPF_Renach_2016_08(cpf),
    pessoaModel.getPessoaDetalhadoCPF_VEP(cpf),

    // PARENTESCOS
    relacionamentoModel.getParentescosCPF(cpf),

    // FOTO
    fotoModel.getFotoCPF_SISDEPEN(cpf),
    fotoModel.getFotoCPF_BDImagens(cpf),

    // VIZINHOS
    vizinhoModel.getVizinhosCPF_BD_Receita(cpf),
    vizinhoModel.getVizinhosCPF_Energisa(cpf),

    // ENDERECO
    enderecoModel.getEnderecoCPF_Sispesquisa_Enderecos(cpf),
    enderecoModel.getEnderecoCPF_ReceitaNovo_PessoaFisica(cpf),
    enderecoModel.getEnderecoCPF_ReceitaFull_PF(cpf),
    enderecoModel.getEnderecoCPF_BD_Receita(cpf),
    enderecoModel.getEnderecoCPF_Sispesquisa_VeiculosNovo(cpf),
    enderecoModel.getEnderecoCPF_IPVA(cpf),
    enderecoModel.getEnderecoCPF_Renach_2016_08(cpf),
    enderecoModel.getEnderecoCPF_VEP(cpf),
    enderecoModel.getEnderecoCPF_BD_CAGEPA(cpf),

    // TELEFONE
    telefoneModel.getTelefoneCPF_ReceitaFull_PF(cpf),
    telefoneModel.getTelefoneCPF_BD_Receita_PF(cpf),
    telefoneModel.getTelefoneCPF_BD_Receita_Socio(cpf),
    telefoneModel.getTelefoneCPF_Sispesquisa_Telefones(cpf),
    telefoneModel.getTelefoneCPF_VEP(cpf),
    telefoneModel.getTelefoneCPF_CAGEPA(cpf),

    // EMPRESAS QUE É RESPONSÁVEL
    empresaModel.getEmpresaSimplificadoCPFResponsavel_ReceitaNovo(cpf),
    empresaModel.getEmpresaSimplificadoCPFResponsavel_ReceitaFull(cpf),
    empresaModel.getEmpresaSimplificadoCPFResponsavel_BD_Receita(cpf),

    // EMPRESAS QUE É CONTADOR
    empresaModel.getEmpresaSimplificadoContadorPF_BD_Receita(cpf),

    // VEICULO
    veiculoModel.getVeiculoDetalhadoCPF_Sispesquisa_VeiculosNovo(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_Renavam_2020(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_IPVA(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_BD_Detran(cpf),

    // EMBARCAÇÃO
    embarcacaoModel.getEmbarcacaoCPF_BD_Embarcacao_RE(cpf),
    embarcacaoModel.getEmbarcacaoDetalhadoCPF_BD_Embarcacao_Embarcacao(cpf),

    // AERONAVE
    aeronaveModel.getAeronaveDetalhadoCPF_BD_RAB(cpf),

    // SERVIDOR
    // servidorModel.getServidorFederalCPF_Sispesquisa_Servidores_Federais(cpf),
    servidorModel.getServidorFederalCPF_Sispesquisa_Servidores_Federais_Nordeste(cpf),

    servidorModel.getServidorEstadualSimplificadoCPF_BD_Sagres(cpf),
    servidorModel.getServidorMunicipalSimplificadoCPF_BD_Sagres(cpf),

    // EMPENHO
    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCPF_BD_SAGRES_SE(cpf),
    empenhoModel.getEmpenhoPagoAnualizadoSimplificadoCPF_BD_SAGRES_SM(cpf),

    // PRESO
    presoModel.getPresoDetalhadoCPF_Sispesquisa_Prisional(cpf),
    presoModel.getPresoDetalhadoCPF_SDS_Prisional(cpf),
    presoModel.getPresoDetalhadoCPF_SISDEPEN(cpf),

    // FILIACAO
    filiacaoModel.getFiliacaoPartidariaDetalhadoCPF_Filiados(cpf),

    // CONSELHO
    // ADVOGADO
    conselhoModel.getAdvogadoDetalhadoCPF_VEP(cpf),

    // OBITO
    obitoModel.getObitoDetalhadoCPF_BD_SISOBI(cpf),

    // TIPOLOGIA
    tipologiaModel.getTipologiaSimplificadoCPF_Tipologias(cpf),
    tipologiaModel.getTipologiasPFSimplificadoTCEFinger_Tipologias(cpf),
    tipologiaModel.getTipologiasLicitacoesPFTCEFinger_Tipologias(cpf),

    // RIF
    rifModel.existeRIFCPF_Sispesquisa_RIF(cpf),

    // EMPREGADOR
    empregadorModel.getEmpregadoresDetalhadoCPF_RAIS(cpf),

    // BENEFICIO
    beneficioModel.getBolsaFamiliaCPF_BolsaFamilia(cpf),
    beneficioModel.getCartaoAlimentacaoPBCPF(cpf),

    // HISTORICO QUADRO SOCIETARIO
    quadroSocietarioModel.getHistoricoQuadroPFDetalhadoCPF_CNE(cpf),
    quadroSocietarioModel.getHistoricoQuadroPFDetalhadoCPF_BD_Receita(cpf),

    // OPERACOES
    operacaoModel.getInvestigadosOperacoesCPF_BD_GAECO(cpf),

    // VIRTUAL
    virtualModel.getEmailCPF_VEP(cpf),
    virtualModel.getEmailCPF_SispesquisaEmail(cpf),
    virtualModel.getEmailCPF_BD_Receita_Socio(cpf),
    virtualModel.getEmailCPF_CAGEPA(cpf),

    // PROCESSO
    processoModel.getPenaProcessoCPF_VEP(cpf),
    processoModel.getProcessoCPF_VEP(cpf),
    processoModel.getCondenacaoTREPBCPF(cpf),
    processoModel.getCondenacaoTRF5CPF(cpf),
    processoModel.getCondenacaoCEISCPF(cpf),
    processoModel.getProcessoContasIrregularesCPF(cpf),
    processoModel.getProcessoCadiconCPF(cpf),
    processoModel.getProcessoPGFNDividaAtivaCPF(cpf),

    // ELEITORAL
    eleitoralModel.getCandidatoCPF(cpf),
    eleitoralModel.getBensCandidatoCPF(cpf),
    eleitoralModel.getDoacoesFeitasSimplificadoCPF_Eleitoral(cpf),
    eleitoralModel.getDoacoesRecebidasSimplificadoCPF_Eleitoral(cpf),
    eleitoralModel.getGastosCandidatosSimplificadoCPF_Eleitoral(cpf),
    eleitoralModel.getCandidatosFornecedoresSimplificadoFornecedorCPF_Eleitoral(cpf),

    // IMOVEL
    imovelModel.getImovelCPFAlienante_BD_DOI(cpf),
    imovelModel.getImovelCPFAdquirente_BD_DOI(cpf),
    imovelModel.getMovelDetalhadoCPF_BD_ITBI(cpf),

    // SASP
    saspModel.getInvestigadosPessoaCPF(cpf),
    saspModel.getInvestigadosFatosCPF(cpf),
    saspModel.getInvestigadosAbordagensCPF(cpf),
    saspModel.getInvestigadosOcorrenciaCPF(cpf),

    // ALERTAS
    alertasModel.getAlertaMembroOrganizacaoCriminosaCPF_BD_ORCRIM(cpf),
    alertasModel.getAlertaPessoaExpostaPoliticamenteCPF_BD_PEP(cpf),
    alertasModel.getAlertaPessoaFichaSujaCPF_BD_FICHA_SUJA(cpf),

    // ZOOM
    zoomModel.getDadosGrafoPF_ZOOM(cpf),

    // FICHA SUJA
    fichaSujaModel.getPessoaFichaSujaCPF_BD_Ficha_Suja(cpf),

    // PESSOA EXPPOSTA POLITICAMENTE
    pepModel.getPessoaExpostaPoliticamenteCPF_BD_PEP(cpf)
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => registraNaoEncontrados(pessoas, LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME, LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES.CPF, cpf));
};

export let procuraPessoaIntegradoCPF_Externo = function(cpf, useCrawlers = true, cpfUsuario: string) {
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    // PESSOA
    pessoaModel.getPessoaDetalhadoCPF_IPC(cpf),
    pessoaModel.getPessoaDetalhadoCPF_CORTEX(cpf, cpfUsuario),
    pessoaModel.getPessoaDetalhadoCPF_CREDILINK(cpf),

    // FOTO
    fotoModel.getFotoCPF_IPC(cpf),

    // ENDERECO
    enderecoModel.getEnderecoCPF_IPC(cpf),
    enderecoModel.getEnderecoCPF_CORTEX(cpf, cpfUsuario),
    enderecoModel.getEnderecoCPF_CREDILINK_PF(cpf),

    // EMPRESAS QUE É RESPONSÁVEL
    empresaModel.getEmpresaSimplificadoCPFResponsavel_CORTEX(cpf, cpfUsuario),

    // EMPRESAS QUE É CONTADOR
    empresaModel.getEmpresaSimplificadoCPFContador_CORTEX(cpf, cpfUsuario),

    // HISTORICO QUADRO SOCIETARIO
    quadroSocietarioModel.getHistoricoQuadroPFDetalhadoCPF_CORTEX(cpf, cpfUsuario),

    // VEICULO
    veiculoModel.getVeiculoDetalhadoProprietarioCPF_CORTEX(cpf, cpfUsuario),

    // EMBARCAÇÃO
    embarcacaoModel.getEmbarcacaoCPF_CORTEX(cpf, cpfUsuario),

    // TELEFONE
    telefoneModel.getTelefoneSimplificadoCPF_IPC(cpf),
    telefoneModel.getTelefoneCPF_CORTEX(cpf, cpfUsuario),
    telefoneModel.getTelefoneCPF_CREDILINK_PF(cpf),

    // VIRTUAL
    virtualModel.getEmailCPF_CREDILINK_PF(cpf),

    // SERVIDOR
    servidorModel.getServidorFederalCPF_Transparencia(cpf),

    // BENEFICIO
    beneficioModel.getBPCTransparenciaCPF(cpf),
    beneficioModel.getAuxilioEmergencialTransparenciaCPF(cpf),
    beneficioModel.getSeguroDefesoTransparenciaCPF(cpf),
    beneficioModel.getGarantiaSafraTransparenciaCPF(cpf),
    beneficioModel.getBolsaFamiliaTransparenciaCPF(cpf),
    beneficioModel.getCartaoGovernoFederalTransparenciaCPF(cpf),

    // PROCESSO
    processoModel.getProcessoCPF_TJPB(cpf),
    processoModel.getTransparenciaCNEP_CPF(cpf),
    processoModel.getTransparenciaCEAF_CPF(cpf),
    processoModel.getTransparenciaCEIS_CPF(cpf),
    processoModel.getAcordaoCPF_WebserviceTCU(cpf),
    processoModel.getProcessoCPF_WebserviceTCU(cpf),
    processoModel.getCondenacaoCPF_WebserviceTCU(cpf),

    //BOLETIM OCORRÊNCIA
    boletimOcorrenciaModel.getBoletimOcorrenciaCPF_CODATA(cpf),

    //MANDADO DE PRISÃO
    mandadoModel.getMandadoDetalhadoCPF_BNMP_CORTEX(cpf, cpfUsuario),
    // mandadoModel.getMandado_CORTEX(cpf),
    // mandadoModel.getContraMandado_CORTEX(cpf),

    //PRONTUARIO
    prontuarioModel.getProntuarioCPF_LINCE(cpf),

    //AMADOR
    amadorModel.getAmadorCPF_CORTEX(cpf, cpfUsuario),

    // ÓBITOS CORTEX
    obitoModel.getObitosCPF_CORTEX(cpf, cpfUsuario),
    obitoModel.getObitoCPF_CREDILINK(cpf),

    // VIZINHOS
    ...vizinhoModel.getVizinhoCPF_CREDILINK_PF(cpf),

    // CRAWLERS
    ...(useCrawlers && [
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf),
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf, 'jus.br'),
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf, 'mp.br'),
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf, 'edu.br'),
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf, 'gov.br'),
      crawlersModel.getRegistrosMotoresBuscaCPF_PandoraCrawlers(cpf, 'mil.br'),

      crawlersModel.getDOPBCPF_PandoraCrawlers(cpf),
      crawlersModel.getJusBrasilCPF_PandoraCrawlers(cpf),

      crawlersModel.getFacebookCPF_PandoraCrawlers(cpf),
      crawlersModel.getInstagramCPF_PandoraCrawlers(cpf),
      crawlersModel.getLinkedinCPF_PandoraCrawlers(cpf),
      // crawlersModel.getTransparenciaCrawlerCPF(cpf)
    ]),
  ])
    .then(pessoas => filtraNulos(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
};

export let getPessoasListaCPFs = function(listaCPFs: Array<string>) {
  return Promise.all(
    listaCPFs.map(cpf => {
      // Realiza a busca de cada um dos CPFs nas nossas bases
      return Promise.all([
        pessoaModel.getPessoaSimplificadoCPF_BD_Receita(cpf),
      ])
        .then(pessoas => filtraNaoEncontrados(pessoas))
        .then((pessoas: any) =>
          pessoas[0].status === API_CODES.CODE_RECURSO_NAO_ENCONTRADO ? pessoaModel.getPessoaDetalhadoCPF_ReceitaFull_PF(cpf) : pessoas
        );
    })
  )
    .then(pessoas => flat(pessoas))
    .then(pessoas => filtraNaoEncontrados(pessoas))
    .then(pessoas => agrupaEFiltraDuplicados(pessoas))
    .then(pessoas => desagrupa(pessoas))

    .catch(error => logger.error('ERROR: getPessoasListaCPFs - ', error));
};
