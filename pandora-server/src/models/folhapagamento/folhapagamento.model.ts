
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['tcepb.folha'].fonte;
const rank  = MODEL_PRIORITY['tcepb.folha'].rank;
const grupo = MODEL_PRIORITY['tcepb.folha'].grupo;


const ATRIBUTOS = `
  nome_servidor as nome,
  cpf_servidor as cpf,
  matricula,
  cargo,
  poder,
  vinculo,
  valor_remuneracao_total as vlBruto,
  data_admissao as dtAdmissao,
  '${modelConfig.sigla}' as fonte
`

export let getFolhaMunicipalMesAnoCdOrgao = function (cdorgao: string, orgao: string, mes: string, ano: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['ANO', ISql.Int, ano],
      ['MES', ISql.Int, mes],
      ['CDORGAO', ISql.Int, cdorgao],
      ],`
        SELECT
          ${ATRIBUTOS}
        FROM ${modelConfig.get('SM_FOLHAPAGAMENTO')}
        WHERE cod_orgao = @CDORGAO AND ano = @ANO and mes = @MES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getFolhaEstadualMesAnoCdOrgao = function (cdorgao: string, orgao: string, mes: string, ano: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['ANO', ISql.Int, ano],
      ['MES', ISql.Int, mes],
      ['CDORGAO', ISql.Int, cdorgao],
      ],`
        SELECT
          ${ATRIBUTOS}
        FROM ${modelConfig.get('SE_FOLHAPAGAMENTO')}
        WHERE cod_orgao = @CDORGAO AND ano = @ANO and mes = @MES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
