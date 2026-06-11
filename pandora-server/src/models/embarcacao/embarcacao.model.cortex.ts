
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.embarcacao'].fonte;
const rank   = MODEL_PRIORITY['cortex.embarcacao'].rank;
const grupo  = MODEL_PRIORITY['cortex.embarcacao'].grupo;

const parser = function (dados: any[]) {
  return dados.map(dado => ({
    nome          : dado?.nomePessoaFisicaJuridica,
    cpfCnpj       : dado?.identificacaoProprietario,
    tipoPessoa    : dado?.tipoPessoaFisicaJuridica,
    embarcacao    : dado?.nomeEmbarcacao,
    descricao     : dado?.tipoEmbarcacao,
    anoConstrucao : dado?.anoContrucao,
    comprimento   : dado?.comprimentoEmbarcacao,
    inscricao     : dado?.numeroInscricaoEmbarcacao,
    situacao      : dado?.situacaoEmbarcacao,
    dataInscricao : dado?.dataInscricaoEmbarcacao,
    dataValidade  : dado?.dataValidadeTituloEmbarcacao,
    orgaoInscricao: dado?.orgaoInscricao,
    cidadeOrgao   : dado?.municipioLocalizacaoOrganizacaoMilitarMarinha,
    dataAquisicao : dado?.dataAquisicao,
    localAquisicao: dado?.ultimoLocalAquisicaoProprietarioAtual,
    valor         : dado?.ultimoValorAquisicaoProprietarioAtual,
    fonte         : modelConfig?.sigla
  }))
}

export let getEmbarcacaoCPF_CORTEX = function (cpf: string, cpfUsuario: string = ''){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const dados = await ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/idfProprietario/${cpf}`, cpfUsuario);
    if (!dados) return null;

    const numerosInscricao = dados.map(d => (d?.numeroInscricaoEmbarcacao));
    return Promise.all(numerosInscricao.map(n => ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/numeroInscricao/${n}`, cpfUsuario)))
      .then(dados => parser(dados).map(d => ({cpf, ...d})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getEmbarcacaoCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    const dados = await ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/idfProprietario/${cnpj}`, cpfUsuario);
    if (!dados) return null;

    const numerosInscricao = dados.map(d => (d?.numeroInscricaoEmbarcacao));
    return Promise.all(numerosInscricao.map(n => ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/numeroInscricao/${n}`, cpfUsuario)))
      .then(dados => parser(dados).map(d => ({cnpj, ...d})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getEmbarcacaoNome_CORTEX = function (embarcacao: String, cpfUsuario: string) {

  const nomeFuncao = getNomeFuncao(1,2);
  const query = async () => {
    const dados = await ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/dadosembarcacao/${embarcacao}`, cpfUsuario);
    if (!dados) return null;

    const numeroInscricao = dados.map(d => (d?.numeroInscricaoEmbarcacao));
    return Promise.all(numeroInscricao.map(n => ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/numeroInscricao/${n}`, cpfUsuario)))
    .then(dados => parser(dados).map(d => ({embarcacao, ...d})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno});
}

export let getEmbarcacaoNumero_CORTEX = function (inscricao: string, cpfUsuario: string){
  const nomeFuncao = getNomeFuncao(1,2);
  const query = async () => {
    const dados = await ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/numeroInscricao/${inscricao}`, cpfUsuario);
    if (!dados) return null;

    const numeroInscricao = dados.map(d => (d?.numeroInscricaoEmbarcacao));
    return Promise.all(numeroInscricao.map(n => ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/embarcacoes/numeroInscricao/${n}`, cpfUsuario)))
    .then(dados => parser(dados).map(d => ({inscricao, ...d})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno});
}
