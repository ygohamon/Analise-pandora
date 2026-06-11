const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate } from './../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_beneficio'].fonte;
const rank  = MODEL_PRIORITY['transparencia_beneficio'].rank
const grupo = MODEL_PRIORITY['transparencia_beneficio'].grupo;

const fnRetorno = resultFoundRaw;

export let getBPCTransparenciaCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }
    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/bpc-por-cpf-ou-nis?codigo=${cpf}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          dataMesCompetencia: parseDate(d?.dataMesCompetencia),
          dataMesReferencia: parseDate(d?.dataMesReferencia),
          nis: d?.beneficiario?.nis,
          nome: d?.beneficiario?.nome,
          representanteNis: d?.beneficiario?.nisRepresentanteLegal,
          representanteNome: d?.beneficiario?.nomeRepresentanteLegal,
          municipio: d?.municipio?.nomeIBGEsemAcento,
          uf: d?.municipio?.uf?.sigla,
          valor: d?.valor,
          concedidoJudicialmente: d?.concedidoJudicialmente,
          fonte: 'transparencia',
          tipo: 'bpc',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
