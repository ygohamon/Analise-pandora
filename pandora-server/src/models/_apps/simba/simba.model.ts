
import { db, ISql } from './../../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../../utils';
const modelConfig = getModelConfig('BD_SIMBA');

const fonte = MODEL_PRIORITY['simba.top'].fonte;
const rank = MODEL_PRIORITY['simba.top'].rank;
const grupo = MODEL_PRIORITY['simba.top'].grupo;

export const getTopDadosBancariosCPF = function(cpf: string, quantidade = 10) {

  const cpf_ajustado = '000' + cpf;
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CPF', ISql.Char(14), cpf_ajustado],
    ['QUANTIDADE', ISql.Int, quantidade],
    ],`
      EXEC ${modelConfig.get('USP_INDICADORES_SIMBA')} @CPF, @QUANTIDADE
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getTopDadosBancariosCNPJ = function(cnpj: string, quantidade = 10) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ['QUANTIDADE', ISql.Int, quantidade],
      ],`
        EXEC ${modelConfig.get('USP_INDICADORES_SIMBA')} @CNPJ, @QUANTIDADE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
