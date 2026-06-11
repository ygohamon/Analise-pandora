const got = require('got');

import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  resultFoundRaw,
  getNomeFuncao,
  modelFactory as mf
} from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['crawler.transparenciafederal'].fonte;
const rank  = MODEL_PRIORITY['crawler.transparenciafederal'].rank;
const grupo = MODEL_PRIORITY['crawler.transparenciafederal'].grupo;

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;
const timeout = modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000;
const gotConfig = {timeout, retry: 0};

export let getTransparenciaCrawlerCPF = function (cpf: string) {

  const cpfFormatado = cpf.slice(0,3)+"."+cpf.slice(3,6)+"."+cpf.slice(6,9)+"-"+cpf.slice(9);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = async () => {
    return await got(`http://www.portaltransparencia.gov.br/busca?termo=${cpfFormatado}`, gotConfig).json()
      .then(dados => dados.registros.map(j => Object.assign(j, {fonte})))
    }

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getTransparenciaCrawlerRG = function (rg: string) {

    const nomeFuncao = getNomeFuncao(1, 2);
    const query = () => {
      return got(`http://www.portaltransparencia.gov.br/busca/resultado?termo=${rg}`, gotConfig).json()
        .then(dados => dados.registros.map(j => Object.assign(j, {fonte})))
      }

      return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getTransparenciaCrawlerNome = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return got(`http://www.portaltransparencia.gov.br/busca/resultado?termo=${nome}`, gotConfig).json()
      .then(dados => dados.registros.map(j => Object.assign(j, {fonte})))
    }

    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};

export let getTransparenciaCrawlerCNPJ = function (cnpj: string) {

  let cnpjFormatado = cnpj.slice(0,2)+"."+cnpj.slice(2,5)+"."+cnpj.slice(5,8)+"/"+cnpj.slice(8,12)+'-'+cnpj.slice(12);

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return got(`http://www.portaltransparencia.gov.br/busca?termo=${cnpjFormatado}`, gotConfig).json()
      .then(dados => dados.registros.map(j => Object.assign(j, {fonte})))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
};
