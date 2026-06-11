
import { db, ISql } from './../../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../../utils';
const modelSagres = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['tcepb.empenhos.estadual'].fonte;
const rank = MODEL_PRIORITY['tcepb.empenhos.estadual'].rank;
// const grupo = MODEL_PRIORITY['tcepb.empenhos.estadual'].grupo;

export const getModalidadesCNPJ_Sagres_Estadual = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ano_emissao as dataAno,
            cod_modalidade_licitacao as tpLicitacao,
            modalidade_licitacao as deLicitacao,
            COUNT(DISTINCT CONCAT(numero_licitacao, numero_empenho)) as qtd

        FROM ${modelSagres.get('SE_EMPENHOS_PAGOS')}

        WHERE cpf_cnpj_credor = @CNPJ
        GROUP BY ano_emissao, cod_modalidade_licitacao, modalidade_licitacao
        ORDER BY ano_emissao, cod_modalidade_licitacao
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, { fonte, rank, grupo: 'modalidadesestadual' });
};

export const getValoresModalidadesCNPJ_Sagres_Estadual = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ano_emissao as dataAno,
            cod_modalidade_licitacao as tpLicitacao,
            modalidade_licitacao as deLicitacao,
            SUM(valor_empenho) AS vlEmpenho,
            SUM(valor_pago) as vlPagamento

          FROM ${modelSagres.get('SE_EMPENHOS_PAGOS')}

          WHERE cpf_cnpj_credor = @CNPJ
          GROUP BY ano_emissao, cod_modalidade_licitacao, modalidade_licitacao
          ORDER BY ano_emissao, cod_modalidade_licitacao
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, { fonte, rank, grupo: 'valoresestadual' });
};

export const getTotalEmpenhadoPagoCNPJ_Sagres_Estadual = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            MIN(ano_emissao) as anoPrimeiroEmpenho,
            MAX(ano_emissao) as anoUltimoEmpenho,
            SUM(valor_empenho) as totalEmpenho,
            SUM(valor_pago) as totalPago

        FROM ${modelSagres.get('SE_EMPENHOS_PAGOS')}
        WHERE cpf_cnpj_credor = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, { fonte, rank, grupo: 'totalempenhoestadual' });
};

export const getTopEmpenhosPagosCNPJ_Sagres_Estadual = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        SELECT TOP 5
            UPPER(unidade_gestora) as uGestora,
            LEFT(data_pagamento, 4) as dataAno,
            valor_pago as vlPagamento,
            UPPER(historico) as descricao

        FROM ${modelSagres.get('SE_EMPENHOS_PAGOS')}

        WHERE cpf_cnpj_credor = @CNPJ
        ORDER BY vlPagamento DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, { fonte, rank, grupo: 'topempenhoestadual' });
};
