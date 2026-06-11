
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print, first, last } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.telefone'].fonte;
const rank   = MODEL_PRIORITY['cortex.telefone'].rank;
const grupo  = MODEL_PRIORITY['cortex.telefone'].grupo;

export let getTelefoneCPF_CORTEX = function (cpf: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoafisica/${cpf}`, cpfUsuario)
      .then(dado => {
        return ((!dado && !dado?.telefone.replace(/^0+/, '').length) || dado?.telefone.replace(/^0+/, '').length <= 0) ? null : [{
          cpf: dado?.numeroCPF,
          nome: dado?.nomeCompleto,
          ddd: dado?.ddd?.replace(/^0+/, ''),
          telefone: dado?.telefone?.replace(/^0+/, ''),
          anoRegistro: dado?.dataAtualizacao?.slice(0, 4),
          fonte: modelConfig?.sigla
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getTelefoneCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
      .then(dado => {
        if (!dado) return null;

        let telefones = [];
        if (!!dado?.telefone1) { telefones.push({telefone: dado?.telefone1})}
        if (!!dado?.telefone2) { telefones.push({telefone: dado?.telefone2})}

        return telefones.map(telefone => ({
          cnpj: dado?.cnpj,
          razaoSocial: dado?.razaoSocial,
          ddd: '',
          fonte: modelConfig?.sigla,
          ...telefone
        }))
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
