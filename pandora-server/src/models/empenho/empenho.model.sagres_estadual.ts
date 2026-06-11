
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte   = MODEL_PRIORITY['tcepb.empenhos.estadual'].fonte;
const rank    = MODEL_PRIORITY['tcepb.empenhos.estadual'].rank;
const grupo   = MODEL_PRIORITY['tcepb.empenhos.estadual'].grupo;


const ATRIBUTOS_EMPENHO_DETALHADO = `
  ano_emissao as anoEmpenho,
  CAST(data_emissao as date) as dtEmpenho,
  numero_empenho as nuEmpenho,
  CAST(REPLACE(valor_empenho, ',', '.') AS FLOAT) as vlEmpenho,
  TRIM(credor) as nome,
  TRIM(unidade_gestora) as uGestora,
  TRIM(unidade_orcamentaria) as uOrcamentaria,
  numero_licitacao as nuLicitacao,
  modalidade_licitacao as mdLicitacao,
  elemento_despesa as elDespesa,
  subelemento_despesa as subelDespesa,
  funcao AS clFuncao,
  sub_funcao as clSubFuncao,
  categoria_economica as clCategoriaEconomica,
  TRIM(UPPER(historico)) as descricao,
  '${modelConfig?.sigla}' as fonte,
`;

export let getEmpenhosDetalhadoCPF_BD_SAGRES_SE = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_EMPENHO_DETALHADO}
            'em' as tipo,
            'e' as esfera,
            RIGHT(cpf_cnpj_credor, 11) as cpf

        FROM ${modelConfig.get('SE_EMPENHOS')}
        WHERE cpf_cnpj_credor=@CPF
        ORDER BY data_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpenhosDetalhadoCNPJ_BD_SAGRES_SE = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_EMPENHO_DETALHADO}
            'em' as tipo,
            'e' as esfera,
            cpf_cnpj_credor as cnpj

        FROM ${modelConfig.get('SE_EMPENHOS')}
        WHERE cpf_cnpj_credor=@CNPJ
        ORDER BY data_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


const ATRIBUTOS_EMPENHO_PAGO_DETALHADO = `
  data_pagamento AS dtPagto,
  valor_pago AS vlPago,
  fonte_recurso AS fonteRecurso,
  cheque_emitido AS cheque,
  cod_banco AS cdBanco,
  agencia AS agencia,
  numero_conta AS numConta,
  ${ATRIBUTOS_EMPENHO_DETALHADO}
`

export let getEmpenhoPagoDetalhadoCPF_BD_SAGRES_SE = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_EMPENHO_PAGO_DETALHADO}
            'pg' as tipo,
            'e' as esfera,
            RIGHT(cpf_cnpj_credor, 11) as cpf

        FROM ${modelConfig.get('SE_EMPENHOS_PAGOS')}
        WHERE cpf_cnpj_credor=@CPF
        ORDER BY data_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpenhoPagoDetalhadoCNPJ_BD_SAGRES_SE = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_EMPENHO_PAGO_DETALHADO}
            'pg' as tipo,
            'e' as esfera,
            cpf_cnpj_credor as cnpj

        FROM ${modelConfig.get('SE_EMPENHOS_PAGOS')}
        WHERE cpf_cnpj_credor=@CNPJ
        ORDER BY data_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

const ATRIBUTOS_ANUALIZADO = `
  unidade_gestora AS unidadeGestora,
  ano_emissao AS dtAno,
  SUM(valor_empenho) AS vEmpenho,
  SUM(valor_pago) AS vPagto,
  count(*) AS qtd,
  '${modelConfig?.sigla}' as fonte
`

export let getEmpenhoPagoAnualizadoSimplificadoCPF_BD_SAGRES_SE = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_ANUALIZADO}

        FROM ${modelConfig.get('SE_EMPENHOS_PAGOS')}
        WHERE cpf_cnpj_credor = @CPF
        GROUP BY unidade_gestora, ano_emissao
        ORDER BY ano_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpenhoPagoAnualizadoSimplificadoCNPJ_BD_SAGRES_SE = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_ANUALIZADO}

        FROM ${modelConfig.get('SE_EMPENHOS_PAGOS')}
        WHERE cpf_cnpj_credor = @CNPJ
        GROUP BY unidade_gestora, ano_emissao
        ORDER BY ano_emissao DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
