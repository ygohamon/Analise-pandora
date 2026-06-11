const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate } from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_beneficio'].fonte;
const rank  = MODEL_PRIORITY['transparencia_beneficio'].rank
const grupo = MODEL_PRIORITY['transparencia_beneficio'].grupo;

const fnRetorno = resultFoundRaw;

export let getSeguroDefesoTransparenciaCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/seguro-defeso-codigo?codigo=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          nis: d?.pessoaSeguroDefeso?.nis,
          nomeSemAcento: d?.pessoaSeguroDefeso?.nomeSemAcento,
          defeso: d?.defeso?.portaria,
          dataSaque: parseDate(d?.dataSaque),
          dataEmissaoParcela: parseDate(d?.dataEmissaoParcela),
          rgp: d?.rgp,
          parcela: d?.parcela,
          valor: d?.valor,
          municipio: d?.localidade?.nomeIBGEsemAcento,
          uf: d?.localidade?.uf?.sigla,
          fonte: 'transparencia',
          tipo: 'seguro_defeso',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
