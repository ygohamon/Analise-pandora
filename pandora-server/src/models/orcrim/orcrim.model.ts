import { db, ISql } from '../../services/db.service';
import { getModelConfig } from "../../config.models";
import { MODEL_PRIORITY } from "../../config";

import {
  getNomeFuncao,
  modelFactory as mf,
  resultFoundRaw,
} from "../../utils";

const modelConfig = getModelConfig("BD_ORCRIM");

const fnRetorno = resultFoundRaw;

const fonte = MODEL_PRIORITY["bd_orcrim"].fonte;
const rank = MODEL_PRIORITY["bd_orcrim"].rank;
const grupo = MODEL_PRIORITY["bd_orcrim"].grupo;

/**
 * Retorna as Organizações Criminosas do Tipo 2 - Facção
 * @returns
 */
export let getOrganizacaoCriminosas_HIRI = function () {
  const nomeFuncao = getNomeFuncao(1, 2);

  const query = () => {
    return db.query([],
    `
    SELECT
      h.conjunto_especifico AS sigla,
      UPPER(h.descricao_breve) AS organizacao
    FROM
      ${modelConfig.get('HIRI')} AS h
    INNER JOIN ${modelConfig.get('CATEGORIA_ORCRIM')} AS cat ON cat.conjunto_especifico = h.conjunto_especifico
    WHERE
    cat.ID_CATEGORIA = 2
      AND h.descricao_breve <> ''
    ORDER BY h.descricao_breve
    `);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {fonte, rank, grupo });
}

/**
 *
 * @param organizacaoCriminosa
 * @returns
 */
export let getDadosOrganizacaoCriminosa_HIRI = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa],
    ], `
      SELECT
        descricao_breve as organizacao, TRIM(descricao_expandida) as descricao
      FROM
        ${modelConfig.get('HIRI')}
      WHERE
        conjunto_especifico = @FACCAO
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo: 'organizacao_criminosa' });
}

export let getMembrosOrganizacaoCriminosa = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa],
    ], `
    SELECT
        f.CPF AS cpf,
        f.NOME AS nome
    FROM
        ${modelConfig.get('FACCIONADOS')} AS f
    WHERE
        f.CONJUNTO_ESPECIFICO = @FACCAO
        AND f.CPF IS NOT NULL;
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo: 'membros_organizacao_criminosa' });
}

export let getAdvogadosInternosOrganizacaoCriminosa = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa],
    ], `
      SELECT
        CASE WHEN CPF IS NOT NULL THEN CPF ELSE cpf_alimentado END AS cpf_advogado,
        UPPER(ADVOGADO) AS nome_advogado,
        OAB_NUMERO AS numero_oab,
        OAB_UF AS uf_oab,
        CPF_ALIMENTADO AS cpf_membro,
        UPPER(INTERNO) AS nome_membro
      FROM
        ${modelConfig.get('QTD_ADVOGADO')}
      WHERE
        conjunto_especifico = @FACCAO
        AND CPF IS NOT NULL
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo: 'advogados_internos' });
}


export let getQuantidadeMembrosFaccaoPorUnidadePrisional = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa]
    ], `
    SELECT
      UPPER(unidadePrisional) AS unidadePrisional,
      faccao,
      UPPER(faccionado) AS faccionado,
      cpf
    FROM
      ${modelConfig.get('QTD_UNIDADE')}
    WHERE
      CONJUNTO_ESPECIFICO = @FACCAO
      AND cpf IS NOT NULL
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {fonte, rank, grupo: 'faccionados_unidade_prisional', fnRetorno});
}

export let getTopAdvogadosFaccionados = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa]
    ], `
    SELECT
      CPF_ADVOGADO AS cpf_advogado,
      UPPER(ADVOGADO) AS nome_advogado,
      OAB_NUMERO AS numero_oab,
      OAB_UF AS uf_oab,
      CPF_INTERNO AS cpf_interno,
      UPPER(INTERNO) AS nome_interno,
      UPPER(UNIDADE_PRISIONAL) AS unidade_prisional,
      CIDADE_UNIDADE_PRISIONAL AS cidade_unidade_prisional,
      DATA_ATENDIMENTO AS data_visita
    FROM
      ${modelConfig.get('TOP_ADV')}
    WHERE
      SIGLA = @FACCAO
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {fonte, rank, grupo: 'top_advogados', fnRetorno});
}

export let getTopVisitasFaccionados = function (organizacaoCriminosa: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['FACCAO', ISql.VarChar, organizacaoCriminosa]
    ], `
    SELECT
      CPF_VISITA AS cpf_visitante,
      UPPER(VISITA) AS nome_visitante,
      GRAU_PARENTESCO AS parentesco,
      CPF_INTERNO AS cpf_membro,
      UPPER(INTERNO) AS nome_membro,
      UPPER(UNIDADE_PRISIONAL) AS unidade_prisional,
      DATA AS data_visita,
      HORARIO AS horario_visita
    FROM
      ${modelConfig.get('TOP_VISITAS')}
    WHERE
      SIGLA = @FACCAO
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, {fonte, rank, grupo: 'top_visitas', fnRetorno});
}
