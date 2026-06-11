
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_BENEFICIOS');

const fonte = MODEL_PRIORITY['cartao_alimentacao_pb'].fonte;
const rank  = MODEL_PRIORITY['cartao_alimentacao_pb'].rank;
const grupo = MODEL_PRIORITY['cartao_alimentacao_pb'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CIDADE as cidade
  ,NIS_BENEFICIARIO as nis
  ,NOME_BENEFICIARIO as nome
  ,NOME_RESPONSAVEL as responsavel
  ,CPF_RESPONSAVEL as cpf
  ,FONE_CONTATO as fone
  ,ENDERECO
  ,RG_RESPONSAVEL
  ,'cartao_alimentacao_pb' as tipo
`;

export let getCartaoAlimentacaoPBCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CARTAO_ALIMENTACAO_PB')}
        WHERE CPF_RESPONSAVEL=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getCartaoAlimentacaoPBNIS = function (nis: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NIS', ISql.VarChar, nis],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CARTAO_ALIMENTACAO_PB')}
        WHERE NIS_BENEFICIARIO=@NIS
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
