const got = require('got');
import * as _ from 'underscore';

import { getPessoaSimplificadoCPF_BD_Receita, getPessoaSimplificadoNome_LINCE, getPessoaSimplificadoRG_LINCE } from '../pessoa';

import { getModelConfig } from '../../config.models';
import { API_CONFIG, MODEL_PRIORITY } from './../../config';

import {
  geraListaNomes,
  flat,
  filtraNulos,
  getNomeFuncao,
  allSettled,
  processAllSettled,
  modelFactory as mf
} from './../../utils';

const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getLinkedinCPF_PandoraCrawlers = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://br.linkedin.com "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getLinkedinRG_PandoraCrawlers = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://br.linkedin.com "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getLinkedinNome_PandoraCrawlers = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const lince = await getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.lince)

      return allSettled(
        geraListaNomes(lince).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://br.linkedin.com "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

const trataDados = function (data) {
  if (!data?.length) return null;

  const dados = filtraNulos(data).map(d => {
    if (!d.url.includes('linkedin.com/in/')) return null;

    return {
      ...d,
      titulo: (d?.titulo) ? d.titulo.replace(' | LinkedIn', '') : null,
      linkedin: (d?.url) ? d.url.split('linkedin.com/in/')[1].split('/')[0] : null,
      tipo: 'linkedin',
    }
  }).filter(d => d !== null)

  const agrupamentoLinkedin = _.groupBy(dados, (d) => d.linkedin);
  return _.uniq(dados, _.iteratee((d) => d.linkedin))
    .map(d =>  Object.assign(d, {relevancia: agrupamentoLinkedin[d.linkedin].length}))
    .filter(i => i !== null);

}
