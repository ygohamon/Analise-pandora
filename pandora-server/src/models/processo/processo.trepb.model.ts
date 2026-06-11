
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

export let getCondenacaoTREPBCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            Processo as processo,
            UPPER(Jurisdicionado) AS jurisdicionado,
            CPF as cpf,
            Decisao as decisao,
            Data_Julgamento as dataJulgamento,
            Res_Decisao_Poder_Legislativo as decisaoLegislativo,
            'trepb' as fonte

        FROM ${modelConfig.get('TREPB')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
