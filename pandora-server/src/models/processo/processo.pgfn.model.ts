
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  DS_TIPO_DEVEDOR AS tipoDevedor,
  DS_SISTEMA_ORIGEM AS sistema,
  NR_INSCRICAO as numInscricao,
  CONVERT(date, DT_INSCRICAO, 103) AS dtInscricao,
  DS_SITUACAO AS situacao,
  DS_RECEITA AS receita,
  NM_REGIONAL_PGFN as regional,
  NR_PROCESSO AS numProcesso,
  CAST(REPLACE(VALOR, ',', '.') AS FLOAT) AS valor,
  'PGFN' as fonte
`;

export let getProcessoPGFNDividaAtivaCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
          ,CPF_CNPJ as cpf

        FROM ${modelConfig.get('PGFN_DIVIDA_ATIVA')}
        WHERE CPF_CNPJ=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getProcessoPGFNDividaAtivaCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
          ,CPF_CNPJ as cnpj

        FROM ${modelConfig.get('PGFN_DIVIDA_ATIVA')}
        WHERE CPF_CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
