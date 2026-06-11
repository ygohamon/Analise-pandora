
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  PROCESSO as processo,
  TIPO_SANCAO as tipoSancao,
  DATA_INICIOSANCAO as dataInicio,
  DATA_FINALSANCAO as dataFinal,
  ORGAO_SANCIONADOR as orgaoSancionador,
  CASE WHEN UF_ORGAO_SANCIONADOR = 'NULL' THEN NULL ELSE UF_ORGAO_SANCIONADOR END AS ufOrgaoSancionador,
  ORIGEM_INFORMACOES as origemInformacoes,
  DATA_ORIGEMINFORMACOES as dataOrigem,
  CASE WHEN DATA_PUBLICACAO = 'NULL' THEN NULL ELSE DATA_PUBLICACAO END AS dataPublicacao,
  CASE WHEN PUBLICACAO = 'NULL' THEN NULL ELSE PUBLICACAO END AS publicacao,
  'CEIS' as fonte
`;

export let getCondenacaoCEISCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('CEIS')}
        WHERE CPF_CNPJ_SANCIONADA=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getCondenacaoCEISCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('CEIS')}
        WHERE CPF_CNPJ_SANCIONADA=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
