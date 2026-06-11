
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

export let getCondenacaoTRF5CPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT DISTINCT
            NUMERO_PROCESSO as processo,
            DATA_PROCESSO_DT as dataProcesso,
            CPF as cpf,
            DATA_JULGAMENTO_DT as dataJulgamento,
            CASE
                WHEN OBSERVACOES NOT LIKE 'O campo%' THEN OBSERVACOES
                ELSE NULL
            END as resultado,
            CASE
                WHEN ISNULL(ASSUNTO_RESUMO_DELIBERACAO, '-1') <> '-1' THEN UPPER(ASSUNTO_RESUMO_DELIBERACAO)
                WHEN ISNULL(OBSERVACOES, '-1') <> '-1' AND ISNULL(LIVRE_1, '-1') <> '-1' AND OBSERVACOES NOT LIKE 'O campo%' THEN LIVRE_1 + ', ' + ISNULL(LIVRE_2,'') + ', ' + LIVRE_3
                ELSE NULL
            END AS decisao,
            'trf5' as fonte

        FROM ${modelConfig.get('TRF5')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
