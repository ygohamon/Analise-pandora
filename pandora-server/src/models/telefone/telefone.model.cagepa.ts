import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CAGEPA');

const fonte = MODEL_PRIORITY['cagepa.telefone'].fonte;
const rank  = MODEL_PRIORITY['cagepa.telefone'].rank;
const grupo = MODEL_PRIORITY['cagepa.telefone'].grupo;

export let getTelefoneCPF_CAGEPA = function(cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf]
    ], `
      SELECT
        CASE WHEN c.cpf IS NOT NULL THEN c.cpf ELSE c.cpf_alimentado END AS cpf,
        TRIM(c.cliente) AS nome,
        ct.ddd,
        ct.num_telefone AS telefone,
        ct.ramal,
        ct.tipo,
        '${modelConfig?.sigla}' AS fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_TELEFONE')} AS ct ON ct.clie_id = c.clie_id
      WHERE
        c.cpf = @CPF OR c.cpf_alimentado = @CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}

export let getTelefoneCNPJ_CAGEPA = function(cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj]
    ], `
      SELECT
        CASE WHEN c.cnpj IS NOT NULL THEN c.cnpj ELSE c.cnpj_alimentado END AS cnpj,
        TRIM(c.cliente) AS nome,
        ct.ddd,
        ct.num_telefone AS telefone,
        ct.ramal,
        ct.tipo,
        '${modelConfig?.sigla}' AS fonte
      FROM
        ${modelConfig.get('CGP_CLIENTES')} AS c
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_TELEFONE')} AS ct ON ct.clie_id = c.clie_id
      WHERE
        c.cnpj = @CNPJ OR c.cnpj_alimentado = @CNPJ
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}
