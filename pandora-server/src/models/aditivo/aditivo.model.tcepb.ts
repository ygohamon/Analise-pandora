
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['tcepb.aditivo'].fonte;
const rank  = MODEL_PRIORITY['tcepb.aditivo'].rank;
const grupo = MODEL_PRIORITY['tcepb.aditivo'].grupo;

const ATRIBUTOS_DETALHADO = `
  cod_unidade_gestora as cdGestora,
  cod_modalidade_licitacao as cdMdLicitacao,
  data_assinatura as dtAssinatura,
  data_publicacao as dtPublicacao,
  data_vigencia as dtVigencia,
  unidade_gestora as uGestora,
  modalidade_licitacao as mdLicitacao,
  numero_licitacao as nuLicitacao,
  tipo_aditivo as tpAditivo,
  numero_protocolo_aditivo as nuProtAditivo,
  numero_protocolo_contrato as nuProtContrato,
  numero_protocolo_licitacao as nuProtLicitacao,
  numero_contrato as nuContrato,
  nome_licitante as licitante,
  valor_aditivo as vlAditivo,
  valor_contrato as vlContrato,
  valor_homologado_licitacao as vlHomologado,
  valor_proposta_licitacao as vlProposta,
  valor_aditivo/valor_contrato as acrescimo,
  justificativa,
  '${modelConfig?.sigla}' as fonte,
`;

export let getAditivosMunicipalDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_ADITIVOS')}
        WHERE cpf_cnpj_licitante = @CNPJ
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAditivosEstadualDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_ADITIVOS')}
        WHERE cpf_cnpj_licitante = @CNPJ
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAditivosMunicipalDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'm' as esfera

        FROM ${modelConfig.get('SM_ADITIVOS')}
        WHERE cpf_cnpj_licitante = @CPF
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAditivosEstadualDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'e' as esfera

        FROM ${modelConfig.get('SE_ADITIVOS')}
        WHERE cpf_cnpj_licitante = @CPF
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAditivosMunicipalDetalhadoNuLicitacao = function (nuLicitacao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NULICITACAO', ISql.VarChar(14), nuLicitacao],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_ADITIVOS')}
        WHERE numero_licitacao = @NULICITACAO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getAditivosEstadualDetalhadoNuLicitacao = function (nuLicitacao: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NULICITACAO', ISql.VarChar(14), nuLicitacao],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_ADITIVOS')}
        WHERE numero_licitacao = @NULICITACAO
        ORDER BY nuLicitacao, dtAssinatura
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
