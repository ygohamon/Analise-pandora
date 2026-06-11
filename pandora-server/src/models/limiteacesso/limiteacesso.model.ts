
import { db, ISql } from './../../services/db.service';
import { NovoLog } from './../../schemas/log.schema';
import { resultFound, logErroBuscaBD, respostaSucesso } from './../../utils';
import { MODEL_PRIORITY, API_CODES, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PANDORA');

// const fonte = MODEL_PRIORITY['sispesquisa.logs'].fonte;
// const rank = MODEL_PRIORITY['sispesquisa.logs'].rank;
// const grupo = MODEL_PRIORITY['sispesquisa.logs'].grupo;

export const getLimiteAcessoBlackListIP = function() {
  return db.query([
    ],`
      SELECT ip, usuario, url, user_agent, os, browser, device, data_hora
      FROM ${modelConfig.get('LOG')}
      WHERE code = 'EQUOTAEMPTY' AND chave = 'LIMITE_IP_DIA' AND tipo = 'BLACKLIST'
    `)
};

export const getEstourouQuotaDiariaLimiteAcessoIP = function() {
  return db.query([
    ],`
      SELECT ip, usuario, url, user_agent, os, browser, device, data_hora
      FROM ${modelConfig.get('LOG')}
      WHERE code = 'EQUOTAEMPTY' AND chave = 'LIMITE_IP_DIA' AND tipo <> 'BLACKLIST'
    `)
};

export const getEstourouQuotaDiariaLimiteAcessoUsuario = function() {
  return db.query([
    ],`
      SELECT ip, usuario, url, user_agent, os, browser, device, data_hora
      FROM ${modelConfig.get('LOG')}
      WHERE code = 'EQUOTAEMPTY' AND chave = 'LIMITE_USUARIO' AND tipo <> 'BLACKLIST'
    `)
};
