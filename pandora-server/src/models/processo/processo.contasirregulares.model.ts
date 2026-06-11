
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CONDENACOES');

const fonte = MODEL_PRIORITY['condenacao'].fonte;
const rank  = MODEL_PRIORITY['condenacao'].rank;
const grupo = MODEL_PRIORITY['condenacao'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  processo,
  Município as municipio,
  uf,
  Deliberações as deliberacoes,
  TRY_CONVERT(DATE, [Trânsito em julgado], 103) as dataTransitoJulgado,
  TRY_CONVERT(DATE, [Data final], 103) as dataFinal,
  'CEI' as fonte
`;

export let getProcessoContasIrregularesCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('CONTAS_ELEITORAIS_IRREGULARES_PB')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
