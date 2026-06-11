
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { API_CONFIG, MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SISDEPEN');

const fonte = MODEL_PRIORITY['sisdepen.foto'].fonte;
const rank  = MODEL_PRIORITY['sisdepen.foto'].rank;
const grupo = MODEL_PRIORITY['sisdepen.foto'].grupo;

export let getFotoCPF_SISDEPEN = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            foto as img,
            'face' as tipo,
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PRISIONAL')}
        WHERE cpf=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
