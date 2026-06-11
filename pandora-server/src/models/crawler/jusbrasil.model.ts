const got = require('got');

import { getPessoaSimplificadoCPF_BD_Receita, getPessoaSimplificadoNome_LINCE, getPessoaSimplificadoRG_LINCE } from '../pessoa';
import { getEmpresaSimplificadoCNPJ_BD_Receita } from '../empresa';

import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

import {
  flat,
  formataDado,
  getNomeFuncao,
  allSettled,
  modelFactory as mf
} from './../../utils';

const fonte = MODEL_PRIORITY['pandora.crawlers'].fonte;
const rank  = MODEL_PRIORITY['pandora.crawlers'].rank;
const grupo = MODEL_PRIORITY['pandora.crawlers'].grupo;

const modelConfig = getModelConfig('PANDORA_CRAWLERS');

export const getJusBrasilCPF_PandoraCrawlers = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const cpfFormatado = formataDado(cpf, '###.###.###-##');

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoCPF_BD_Receita(cpf)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled([
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${nome}"`).json(),
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${cpfFormatado}"`).json(),
      ]))
      .then(res => res.filter((p:any) => p.status === "fulfilled"))
      .then(res => res.map((p:any) => p.value))
      .then(dados => flat(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getJusBrasilRG_PandoraCrawlers = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoRG_LINCE(rg)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled([
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${nome}"`).json(),
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${rg}"`).json(),
      ]))
      .then(res => res.filter((p:any) => p.status === "fulfilled"))
      .then(res => res.map((p:any) => p.value))
      .then(dados => flat(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getJusBrasilNome_PandoraCrawlers = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getPessoaSimplificadoNome_LINCE(nome)
      .then(resultado => resultado?.resultado?.dados[0]?.nome)
      .then(nome => allSettled([
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${nome}"`).json(),
      ]))
      .then(res => res.filter((p:any) => p.status === "fulfilled"))
      .then(res => res.map((p:any) => p.value))
      .then(dados => flat(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getJusBrasilCNPJ_PandoraCrawlers = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const cnpjFormatado = formataDado(cnpj, '##.###.###/####-##');

  const query = () => {
    const CRAWLERS_URL = API_CONFIG.SERVER_CRAWLERS_URL;
    const timeout = modelConfig.get('CRAWLERS_TIMEOUT') || 10000;

    return getEmpresaSimplificadoCNPJ_BD_Receita(cnpj)
      .then(resultado => resultado?.resultado?.dados[0]?.razaoSocial)
      .then(razaoSocial => allSettled([
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${razaoSocial}"`).json(),
        got(`${CRAWLERS_URL}/crawl?spider=jusbrasil&timeout=${timeout}&q="${cnpjFormatado}"`).json(),
      ]))
      .then(res => res.filter((p:any) => p.status === "fulfilled"))
      .then(res => res.map((p:any) => p.value))
      .then(dados => flat(dados))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
