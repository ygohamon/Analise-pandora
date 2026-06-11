
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';

import { normalizaNumero } from '.';

const modelConfig = getModelConfig('BD_VEP');

const fonte   = MODEL_PRIORITY['vep.telefone'].fonte;
const rank    = MODEL_PRIORITY['vep.telefone'].rank;
const grupo   = MODEL_PRIORITY['vep.telefone'].grupo;

const fnProcessaDadosEncontrados = function (result) {
  return result
    .map(dado => {
      const processado = normalizaNumero('', dado.telefone);
      const {telefone, ...resto} = dado;
      if (typeof processado === 'object') {
        return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
      } else {
        return Object.assign(resto, {telefone: processado, ddd: ''})
      }
    })
}

export let getTelefoneCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.NVarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.CPF as cpf
            ,TEL.TELEFONE as telefone
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            OUTER APPLY(
                SELECT STUFF((
                    SELECT ', ' + CAST(PTEL3.DDDTELEFONE AS VARCHAR) + CAST(PTEL3.NUMEROTELEFONE AS VARCHAR)
                    FROM ${modelConfig.get('PESSOATELEFONE')} PTEL3
                    WHERE (P.ID_PESSOA = PTEL3.FK_PESSOA)
                    FOR XML PATH('')
                ), 1, 2, '') AS TELEFONE
            ) AS TEL
        WHERE NOT EXISTS(
            SELECT 1
            FROM ${modelConfig.get('PARTEPROCESSOADV')} PPA
            INNER JOIN ${modelConfig.get('PARTEPROC')} PRO ON (PPA.FK_PARTEPROCESSO = PRO.ID_PARTEPROCESSO)
            INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PRO.FK_PARTE)
            WHERE (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
        ) AND PF.CPF=@CPF AND TEL.TELEFONE IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefoneRG_VEP = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.NVarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.IDENTIDADE_NUM as rg
            ,TEL.TELEFONE as telefone
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            OUTER APPLY(
                SELECT STUFF((
                    SELECT ', ' + CAST(PTEL3.DDDTELEFONE AS VARCHAR) + CAST(PTEL3.NUMEROTELEFONE AS VARCHAR)
                    FROM ${modelConfig.get('PESSOATELEFONE')} PTEL3
                    WHERE (P.ID_PESSOA = PTEL3.FK_PESSOA)
                    FOR XML PATH('')
                ), 1, 2, '') AS TELEFONE
            ) AS TEL
        WHERE NOT EXISTS(
            SELECT 1
            FROM ${modelConfig.get('PARTEPROCESSOADV')} PPA
            INNER JOIN ${modelConfig.get('PARTEPROC')} PRO ON (PPA.FK_PARTEPROCESSO = PRO.ID_PARTEPROCESSO)
            INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PRO.FK_PARTE)
            WHERE (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
        ) AND PF.IDENTIDADE_NUM=@IDENTIDADE_NUM AND TEL.TELEFONE IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};
