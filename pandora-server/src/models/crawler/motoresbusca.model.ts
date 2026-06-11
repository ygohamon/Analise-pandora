const got = require('got');
import * as _ from 'underscore';

import { getPessoaSimplificadoCPF_BD_Receita, getPessoaSimplificadoNome_LINCE, getPessoaSimplificadoRG_LINCE } from '../pessoa';
import { getEmpresaSimplificadoCNPJ_BD_Receita } from '../empresa';
import { getPessoaSimplificadoCPF_LINCE } from '../pessoa';

import { getModelConfig } from '../../config.models';
import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import {
  flat,
  filtraNulos,
  getNomeFuncao,
  modelFactory as mf
} from './../../utils';

const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getRegistrosMotoresBuscaCPF_PandoraCrawlers = function (cpf: string, subdominio: string = null) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const _subdominio = (subdominio) ? `site:${subdominio} ` : '';

  // Se for a busca sem subdominios utilizar o DuckDuckGo também
  // Também existe o buscador 'lukol', mas a consulta está muito demorada
  // const spiders = (!subdominio) ? ['bing', 'google', 'yahoo', 'duck'] : ['bing', 'google', 'yahoo'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => got(`${CRAWLERS_URL}/crawl?spider=all&timeout=${timeout}&q=${_subdominio}"${nome}"`).json())
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, subdominio))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getRegistrosMotoresBuscaRG_PandoraCrawlers = function (rg: string, subdominio: string = null) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const _subdominio = (subdominio) ? `site:${subdominio} ` : '';

  // Se for a busca sem subdominios utilizar o DuckDuckGo também
  // Também existe o buscador 'lukol', mas a consulta está muito demorada
  // const spiders = (!subdominio) ? ['bing', 'google', 'yahoo', 'duck'] : ['bing', 'google', 'yahoo'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => got(`${CRAWLERS_URL}/crawl?spider=all&timeout=${timeout}&q=${_subdominio}"${nome}"`).json())
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, subdominio))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getRegistrosMotoresBuscaNome_PandoraCrawlers = function (nome: string, subdominio: string = null) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const _subdominio = (subdominio) ? `site:${subdominio} ` : '';

  // Se for a busca sem subdominios utilizar o DuckDuckGo também
  // Também existe o buscador 'lukol', mas a consulta está muito demorada
  // const spiders = (!subdominio) ? ['bing', 'google', 'yahoo', 'duck'] : ['bing', 'google', 'yahoo'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => got(`${CRAWLERS_URL}/crawl?spider=all&timeout=${timeout}&q=${_subdominio}"${nome}"`).json())
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, subdominio))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getRegistrosMotoresBuscaCNPJ_PandoraCrawlers = function (cnpj: string, subdominio: string = null) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const _subdominio = (subdominio) ? `site:${subdominio} ` : '';

  // const spiders = (!subdominio) ? ['bing', 'google', 'yahoo', 'duck'] : ['bing', 'google', 'yahoo'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getEmpresaSimplificadoCNPJ_BD_Receita(cnpj)
      .then(resultado => resultado?.resultado?.dados[0]?.razaoSocial)
      .then(razaoSocial => got(`${CRAWLERS_URL}/crawl?spider=all&timeout=${timeout}&q=${_subdominio}"${razaoSocial}"`).json())
      .then(dados => flat(dados))
      .then(dados => trataDados(dados, subdominio))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


const trataDados = (data, subdominio: string) => {
  if (!data?.length) return null;

  const dados = filtraNulos(data).map(d => {
    return {
      ...d,
      dominio: (d?.url) ? (new URL(d?.url)).hostname.replace('www.', '') : '',
      tipo: 'buscageral',
      filtro: (subdominio) ? subdominio : '*'
    }
  })

  const agrupamentoUrl = _.groupBy(dados, (d) => d.url);
  return _.uniq(dados, _.iteratee((d) => d.url))
    .map(d => { return { relevancia: agrupamentoUrl[d.url].length, ...d }; })
    .filter(i => i !== null);
}
