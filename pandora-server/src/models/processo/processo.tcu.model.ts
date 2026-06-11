const got = require('got');
const soap = require('soap');
const xml2js = require('xml2js');
const parser = new xml2js
  .Parser({explicitArray: false, trim: true, normalize: true, emptyTag: null})
  .parseStringPromise;

import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, first, print, formataDado } from './../../utils';

const fonte = MODEL_PRIORITY['tcu.processo'].fonte;
const rank  = MODEL_PRIORITY['tcu.processo'].rank;
const grupo = MODEL_PRIORITY['tcu.processo'].grupo;

const modelConfig = getModelConfig('TCU_CRAWLERS');

const fnChecaTemResultado = (r) => r.num !== 0;
const fnRetorno = resultFoundRaw;
const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;
const gotConfig = {timeout, retry: 0};


const criaAcordao = function(dados) {
  return dados?.documentos.map(d => {
    return {
      fonte,
      tipo: 'acordao',
      titulo: d.TITULO,
      dataSessao: d.DATASESSAO,
      situacao: d.SITUACAO,
      colegiado: d.COLEGIADO,
      dataAtualizacao: d.DTATUALIZACAO,
      sumario: d.SUMARIO,
      relator: d.RELATOR,
      link: d.URLARQUIVOPDF
    }
  })
}

export let getAcordaoCPF_WebserviceTCU = function (cpf: string) {

  const cpfFormatado = formataDado(cpf, '###.###.###-##');
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return got(`https://pesquisa.apps.tcu.gov.br/rest/publico/base/acordao-completo/documentosResumidos?termo=${cpfFormatado}`, gotConfig)
      .json()
      .then(r => criaAcordao(r))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getAcordaoCNPJ_WebserviceTCU = function (cnpj: string) {

  const cnpjFormatado = formataDado(cnpj, '##.###.###/####-##');
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return got(`https://pesquisa.apps.tcu.gov.br/rest/publico/base/acordao-completo/documentosResumidos?termo=${cnpjFormatado}`, gotConfig)
      .json()
      .then(r => criaAcordao(r))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

const criaProcesso = function(dados) {
  return dados?.documentos.map(d => {
    return {
      fonte,
      tipo: 'processo',
      tipoProcesso: d.TIPO,
      numeroProcesso: d.NUMEROFORMATADO,
      titulo: d.TITULOCOMPLETO,
      status: d.ESTADO,
      relator: d.RELATOR,
      assunto: d.ASSUNTO.trim(),
      link: d.URLSISTEMAPUSH
    }
  })
}

export let getProcessoCPF_WebserviceTCU = function (cpf: string) {

  const cpfFormatado = formataDado(cpf, '###.###.###-##');
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return got(`https://pesquisa.apps.tcu.gov.br/rest/publico/base/processo/documentosResumidos?termo=${cpfFormatado}`, gotConfig)
      .json()
      .then(r => criaProcesso(r))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getProcessoCNPJ_WebserviceTCU = function (cnpj: string) {

  const cnpjFormatado = formataDado(cnpj, '##.###.###/####-##');
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return got(`https://pesquisa.apps.tcu.gov.br/rest/publico/base/processo/documentosResumidos?termo=${cnpjFormatado}`, gotConfig)
      .json()
      .then(r => criaProcesso(r))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

const getCondenacaoTCU = function (_cpfCnpj: string) {

  const cpfCnpj = (_cpfCnpj.length === 11) ?
    formataDado(_cpfCnpj, '###.###.###-##') :
    formataDado(_cpfCnpj, '##.###.###/####-##');

  const wsdl = 'https://contas.tcu.gov.br/sancoes-condenacoesWeb/web/externo/SancoesECondenacoesTCU.wsdl';
  const params = { cpfCnpj };

  const processa = (dados) => {
    if (dados === 'Nenhum registro encontrado para os parâmetros informados') return null;
    else {
      return parser(dados)
        .then(dados => dados?.condenacoes?.registro)
        .then(dados => dados.map(j => Object.assign(j, {tipo: 'condenacao', fonte})))
    }
  }

  return () => {
    return soap.createClientAsync(wsdl)
      .then(client => client.recuperaCondenacoesPorCpfCnpjAsync(params))
      .then(dados => processa(first(dados).return))
  }
}

export const getCondenacaoCPF_WebserviceTCU = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getCondenacaoTCU(cpf);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export const getCondenacaoCNPJ_WebserviceTCU = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = getCondenacaoTCU(cnpj);
  const fnChecaTemResultado = (x) => x?.length > 0;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};
