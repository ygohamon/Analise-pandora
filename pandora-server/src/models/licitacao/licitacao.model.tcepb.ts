
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['tcepb.licitacao'].fonte;
const rank  = MODEL_PRIORITY['tcepb.licitacao'].rank;
const grupo = MODEL_PRIORITY['tcepb.licitacao'].grupo;

const ATRIBUTOS_DETALHADO = `
  cod_unidade_gestora as cdGestora,
  unidade_gestora as uGestora,
  YEAR(data_homologacao) as dtAno,
  cod_modalidade_licitacao as cdMdLicitacao,
  modalidade_licitacao as mdLicitacao,
  numero_licitacao as nuLicitacao,
  numero_protocolo as nuProtocolo,
  CAST(data_homologacao as date) as dtHomologacao,
  CAST(REPLACE(valor_homologacao, ',', '.') as float) as vlHomologacao,
  CAST(REPLACE(valor_estimado, ',', '.') as float) as vlEstimado,
  CAST(REPLACE(valor_proposta, ',', '.') as float) as vlProposta,
  nome_licitante as licitante,
  situacao as situacaoProposta,
  tipo_objeto as tpObjeto,
  objeto,
  '${modelConfig?.sigla}' as fonte,
`;

export let getLicitacoesMunicipalDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_LICITACOES')}
        WHERE cpf_cnpj_licitante = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getLicitacoesEstadualDetalhadoCNPJ = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_LICITACOES')}
        WHERE cpf_cnpj_licitante = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getLicitacoesMunicipalDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'm' as esfera

        FROM ${modelConfig.get('SM_LICITACOES')}
        WHERE cpf_cnpj_licitante = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getLicitacoesEstadualDetalhadoCPF = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT
            ${ATRIBUTOS_DETALHADO}
            RIGHT(cpf_cnpj_licitante, 11) as cpf,
            'e' as esfera

        FROM ${modelConfig.get('SE_LICITACOES')}
        WHERE cpf_cnpj_licitante = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getLicitacoesMunicipalDetalhadoDados = function (cdugestora: string, nulicitacao: string, cdmdlicitacaocao: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.VarChar(8), cdugestora],
      ['NUMLICITACAO', ISql.VarChar(12), nulicitacao],
      ['MODALIDADE', ISql.VarChar(8), cdmdlicitacaocao],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'm' as esfera

        FROM ${modelConfig.get('SM_LICITACOES')}
        WHERE cod_unidade_gestora = @CDUGESTORA
          AND numero_licitacao = @NUMLICITACAO
          AND cod_modalidade_licitacao = @MODALIDADE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getLicitacoesEstadualDetalhadoDados = function (cdugestora: string, nulicitacao: string, cdmdlicitacaocao: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CDUGESTORA', ISql.VarChar(8), cdugestora],
      ['NUMLICITACAO', ISql.VarChar(12), nulicitacao],
      ['MODALIDADE', ISql.VarChar(8), cdmdlicitacaocao],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            cpf_cnpj_licitante as cpfCnpj,
            'e' as esfera

        FROM ${modelConfig.get('SE_LICITACOES')}
        WHERE cod_unidade_gestora = @CDUGESTORA
          AND numero_licitacao = @NUMLICITACAO
          AND cod_modalidade_licitacao = @MODALIDADE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
