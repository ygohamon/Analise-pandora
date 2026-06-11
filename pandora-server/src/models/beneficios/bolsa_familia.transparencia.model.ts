const got = require('got');

import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';
import { resultFoundRaw, getNomeFuncao, modelFactory as mf, getTime, parseDate } from './../../utils';
import moment = require('moment');

const modelConfig = getModelConfig('TRANSPARENCIA_CRAWLERS');

const fonte = MODEL_PRIORITY['transparencia_beneficio'].fonte;
const rank  = MODEL_PRIORITY['transparencia_beneficio'].rank
const grupo = MODEL_PRIORITY['transparencia_beneficio'].grupo;

const fnRetorno = resultFoundRaw;

export let getBolsaFamiliaTransparenciaCPF = function (cpf: string, anoMes: string = null) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    const config = {
      retry: 0,
      timeout: modelConfig.get('TRANSPARENCIA_API_TIMEOUT') || 10000,
      headers: {
        'chave-api-dados': modelConfig.get('TRANSPARENCIA_CHAVE_API')
      }
    }
    const _anoMes = (anoMes) ? anoMes : moment().subtract(2, 'months').format('YYYYMM');

    return got(`${modelConfig.get('PORTAL_TRANSPARENCIA_URL_API')}api-de-dados/bolsa-familia-disponivel-por-cpf-ou-nis?codigo=${cpf}&anoMesCompetencia=${_anoMes}`, config)
      .json()
      .then(dados => dados.map(d => {
        return {
          id: d?.id,
          cpf,
          dataMesCompetencia: parseDate(d?.dataMesCompetencia),
          dataMesReferencia: parseDate(d?.dataMesReferencia),
          nis: d?.titularBolsaFamilia?.nis,
          nome: d?.titularBolsaFamilia?.nome,
          municipio: d?.municipio?.nomeIBGEsemAcento,
          uf: d?.municipio?.uf?.sigla,
          valor: d?.valor,
          quantidadeDependentes: d?.quantidadeDependentes,
          fonte: 'transparencia',
          tipo: 'bolsa_familia',
          dataConsulta: getTime()
        }
      }))
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
};
