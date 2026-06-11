
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VEP');

const fonte = MODEL_PRIORITY['vep.email'].fonte;
const rank = MODEL_PRIORITY['vep.email'].rank;
const grupo = MODEL_PRIORITY['vep.email'].grupo;

export const getEmailCPF_VEP = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.CPF as cpf
            ,LOWER(PE.DS_PESSOAEMAIL) AS email
            ,'email' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('EMAIL')} PE ON (PE.FK_PESSOA = P.ID_PESSOA)

        WHERE PE.DS_PESSOAEMAIL IS NOT NULL AND PF.CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getEmailRG_VEP = function(rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.IDENTIDADE_NUM as rg
            ,LOWER(PE.DS_PESSOAEMAIL) AS email
            ,'email' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('EMAIL')} PE ON (PE.FK_PESSOA = P.ID_PESSOA)

        WHERE PE.DS_PESSOAEMAIL IS NOT NULL AND PF.IDENTIDADE_NUM=@IDENTIDADE_NUM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
