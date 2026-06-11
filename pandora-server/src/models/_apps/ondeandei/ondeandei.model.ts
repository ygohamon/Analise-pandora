
import { cortex as ctx } from '../../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../../utils';
import { getModelConfig } from './../../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = modelConfig.sigla;
const rank   = 0;
const grupo  = 'ondeandei';

export let getUltimosRegistrosPlaca_CORTEX = function (placa: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_VEICULOS')}/movimentos/placa/${placa}`, cpfUsuario)
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getRegistrosPeriodoPlaca_CORTEX = function (placa: string, dataInicial: string, dataFinal: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(
      `${modelConfig.get('CORTEX_URL_VEICULOS')}/movimentos/placa/${placa}/periodo?dataHoraFinal=${dataFinal}&dataHoraInicial=${dataInicial}`,
      cpfUsuario
    );
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
