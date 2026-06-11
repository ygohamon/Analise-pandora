
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');

const fonte = MODEL_PRIORITY['bd_tse.eleitoral'].fonte;
const rank = MODEL_PRIORITY['bd_tse.eleitoral'].rank;
const grupo = MODEL_PRIORITY['bd_tse.eleitoral'].grupo;

export const getBensCandidatoCPF = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO AS ano
            ,DS_TIPO_BEM_CANDIDATO AS classe
            ,DS_BEM_CANDIDATO AS descricao
            ,VR_BEM_CANDIDATO AS valor
            ,'bem' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_BENS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
