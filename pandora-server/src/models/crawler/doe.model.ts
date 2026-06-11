const got = require('got');
import * as _ from 'underscore';

import { getPessoaSimplificadoCPF_BD_Receita, getPessoaSimplificadoCPF_LINCE, getPessoaSimplificadoNome_LINCE, getPessoaSimplificadoRG_LINCE } from '../pessoa';
import { getEmpresaSimplificadoCNPJ_BD_Receita } from '../empresa';

import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

import {
  flat,
  formataDado,
  getNomeFuncao,
  allSettled,
  print,
  modelFactory as mf,
  filtraNulos,
  processAllSettled
} from './../../utils';

const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getDOPBCPF_PandoraCrawlers = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['do'];
  const cpfFormatado = formataDado(cpf, '###.###.###-##');

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled(
        spiders.map(spider => allSettled([
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:auniao.pb.gov.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:ged.mppb.mp.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:app.tjpb.jus.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:pesquisa.in.gov.br %2B"${nome}"`).json(),
        ])
          .then(dados => processAllSettled(dados))
          .then(dados => flat(dados))
        )
      ))
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getDOPBRG_PandoraCrawlers = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['do'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled(
        spiders.map(spider => allSettled([
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:auniao.pb.gov.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:ged.mppb.mp.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:app.tjpb.jus.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:pesquisa.in.gov.br %2B"${nome}"`).json(),
        ])
          .then(dados => processAllSettled(dados))
          .then(dados => flat(dados))
        )
      ))
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getDOPBNome_PandoraCrawlers = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['do'];

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled(
        spiders.map(spider => allSettled([
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:auniao.pb.gov.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:ged.mppb.mp.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:app.tjpb.jus.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:pesquisa.in.gov.br %2B"${nome}"`).json(),
        ])
          .then(dados => processAllSettled(dados))
          .then(dados => flat(dados))
        )
      ))
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


export const getDOPBCNPJ_PandoraCrawlers = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const spiders = ['do'];
  const cnpjFormatado = formataDado(cnpj, '##.###.###/####-##');

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getEmpresaSimplificadoCNPJ_BD_Receita(cnpj)
      .then(resultado => resultado?.resultado?.dados[0]?.razaoSocial)
      .then(nome => allSettled(
        spiders.map(spider => allSettled([
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:auniao.pb.gov.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:ged.mppb.mp.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:app.tjpb.jus.br %2B"${nome}"`).json(),
          got(`${CRAWLERS_URL}/crawl?spider=${spider}&timeout=${timeout}&q=site:pesquisa.in.gov.br %2B"${nome}"`).json(),
        ])
          .then(dados => processAllSettled(dados))
          .then(dados => flat(dados))
        )
      ))
      .then(dados => processAllSettled(dados))
      .then(dados => flat(dados))
      .then(dados => trataDados(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

const trataDados = (data) => {
  if (!data?.length) return null;

  const dados = filtraNulos(data).map(d => {
    return {
      ...d,
      dominio: (d?.url) ? (new URL(d?.url)).hostname.replace('www.', '') : '',
      tipo: 'doe'
    }
  }).filter(d => {
    if (d.url.endsWith('app.tjpb.jus.br/') ||
      d.url.endsWith('auniao.pb.gov.br/') ||
      d.url.endsWith('ged.mppb.mp.br/') ||
      d.url.endsWith('pesquisa.in.gov.br/')
    ) {return false;}
    else {
      return true
    }
  })

  const agrupamentoUrl = _.groupBy(dados, (d) => d.url);
  return _.uniq(dados, _.iteratee((d) => d.url))
    .map(d => { return { relevancia: agrupamentoUrl[d.url].length, ...d }; })
    .filter(i => i !== null);
}
