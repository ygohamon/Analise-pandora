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
  modelFactory as mf,
  processAllSettled,
  comparaString
} from './../../utils';

const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getFacebookCPF_PandoraCrawlers = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:https://pt-br.facebook.com -site:https://pt-br.facebook.com/public/ "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, nome))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getFacebookRG_PandoraCrawlers = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const nome = await getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)

      return allSettled(
        geraListaNomes(nome).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:https://pt-br.facebook.com -site:https://pt-br.facebook.com/public/ "${n}"`).json())
      )
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, nome))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


export const getFacebookNome_PandoraCrawlers = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['bing', 'google', 'yahoo'];

  const query = async () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    const lince = await getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.lince)

      return allSettled(
        geraListaNomes(lince).map(n => got(`${CRAWLERS_URL}/crawl?spider=cheerio&timeout=${timeout}&q=site:https://pt-br.facebook.com -site:https://pt-br.facebook.com/public/ "${n}"`).json())
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
    return {
      ...d,
      titulo: d?.titulo.replace(' | Facebook', ''),
      tipo: 'facebook',
    }
  })

  const agrupamentoUrl = _.groupBy(dados, (d) => d.url);
  const dadosUnicos = _.uniq(dados, _.iteratee((d) => d.url))
    .map(d => { return { relevancia: agrupamentoUrl[d.url].length, ...d }})
    .filter(i => i !== null);

  let dadosComFuncao = fobj(dadosUnicos, nome);

  return dadosComFuncao.map(d => {
    const {descricao, ...resto} = d;
    return { ...resto }
  })
}

/**
 * Calcula a semelhança entre o registro encontrado e uma combinação de nomes do alvo
 *
 * @param registros
 * @param nomeReal
 */
const fobj = function (registros: Array<{titulo: string, descricao: string, url: string, fonte: string, obj: number}>, nomeReal) {

  // O limiar de semelhança entre os nomes encontrados, menor que 0.5 será
  // desconsiderado.
  const thresholdSemelhanca = 0.5;

  // Gera uma lista de permutações dos nomes da Pessoa
  const listaNomes = geraListaNomes(nomeReal);

  return registros.filter(d => {

    let maxSemelhanca = 0;
    const resultado = listaNomes.filter(nome => {
      const semelhanca = comparaString(d.titulo, nome);
      if (semelhanca > maxSemelhanca) {
        maxSemelhanca = semelhanca;
      }

      // Checa se existe uma das combinacoes de nomes geradas dentro da descricao
      // do registro.
      return d.descricao.toLowerCase().includes(nome.toLowerCase());
    });

    d.obj = maxSemelhanca;

    return (maxSemelhanca > thresholdSemelhanca || resultado.length > 0) ? true : false;
  });
}
