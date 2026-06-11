import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelTipologiasTCE = getModelConfig('BD_TIPOLOGIAS_TCE');

const fonte_tce_pf   = MODEL_PRIORITY['tipologias.pf'].fonte;
const rank_tce_pf    = MODEL_PRIORITY['tipologias.pf'].rank;
const grupo_tce_pf   = MODEL_PRIORITY['tipologias.pf'].grupo;

const fonte_tce_pj   = MODEL_PRIORITY['tipologias.pj'].fonte;
const rank_tce_pj    = MODEL_PRIORITY['tipologias.pj'].rank;
const grupo_tce_pj   = MODEL_PRIORITY['tipologias.pj'].grupo;

export let getTipologiasPFSimplificadoTCEFinger_Tipologias = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  cpf = cpf.padStart(14, "0");

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), cpf],
    ], `
      SELECT DISTINCT
        [NM_TIPOLOGIA] AS tipologia
        , '${modelTipologiasTCE.sigla}' AS fonte
      FROM
        ${modelTipologiasTCE.get('PF')}
      WHERE CPF=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologiasTCE, {fonte: fonte_tce_pf, rank: rank_tce_pf, grupo: grupo_tce_pf });
}

export let getTipologiasPJSimplificadoTCEFinger_Tipologias = function (cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj]
    ], `
      SELECT DISTINCT
        Tipologia AS tipologia
        , '${modelTipologiasTCE.sigla}' AS fonte
      FROM
        ${modelTipologiasTCE.get('PJ')}
      WHERE CNPJ=@CNPJ
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologiasTCE, {fonte: fonte_tce_pj, rank: rank_tce_pj, grupo: grupo_tce_pj});
}

export let getTipologiasLicitacoesPFTCEFinger_Tipologias = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  cpf = cpf.padStart(14, "0");

  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), cpf]
    ], `
      SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
        cod_tipologia AS codigoTipologia,
        DESCRICAO AS tipologia,
        DETALHAMENTO AS detalhamentoTipologia,
        NR_PROTOCOLO_LICITACAO AS numeroProtocoloLicitacao,
        NR_PROTOCOLO_CONTRATO AS numeroProtocoloContrato,
        NR_PROTOCOLO_ADITIVO AS numeroProtocoloAditivo,
        'LIC' AS fonte
      FROM
        ${modelTipologiasTCE.get('LICITACOES')}
      WHERE CPF_CNPJ_LICITANTE=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologiasTCE, {fonte: fonte_tce_pf, rank: rank_tce_pf, grupo: grupo_tce_pf});
}

export let getTipologiasLicitacoesPJTCEFinger_Tipologias = function (cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj]
    ], `
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
        cod_tipologia AS codigoTipologia,
        DESCRICAO AS tipologia,
        DETALHAMENTO AS detalhamentoTipologia,
        NR_PROTOCOLO_LICITACAO AS numeroProtocoloLicitacao,
        NR_PROTOCOLO_CONTRATO AS numeroProtocoloContrato,
        NR_PROTOCOLO_ADITIVO AS numeroProtocoloAditivo,
        'LIC' AS fonte
      FROM
        ${modelTipologiasTCE.get('LICITACOES')}
      WHERE CPF_CNPJ_LICITANTE=@CNPJ
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologiasTCE, {fonte: fonte_tce_pj, rank: rank_tce_pj, grupo: grupo_tce_pj});
}
