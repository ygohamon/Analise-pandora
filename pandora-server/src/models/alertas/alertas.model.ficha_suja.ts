import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao, resultFoundRaw } from './../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_FICHA_SUJA');

const fnChecaTemResultado = (r) => r.length !== 0;
const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY['alertas.ficha_suja'].fonte;
const rank  = MODEL_PRIORITY['alertas.ficha_suja'].rank;
const grupo = MODEL_PRIORITY['alertas.ficha_suja'].grupo;

const DESCRICAO_ALERTA = 'Ficha Suja';
const TIPO_ALERTA = 'danger';
const ICONE = 'fa fa-minus-square';

export let getAlertaPessoaFichaSujaCPF_BD_FICHA_SUJA = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf]
    ],`
    SELECT TOP 1
      '${DESCRICAO_ALERTA}' as alerta,
      '${TIPO_ALERTA}' as tipoAlerta,
      '${modelConfig.sigla}' as fonte,
      '${ICONE}' as icone
    FROM
      ${modelConfig.get('ELEITORAL_FS')} as fs
    WHERE
        fs.cpf = @CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnChecaTemResultado, fnRetorno });
}
