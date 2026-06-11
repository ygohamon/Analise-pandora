
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

import { fixVeiculoCPF_CNPJ } from '.';

const modelConfig = getModelConfig('BD_RENAVAM');

const fonte = MODEL_PRIORITY['renavam_2020'].fonte;
const rank  = MODEL_PRIORITY['renavam_2020'].rank;
const grupo = MODEL_PRIORITY['renavam_2020'].grupo;

const ATRIBUTOS = `
  IDENTIFICACAO_VEICULO AS chassi,
  PLACA_VEICULO AS placa,
  NUMERO_RENAVAM AS renavam,
  DS_SITUACAO AS situacao,
  NM_MUNICIPIO AS municipio,
  UNIDADE_FEDERACAO_JURISDICAO_VEICULO AS uf,
  DS_CODIGO_TIPO_VEICULO AS tipo,
  DS_MARCA_MODELO AS marcaModelo,
  DS_COR AS cor,
  ANO_FABRICACAO_VEICULO AS anoFab,
  ANO_MODELO_VEICULO AS anoMod,
  IDENTIFICACAO_PROPRIETARIO AS cpf_cnpjResponsavel,
  NOME_PROPRIETARIO AS responsavel,
  NOME_PROPRIETARIO AS nome,
  NOME_PROPRIETARIO AS proprietario,
  NOME_POSSUIDO AS possuidor,
  CONVERT(DATE, DATA_ATUALIZACAO_VEICULO, 103) AS dataAtualizacao,

  DS_RESTRICAO1 AS restricao_1,
  DS_RESTRICAO2 AS restricao_2,
  DS_RESTRICAO3 AS restricao_3,
  DS_RESTRICAO4 AS restricao_4,



  YEAR(CONVERT(DATE, DATA_ATUALIZACAO_VEICULO, 103)) AS anoRegistro,
  'completo' as tipoDado,
  '${modelConfig.sigla}' as fonte
`;

export const getVeiculoDetalhadoCPF_Renavam_2020 = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE IDENTIFICACAO_PROPRIETARIO = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoCNPJ_Renavam_2020 = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cnpj

        FROM ${modelConfig.get('RENAVAM')}
        WHERE IDENTIFICACAO_PROPRIETARIO=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoChassi_Renavam_2020 = function(chassi: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CHASSI', ISql.VarChar, chassi],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE IDENTIFICACAO_VEICULO=@CHASSI
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoRenavam_Renavam_2020 = function(renavam: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['RENAVAM', ISql.VarChar, renavam],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE NUMERO_RENAVAM=@RENAVAM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoPlaca_Renavam_2020 = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE PLACA_VEICULO = @PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoPlaca_LIKE_Renavam_2020 = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE PLACA_VEICULO LIKE '@PLACA'
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoNome_Renavam_2020 = function(nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS}
            ,IDENTIFICACAO_PROPRIETARIO as cpf

        FROM ${modelConfig.get('RENAVAM')}
        WHERE CONTAINS(NOME_PROPRIETARIO, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
