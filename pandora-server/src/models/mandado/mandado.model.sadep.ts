const got = require('got');
import { MODEL_PRIORITY } from "../../config";
import { getModelConfig } from "../../config.models";

import {
  flat,
  getNomeFuncao,
  modelFactory as mf,
  resultFound
} from "./../../utils";

const modelConfig = getModelConfig("WEBSERVICE_SADEP");

const fonte = MODEL_PRIORITY["sadep"].fonte;
const rank  = MODEL_PRIORITY["sadep"].rank;
const grupo = MODEL_PRIORITY["sadep"].grupo;

/**
 *
 */
const gotConfig = {
  timeout: modelConfig.get('SADEP_TIMEOUT') || 30000,
  retry: 0,
  headers: {
    Authorization: modelConfig.get('SADEP_TOKEN'),
  }
};

/**
 * Consome mandados em aberto da api SADEP.
 * @param uf
 * @returns
 */
export let getMandadosEmAbertoPorUF_SADEP = function(uf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFound;

  const query = async () => {
    const mandados = await got(`${modelConfig.get('SADEP_URL')}/uf/?uf=${uf}`, gotConfig)
    .text()
    .then(mandados => {
      return JSON.parse(mandados.replace(/\bNaN\b/g, "null"));
    });

    if (mandados?.empregados?.length > 0) {
      return ajustaDadosMandados(mandados.empregados);
    } else {
      return null;
    }
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno } );
}

export let getDadosMandadoPorCPF_SADEP = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFound;

  const query = async () => {
    const mandado = await got(`${modelConfig.get('SADEP_URL')}/mandados/${cpf}`, gotConfig).json();

    if (mandado?.mandados?.length > 0 ) {
      return mandado.mandados;
    } else {
      return null;
    }
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
}

let ajustaDadosMandados = (mandados) => {
  return mandados.map(m => {
    return {
      cpf:                       m.cpf,
      nome:                      m.nome,
      municipio:                 m.municipio,
      orgao_expedidor:           m.orgao_expedidor,
      orgao_expedidor_municipio: m.orgao_expedidor_municipio,
      orgao_expedidor_uf:        m.orgao_expedidor_uf,
      data_expedicao:            m.data_expedicao,
      data_validade:             m.data_validade,
      tipo_prisao:               m.tipo_prisao,
      regime_prisional:          m.regime_prisional,
      numero_mandado_prisao:     m.numero_mandado_prisao,
      data_visto_em:             m.data_visto_em,
      tipificacao:               m.tipificacao,
      crime:                     m.crime
    }
  });
}
