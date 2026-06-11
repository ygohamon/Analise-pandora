const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate } from './../../utils';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_beneficio'].fonte;
const rank  = MODEL_PRIORITY['transparencia_beneficio'].rank
const grupo = MODEL_PRIORITY['transparencia_beneficio'].grupo;

const fnRetorno = resultFoundRaw;

export let getGarantiaSafraTransparenciaCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }

    return got(`http://api.portaldatransparencia.gov.br/api-de-dados/safra-codigo-por-cpf-ou-nis?codigo=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          dataMesReferencia: parseDate(d?.dataMesReferencia),
          nis: d?.beneficiarioSafra?.nis,
          nome: d?.beneficiarioSafra?.nome,
          municipio: d?.municipio?.nomeIBGEsemAcento,
          uf: d?.municipio?.uf?.sigla,
          valor: d?.valor,
          fonte: 'transparencia',
          tipo: 'garantia_safra',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
