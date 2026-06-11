import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';

const modelConfig = getModelConfig('BD_CAGEPA');

const fonte = MODEL_PRIORITY['cagepa.email'].fonte;
const rank  = MODEL_PRIORITY['cagepa.email'].rank;
const grupo = MODEL_PRIORITY['cagepa.email'].grupo;

export let getEmailCPF_CAGEPA = function(cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf]
    ], `
      SELECT
        CASE WHEN c.cpf IS NOT NULL THEN c.cpf ELSE c.cpf_alimentado END AS cpf,
        LOWER(TRIM(c.email)) AS email,
        'email' AS tipo,
        '${modelConfig.sigla}' as fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      WHERE
        (c.cpf = @CPF OR c.cpf_alimentado = @CPF)
        AND (c.email IS NOT NULL AND c.email <> '')
      UNION
      SELECT
        CASE WHEN c.cpf IS NOT NULL THEN c.cpf ELSE c.cpf_alimentado END AS cpf,
        LOWER(TRIM(ce.email)) AS email,
        'email' AS tipo,
        '${modelConfig.sigla}' as fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_EMAIL')} AS ce ON ce.clie_id = c.clie_id
      WHERE
        (c.cpf = @CPF OR c.cpf_alimentado = @CPF);
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}

export let getEmailCNPJ_CAGEPA = function(cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj]
    ], `
      SELECT
        CASE WHEN c.cnpj IS NOT NULL THEN c.cnpj ELSE c.cnpj_alimentado END AS cnpj,
        LOWER(TRIM(c.email)) AS email,
        'email' AS tipo,
        '${modelConfig.sigla}' as fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      WHERE
        (c.cnpj = @CNPJ OR c.cnpj_alimentado = @CNPJ)
        AND (c.email IS NOT NULL AND c.email <> '')
      UNION
      SELECT
        CASE WHEN c.cnpj IS NOT NULL THEN c.cnpj ELSE c.cnpj_alimentado END AS cnpj,
        LOWER(TRIM(ce.email)) AS email,
        'email' AS tipo,
        '${modelConfig.sigla}' as fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_EMAIL')} AS ce ON ce.clie_id = c.clie_id
      WHERE
        (c.cnpj = @CNPJ OR c.cnpj_alimentado = @CNPJ);
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}
