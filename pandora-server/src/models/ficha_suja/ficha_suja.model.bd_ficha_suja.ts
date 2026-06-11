import { db, ISql } from '../../services/db.service';
import { resultFoundRaw, modelFactory as mf, getNomeFuncao  } from '../../utils';
import { getModelConfig } from '../../config.models';

import { MODEL_PRIORITY } from './../../config';

const modelConfig = getModelConfig('BD_FICHA_SUJA');

const fonte  = MODEL_PRIORITY['ficha_suja'].fonte;
const rank   = MODEL_PRIORITY['ficha_suja'].rank;
const grupo  = MODEL_PRIORITY['ficha_suja'].grupo;

const ATRIBUTOS = `
  fs.nome_orgao AS orgao,
  CASE
    WHEN fs.esfera = 'M' THEN 'Municipal'
    WHEN fs.esfera = 'E' THEN 'Estadual'
    WHEN fs.esfera = 'F' THEN 'Federal'
    WHEN fs.esfera = 'D' THEN 'Distrital'
  END AS esfera,
  fs.numero_processo AS processo,
  TRY_CAST(fs.data_processo as date) AS dtprocesso,
  fs.nome_requerido AS nome,
  fs.cpf AS cpf,
  fs.rg AS rg,
  fs.titulo_eleitoral AS titulo_eleitoral,
  fs.cargo AS cargo,
  fs.registro_profissional AS registro_profissional,
  TRY_CAST(fs.data_nascimento as date) AS data_nascimento,
  fs.nome_mae AS mae,
  TRY_CAST(fs.data_julgamento as date) AS data_julgamento,
  TRY_CAST(fs.data_condenacao_inicio as date) AS dt_inicio_condenacao,
  TRY_CAST(fs.data_condenacao_fim as date) AS dt_final_condenacao,
  CASE
    WHEN fs.exclusao_suspensa = 'S' THEN 'Sim'
    WHEN fs.exclusao_suspensa = 'N' THEN 'Não'
    ELSE ''
  END AS exclusao_suspensa,
  TRY_CAST(fs.data_suspensao as date) AS data_suspensao,
  fs.assunto_resumo_deliberacao,
  fs.detalhe_processo,
  fs.partido,
  fs.uf_mandato,
  fs.perda_mandato_renuncia,
  fs.observacoes
`;

/**
 * Busca pessoa na base BD_FICHA_SUJA por CPF
 *
 * @param cpf String
 * @returns
 */
export let getPessoaFichaSujaCPF_BD_Ficha_Suja = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const fnRetorno = resultFoundRaw;
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf]
    ], `
      SELECT
        ${ATRIBUTOS}
      FROM
        ${modelConfig.get('ELEITORAL_FS')} fs
      WHERE
        fs.cpf=@CPF
    `);
  }


  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnRetorno });
}

/**
 * Busca pessoa na base BD_FICHA_SUJA por RG
 *
 * @param rg String
 * @returns
 */
export let getPessoaFichaSujaRG_BD_Ficha_Suja = function (rg: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RG', ISql.Char(11), rg]
    ], `
      SELECT
        ${ATRIBUTOS}
      FROM
        ${modelConfig.get('ELEITORAL_FS')} fs
      WHERE
        fs.rg=@RG
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

/**
 * Busca pessoa na base BD_FICHA_SUJA por Nome
 *
 * @param nome string
 * @returns
 */
export let getPessoaFichaSujaNome_BD_Ficha_Suja = function (nome: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT
          ${ATRIBUTOS}
        FROM
          ${modelConfig.get('ELEITORAL_FS')} fs
        WHERE
          CONTAINS(fs.nome_requerido, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

/**
 * Busca pessoa na base BD_FICHA_SUJA por Nome da Mãe
 *
 * @param nomeMae string
 * @returns
 */
export let getPessoaFichaSujaNomeMae_BD_Ficha_Suja = function (nomeMae: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEMAE', ISql.VarChar, nomeMae],
      ],`
        SELECT
          ${ATRIBUTOS}
        FROM
          ${modelConfig.get('ELEITORAL_FS')} fs
        WHERE
          CONTAINS(fs.nome_mae, @NOMEMAE)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
