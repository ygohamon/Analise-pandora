import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao, resultFoundRaw } from './../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PEP');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['pep'].fonte;
const rank  = MODEL_PRIORITY['pep'].rank;
const grupo = MODEL_PRIORITY['pep'].grupo;

export let getPessoaExpostaPoliticamenteCPF_BD_PEP = function(cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
    ], `
      SELECT
        p.ANO as ano,
        p.CARGO AS cargo,
        p.ORGAO AS orgao
      FROM
        ${modelConfig.get('VW_PEP')} as p
      WHERE
        p.CPF = @CPF
      ORDER BY p.ANO
    `)
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
