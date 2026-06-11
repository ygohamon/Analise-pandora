
import { db, ISql } from './../../../services/db.service';
import { API_CONFIG } from './../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../../utils';
const modelConfig = getModelConfig('BD_SAGRES');

const fonte = 'sagres'; //MODEL_PRIORITY['sisobi.obito'].fonte;
const rank = 0; //MODEL_PRIORITY['sisobi.obito'].rank;
const grupo = 'nepotismo'; //MODEL_PRIORITY['sisobi.obito'].grupo;

const fnProcessaDadosEncontrados = function(result) {
  return result.slice(0, API_CONFIG.SERVER_MAX_RESULTS);
};

export const getNepotismoUgestoraEsferaAno = function(lotacao: string, cdugestora: string, esfera: string, ano: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOTACAO', ISql.Char(50), lotacao],
      ['CDUGESTORA', ISql.Int, cdugestora],
      ['ESFERA_ANALISADA', ISql.Char(1), esfera],
      ['ANO', ISql.Int, ano],
      ],`
        EXEC ${modelConfig.get('USP_NEPOTISMO')} @ANO, @ESFERA_ANALISADA, @LOTACAO, @CDUGESTORA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export const getNepotismoCPFAno = function(cpf: string, ano: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ['ANO', ISql.Int, ano],
      ],`
        EXEC ${modelConfig.get('USP_NEPOTISMO_CPF')} @ANO, @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};
