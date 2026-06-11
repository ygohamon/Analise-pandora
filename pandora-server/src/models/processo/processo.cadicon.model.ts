
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  DATA_TRANSITO_JULGADO as dataTransitoJulgado,
  SIGLA_TRIBUNAL as siglaTribunal,
  TEXTO_ACORDAO as acordao,
  URL_ACORDAO as urlAcordao,
  TEXTO_PROCESSO as processo,
  URL_PROCESSO as urlProcesso,
  COLEGIADO as colegiado,
  VALOR_DEBITO as vDebito,
  VALOR_MULTA as vMulta,
  'CADICON' as fonte
`;

export let getProcessoCadiconCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('CADICON')}
        WHERE NUM_CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
