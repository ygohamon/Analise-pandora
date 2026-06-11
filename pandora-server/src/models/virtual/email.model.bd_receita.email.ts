
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['bd_receita.email'].fonte;
const rank = MODEL_PRIORITY['bd_receita.email'].rank;
const grupo = MODEL_PRIORITY['bd_receita.email'].grupo;

export const getEmailCNPJ_BD_Receita_PJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            cnpj as cnpj
            ,LOWER(TRIM(CorreioEletronico)) as email
            ,'email' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE cnpj=@CNPJ AND
          (CorreioEletronico IS NOT NULL AND CorreioEletronico <> '' )
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getEmailCPF_BD_Receita_Socio = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            num_cpf as cpf
            ,lower(DESCR_EMAIL) as email
            ,'email' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')}
        WHERE NUM_CPF=@CPF
            AND (DESCR_EMAIL IS NOT NULL AND DESCR_EMAIL <> '')
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getEmailCNPJ_BD_Receita_Socio = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ as cnpj
            ,lower(DESCR_EMAIL) as email
            ,'email' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')}
        WHERE NUM_CNPJ=@CNPJ
          AND (DESCR_EMAIL IS NOT NULL AND DESCR_EMAIL <> '')
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
