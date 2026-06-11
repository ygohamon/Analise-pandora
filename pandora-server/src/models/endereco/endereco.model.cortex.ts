
import { cortex as ctx } from '../../services/misc/cortex.service';

import { modelFactory as mf, getNomeFuncao, resultFoundRaw, print } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('WEBSERVICE_CORTEX');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte  = MODEL_PRIORITY['cortex.endereco'].fonte;
const rank   = MODEL_PRIORITY['cortex.endereco'].rank;
const grupo  = MODEL_PRIORITY['cortex.endereco'].grupo;

export let getEnderecoCPF_CORTEX = function (cpf: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoafisica/${cpf}`, cpfUsuario)
      .then(dado => {
        return (!dado) ? null : [{
          cpf: dado?.numeroCPF,
          nome: dado?.nomeCompleto,
          tipoLogradouro: dado?.tipoLogradouro,
          logradouro: dado?.logradouro,
          numero: dado?.numeroLogradouro,
          complemento: dado?.complementoLogradouro,
          bairro: dado?.bairro,
          cep: dado?.cep,
          municipio: dado?.municipio,
          uf: dado?.uf,
          anoRegistro: dado?.dataAtualizacao?.slice(0, 4),
          fonte: modelConfig?.sigla
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}

export let getEnderecoCNPJ_CORTEX = function (cnpj: string, cpfUsuario: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return ctx.get(`${modelConfig.get('CORTEX_URL_PESSOAS')}/pessoajuridica/${cnpj}`, cpfUsuario)
      .then(dado => {
        return (!dado) ? null : [{
          cnpj: dado?.cnpj,
          razaoSocial: dado?.razaoSocial,

          tipoLogradouro: dado?.tipoLogradouro,
          logradouro: dado?.logradouro,
          numero: dado?.numeroLogradouro,
          complemento: dado?.complementoLogradouro,
          bairro: dado?.bairro,
          cep: dado?.cep,
          municipio: dado?.municipio,
          uf: dado?.uf,
          fonte: modelConfig?.sigla
        }]
      })
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
