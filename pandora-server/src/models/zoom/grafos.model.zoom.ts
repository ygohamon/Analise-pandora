import * as rp from 'request-promise-native';

import { MODEL_PRIORITY } from './../../config';
import { resultFoundRaw, modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_ZOOM');

const fonte  = MODEL_PRIORITY['zoom'].fonte;
const rank   = MODEL_PRIORITY['zoom'].rank;
const grupo  = MODEL_PRIORITY['zoom'].grupo;

export let getDadosGrafoPF_ZOOM = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    let options = {
      method: 'GET',
      json: true,
      url: `${modelConfig.get('ZOOM_WERSERVICE_URL')}/zoom/service/integracao/grafo/${cpf}`,
      headers: {
        'X-Zoom-Username': modelConfig.get('ZOOM_WEBSERVICE_USER'),
        'X-Zoom-Password': modelConfig.get('ZOOM_WEBSERVICE_PASS')
      },
      strictSSL: false
    }

    return rp(options).json();
  }

  const fnRetorno = resultFoundRaw;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
}

export let getDadosGrafoPJ_ZOOM = function (cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    let options = {
      method: 'GET',
      json: true,
      url: `${modelConfig.get('ZOOM_WERSERVICE_URL')}/zoom/service/integracao/grafo/${cnpj}`,
      headers: {
        'X-Zoom-Username': modelConfig.get('ZOOM_WEBSERVICE_USER'),
        'X-Zoom-Password': modelConfig.get('ZOOM_WEBSERVICE_PASS')
      },
      strictSSL: false
    }

    return rp(options).json();
  }

  const fnRetorno = resultFoundRaw;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
}
