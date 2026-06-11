import * as rp from 'request-promise-native';

import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import { resultFoundRaw, modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_ARIEL');

const fonte  = MODEL_PRIORITY['ariel'].fonte;
const rank   = MODEL_PRIORITY['ariel'].rank;
const grupo  = MODEL_PRIORITY['ariel'].grupo;

export let getPessoaSimplificadoFotoCapturada_ARIEL = function(fotoCapturada: string, limiar: number) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    let options = {
      method: 'POST',
      json: true,
      url: `${API_CONFIG.SERVER_ARIEL_URL}/api/whois/`,
      form: {
          img: fotoCapturada,
          tolerance: limiar
      },
      strictSSL: false
    }

    return rp(options);
  }

  const fnChecaTemDado = (r) => r.status === 'OK' && r.msg !== 'Nao foi possivel reconhecer ninguem.';
  const fnRetorno = resultFoundRaw;

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemDado, fnRetorno });
}
