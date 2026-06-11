
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['tcepb.contrato'].fonte;
const rank  = MODEL_PRIORITY['tcepb.contrato'].rank;
const grupo = MODEL_PRIORITY['tcepb.contrato'].grupo;

const ATRIBUTOS_DETALHADO = `
  cod_unidade_gestora_contrato as cdGestora,
  cod_modalidade_licitacao as cdMdLicitacao,
  unidade_gestora as uGestora,
  modalidade_licitacao as mdLicitacao,
  numero_licitacao as nuLicitacao,
  numero_regcge as nuRegcge,
  numero_contrato as nuContrato,
  numero_protocolo_contrato as nuProtContrato,
  numero_protocolo_licitacao as nuProtLicitacao,
  data_assinatura as dtAssinatura,
  data_publicacao as dtPublicacao,
  data_finalizacao as dtFinalizacao,
  valor_contratado as vlContratado,
  valor_proposta as vlProposta,
  licitante,
  UPPER(TRIM(descricao_contrato)) as descricao,
  '${modelConfig?.sigla}' as fonte,
`;

export let getContratosMunicipalDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_CONTRATOS')}
        WHERE cpf_cnpj_licitante = @CNPJ
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosEstadualDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_CONTRATOS')}
        WHERE cpf_cnpj_licitante = @CNPJ
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosMunicipalDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'm' as esfera

        FROM ${modelConfig.get('SM_CONTRATOS')}
        WHERE cpf_cnpj_licitante = @CPF
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosEstadualDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'e' as esfera

        FROM ${modelConfig.get('SE_CONTRATOS')}
        WHERE cpf_cnpj_licitante = @CPF
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosMunicipalDetalhadoNuContrato = function (nuContrato: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NUCONTRATO', ISql.VarChar(14), nuContrato],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_CONTRATOS')}
        WHERE numero_contrato = @NUCONTRATO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosEstadualDetalhadoNuContrato = function (nuContrato: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NUCONTRATO', ISql.VarChar(14), nuContrato],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_CONTRATOS')}
        WHERE numero_contrato = @NUCONTRATO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosMunicipalDetalhadoNuLicitacao = function (nuLicitacao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NULICITACAO', ISql.VarChar(14), nuLicitacao],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_CONTRATOS')}
        WHERE numero_licitacao = @NULICITACAO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContratosEstadualDetalhadoNuLicitacao = function (nuLicitacao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NULICITACAO', ISql.VarChar(14), nuLicitacao],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_CONTRATOS')}
        WHERE numero_licitacao = @NULICITACAO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
