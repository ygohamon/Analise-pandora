
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VEP');

const fonte = MODEL_PRIORITY['vep.advogado'].fonte;
const rank  = MODEL_PRIORITY['vep.advogado'].rank;
const grupo = MODEL_PRIORITY['vep.advogado'].grupo;

export let getAdvogadoDetalhadoCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.CPF as cpf
            ,UPPER(P.DS_PESSOA) as nome
            ,ADV.STATUS as status
            ,ADV.MATRICULA as matricula
            ,ADV.DEFENSOR as defensor
            ,ADV.NUMEROOAB as numeroOAB
            ,UF_OAB.DS_SIGLA AS ufOAB
            ,'advogado' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('ADVOGADO')} ADV
            INNER JOIN ${modelConfig.get('PF')} PF ON (PF.ID_PESSOAFISICA = ADV.FK_PESSOAFISICA)
            LEFT OUTER JOIN ${modelConfig.get('UF')} UF_OAB ON (UF_OAB.ID_UF = ADV.FK_OAB_UF)
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAdvogadoDetalhadoRG_VEP = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.IDENTIDADE_NUM as rg
            ,UPPER(P.DS_PESSOA) as nome
            ,ADV.STATUS as status
            ,ADV.MATRICULA as matricula
            ,ADV.DEFENSOR as defensor
            ,ADV.NUMEROOAB as numeroOAB
            ,UF_OAB.DS_SIGLA AS ufOAB
            ,'advogado' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('ADVOGADO')} ADV
            INNER JOIN ${modelConfig.get('PF')} PF ON (PF.ID_PESSOAFISICA = ADV.FK_PESSOAFISICA)
            LEFT OUTER JOIN ${modelConfig.get('UF')} UF_OAB ON (UF_OAB.ID_UF = ADV.FK_OAB_UF)
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
        WHERE IDENTIDADE_NUM=@IDENTIDADE_NUM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
