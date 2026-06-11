const got = require('got');

import * as _ from 'underscore';

import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  geraListaNomes,
  flat,
  filtraNulos,
  removeNaoCaracter,
  removerAcentos,
  somaArr,
  comparaString,
  getNomeFuncao,
  modelFactory as mf,
  allSettled,
  processAllSettled,
} from './../../utils';

import { getPessoaSimplificadoCPF_BD_Receita, getPessoaSimplificadoNome_LINCE, getPessoaSimplificadoRG_LINCE } from '../pessoa';


const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getInstagramCPF_PandoraCrawlers = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://instagram.com -site:https://instagram.com/p/ "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, nome))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getInstagramRG_PandoraCrawlers = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://instagram.com -site:https://instagram.com/p/ "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, nome))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getInstagramNome_PandoraCrawlers = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const lince = await getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.lince)

      return allSettled(
        geraListaNomes(lince).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:site:https://instagram.com -site:https://instagram.com/p/ "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, lince))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

const trataDados = function (data, nome: string) {
  if (!data?.length) return null;

  const dados = filtraNulos(data).map(d => {
    let url = (d?.url.startsWith('https://')) ? d.url : 'https://' + d.url;
    url = (url.endsWith('/')) ? url : url + '/';

    let titulo = (d?.titulo) ? d?.titulo.split('(@')[0].trim() : d.titulo;
    titulo = removeNaoCaracter(removerAcentos(titulo));

    const instagram = url.replace('https://www.instagram.com/','').split('/')[0];
    const obj = somaArr(geraListaNomes(nome).map(n => comparaString(removeNaoCaracter(removerAcentos(n)), titulo)))

    return {
      ...d,
      titulo,
      url,
      instagram,
      obj,
      tipo: 'instagram',
    }
  })
    .filter(d => !d.url.includes('/p/'))
    .filter(d => !d.url.includes('/explore/'))


  const agrupamentoInstagram = _.groupBy(dados, (d) => d.instagram);
  return _.uniq(dados, _.iteratee((d) => d.instagram))
    .map(d => { return { relevancia: agrupamentoInstagram[d.instagram].length, ...d }})
    .filter(i => i !== null);

}
