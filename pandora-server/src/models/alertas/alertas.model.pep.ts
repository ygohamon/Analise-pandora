import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao, resultFoundRaw } from './../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_PEP');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['alertas.pep'].fonte;
const rank  = MODEL_PRIORITY['alertas.pep'].rank;
const grupo = MODEL_PRIORITY['alertas.pep'].grupo;

const DESCRICAO_ALERTA = 'PEP';
const TIPO_ALERTA = 'primary';
const ICONE = 'fa fa-user';

export let getAlertaPessoaExpostaPoliticamenteCPF_BD_PEP = function(cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
    ], `
      SELECT TOP 1
        '${DESCRICAO_ALERTA}' as alerta,
        '${TIPO_ALERTA}' as tipoAlerta,
        '${modelConfig.sigla}' as fonte,
        '${ICONE}' as icone
      FROM
        ${modelConfig.get('VW_PEP')} as p
      WHERE
        p.CPF = @CPF
      ORDER BY p.ANO
    `)
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
