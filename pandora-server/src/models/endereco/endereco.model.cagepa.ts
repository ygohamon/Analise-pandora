import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CAGEPA');

const fonte = MODEL_PRIORITY['cagepa.endereco'].fonte;
const rank  = MODEL_PRIORITY['cagepa.endereco'].rank;
const grupo = MODEL_PRIORITY['cagepa.endereco'].grupo;

const PF_ATRIBUTOS_SIMPLIFICADO = `
  CASE WHEN c.cpf IS NOT NULL THEN c.cpf ELSE c.cpf_alimentado END AS cpf,
  TRIM(c.cliente) AS nome,
  TRIM(i.endereco_tipo_logradouro) AS tipoLogradouro,
  TRIM(i.endereco_logradouro) AS logradouro,
  CASE WHEN TRY_CAST(i.endereco_numero as int) IS NULL THEN 0 ELSE CAST(i.endereco_numero as int) END AS numero,
  TRIM(i.endereco_complemento) AS complemento,
  TRIM(i.endereco_bairro) AS bairro,
  i.endereco_cep AS cep,
  i.endereco_municipio AS municipio,
  i.coord_y_imovel AS lat,
  i.coord_x_imovel AS lng,
  '${modelConfig?.sigla}' AS fonte
`;

const PJ_ATRIBUTOS_SIMPLIFICADO = `
  CASE WHEN c.cnpj IS NOT NULL THEN c.cnpj ELSE c.cnpj_alimentado END AS cnpj,
  TRIM(c.cliente) AS razaoSocial,
  TRIM(i.endereco_tipo_logradouro) AS tipoLogradouro,
  TRIM(i.endereco_logradouro) AS logradouro,
  CASE WHEN TRY_CAST(i.endereco_numero as int) IS NULL THEN 0 ELSE CAST(i.endereco_numero as int) END AS numero,
  TRIM(i.endereco_complemento) AS complemento,
  TRIM(i.endereco_bairro) AS bairro,
  i.endereco_cep AS cep,
  i.endereco_municipio AS municipio,
  i.coord_y_imovel AS lat,
  i.coord_x_imovel AS lng,
  '${modelConfig?.sigla}' AS fonte
`;

export let getEnderecoCPF_BD_CAGEPA = function (cpf: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf]
    ],
    ` SELECT
        CASE WHEN c.cpf IS NOT NULL THEN c.cpf ELSE c.cpf_alimentado END AS cpf,
        TRIM(c.cliente) AS nome,
        TRIM(ce.endereco_tipo_logradouro) AS tipoLogradouro,
        TRIM(ce.endereco_logradouro) AS logradouro,
        CASE WHEN TRY_CAST(ce.endereco_numero as int) IS NULL THEN 0 ELSE CAST(ce.endereco_numero as int) END AS numero,
        TRIM(ce.endereco_complemento) AS complemento,
        TRIM(ce.endereco_bairro) AS bairro,
        ce.endereco_cep AS cep,
        ce.endereco_municipio AS municipio,
        0 AS lat,
        0 AS lng,
        '${modelConfig?.sigla}' AS fonte
      FROM
        ${modelConfig.get('CGP_CLIENTE_ENDERECO')} AS ce
      INNER JOIN ${modelConfig.get('CGP_CLIENTES')} AS c ON c.clie_id = ce.clie_id
      WHERE
        c.cpf = @CPF OR c.cpf_alimentado = @CPF
      UNION
      SELECT
        ${PF_ATRIBUTOS_SIMPLIFICADO}
      FROM
        ${modelConfig.get('CGP_IMOVEL')} AS i
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_IMOVEL')} AS ci ON ci.matricula_imovel = i.matricula_imovel
      INNER JOIN ${modelConfig.get('CGP_CLIENTES')} AS c ON c.clie_id = ci.clie_id
      WHERE
        c.cpf = @CPF OR c.cpf_alimentado = @CPF;
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}

export let getEnderecoCNPJ_BD_CAGEPA = function (cnpj: string) {
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj]
    ],
    ` SELECT
        CASE WHEN c.cnpj IS NOT NULL THEN c.cnpj ELSE c.cnpj_alimentado END AS cnpj,
        TRIM(c.cliente) AS nome,
        TRIM(ce.endereco_tipo_logradouro) AS tipoLogradouro,
        TRIM(ce.endereco_logradouro) AS logradouro,
        CASE WHEN TRY_CAST(ce.endereco_numero as int) IS NULL THEN 0 ELSE CAST(ce.endereco_numero as int) END AS numero,
        TRIM(ce.endereco_complemento) AS complemento,
        TRIM(ce.endereco_bairro) AS bairro,
        ce.endereco_cep AS cep,
        ce.endereco_municipio AS municipio,
        0 AS lat,
        0 AS lng,
        '${modelConfig?.sigla}' AS fonte
      FROM
        ${modelConfig.get('CGP_CLIENTE_ENDERECO')} AS ce
      INNER JOIN ${modelConfig.get('CGP_CLIENTES')} AS c ON c.clie_id = ce.clie_id
      WHERE
        c.cnpj = @CNPJ OR c.cnpj_alimentado = @CNPJ
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
        ${PJ_ATRIBUTOS_SIMPLIFICADO}
      FROM
        ${modelConfig.get('CGP_IMOVEL')} AS i
      INNER JOIN ${modelConfig.get('CGP_CLIENTE_IMOVEL')} AS ci ON ci.matricula_imovel = i.matricula_imovel
      INNER JOIN ${modelConfig.get('CGP_CLIENTES')} AS c ON c.clie_id = ci.clie_id
      WHERE
        c.cnpj = @CNPJ OR c.cnpj_alimentado = @CNPJ;
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte, rank: rank, grupo: grupo });
}
