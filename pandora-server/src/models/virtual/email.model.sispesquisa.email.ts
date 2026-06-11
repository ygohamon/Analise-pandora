
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VIRTUAL');

const fonte = MODEL_PRIORITY['sispesquisa.email'].fonte;
const rank = MODEL_PRIORITY['sispesquisa.email'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.email'].grupo;

export const getEmailCPF_SispesquisaEmail = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF_CNPJ as cpf
            ,LOWER(EMAIL) AS email
            ,'email' as tipo
            ,fonte

        FROM ${modelConfig.get('EMAIL')}
        WHERE CPF_CNPJ=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getEmailCNPJ_SispesquisaEmail = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF_CNPJ as cnpj
            ,LOWER(EMAIL) AS email
            ,'email' as tipo
            ,fonte

        FROM ${modelConfig.get('EMAIL')}
        WHERE CPF_CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
