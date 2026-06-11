const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate, checaCNPJ } from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_beneficio'].fonte;
const rank  = MODEL_PRIORITY['transparencia_beneficio'].rank
const grupo = MODEL_PRIORITY['transparencia_beneficio'].grupo;

const fnRetorno = resultFoundRaw;

export let getCartaoGovernoFederalTransparenciaCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/cartoes?cpfPortador=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          dataTransacao: parseDate(d?.dataTransacao),
          valor: d?.valorTransacao?.replace('.','')?.replace(',','.'),
          municipio: d?.estabelecimento?.municipio?.nomeIBGE,
          uf: d?.estabelecimento?.municipio?.uf?.sigla,
          cnpj: checaCNPJ(d?.estabelecimento?.codigoFormatado),
          razaoSocial: d?.estabelecimento?.razaoSocialReceita,
          tipoCartao: d?.tipoCartao?.descricao,
          unidadeGestora: d?.unidadeGestora?.nome,
          orgaoVinculado: d?.unidadeGestora?.orgaoVinculado?.nome,
          orgaoMaximo: d?.unidadeGestora?.orgaoVinculado?.orgaoMaximo?.sigla,
          fonte: 'transparencia',
          tipo: 'cartao_gov_federal',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
