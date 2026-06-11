import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ORCRIM');

const fonte = MODEL_PRIORITY['alertas.orcrim'].fonte;
const rank  = MODEL_PRIORITY['alertas.orcrim'].rank;
const grupo = MODEL_PRIORITY['alertas.orcrim'].grupo;

const TIPO_ALERTA = 'danger';
const ICONE = 'fa fa-users';

export let getAlertaMembroOrganizacaoCriminosaCPF_BD_ORCRIM = function(cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP 1
          CONCAT('Possível envolvimento com organização criminosa(', UPPER(f.DESCRICAO_BREVE), '), para maiores detalhes contate a unidade de inteligência de sua instituição. ', UPPER(f.DESCRICAO_BREVE), ': ', h.descricao_expandida) as descOrcrim,
          'Org. Criminosa' as alerta,
          '${TIPO_ALERTA}' as tipoAlerta,
          '${modelConfig.sigla}' as fonte,
          '${ICONE}' as icone
        FROM
          ${modelConfig.get('FACCIONADOS')} as f
        INNER JOIN ${modelConfig.get('HIRI')} as h ON h.conjunto_especifico = f.CONJUNTO_ESPECIFICO
        WHERE
          f.CPF = @CPF;
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
