import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['cortex.contador'].fonte;
const rank  = MODEL_PRIORITY['cortex.contador'].rank;
const grupo = MODEL_PRIORITY['cortex.contador'].grupo;

export const getContadorCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
    .then(dado => {
      return (!dado) ? null : dadosContador(dado.cnpjContador)
    });
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

const dadosContador = function(dadosContador) {
  let contador = dadosContador.map(c => { return {
    cpf: c.numeroCPFContador,
    nome: c.nomeContador,
    crc: c.numeroRegistroContadorPF,
    ufCRC: c.ufCRCContador,
    fonte: modelConfig?.sigla
  }});

  return contador;
}
