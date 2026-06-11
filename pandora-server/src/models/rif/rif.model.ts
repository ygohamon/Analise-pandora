
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_GAECO');

const fonte   = MODEL_PRIORITY['rif'].fonte;
const rank    = MODEL_PRIORITY['rif'].rank;
const grupo   = MODEL_PRIORITY['rif'].grupo;

export let existeRIFCPF_Sispesquisa_RIF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.NVarChar, cpf],
      ],`
        SELECT qtd
        FROM (
            SELECT COUNT(*) as qtd
            FROM ${modelConfig.get('RIF_PF')}
            WHERE Documento=@CPF
        ) AS RIF
        WHERE RIF.qtd > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let existeRIFCNPJ_Sispesquisa_RIF = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.NVarChar, cnpj],
      ],`
          SELECT qtd
          FROM (
              SELECT COUNT(*) as qtd
              FROM ${modelConfig.get('RIF_PJ')}
              WHERE Documento=@cnpj
          ) AS RIF
          WHERE RIF.qtd > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
