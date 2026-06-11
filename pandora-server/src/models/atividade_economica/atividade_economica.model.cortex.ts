import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['cortex.atividadeeconomica'].fonte;
const rank  = MODEL_PRIORITY['cortex.atividadeeconomica'].rank;
const grupo = MODEL_PRIORITY['cortex.atividadeeconomica'].grupo;

export const getAtividadesEconomicasCNPJ_Cortex = function (cnpj: string, cpfUsuario: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
    .then(dado => {
      return (!dado) ? null : atividadesEconomicas(dado)
    });
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

const atividadesEconomicas = function(dados) {
  return [{
      cnae: dados.codigoCnaeFiscal,
      descricao: dados.cnaeFiscal,
      fonte: modelConfig?.sigla
  },
  {
    cnae: dados.codigoCnaeSecundario,
    descricao: dados.cnaeSecundario,
    fonte: modelConfig?.sigla
  }];
}
