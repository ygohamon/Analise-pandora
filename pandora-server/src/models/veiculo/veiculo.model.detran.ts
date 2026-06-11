
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

import { fixCpfCnpj } from '.';

const modelConfig = getModelConfig('BD_DETRAN');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['bd_detran.veiculo'].fonte;
const rank = MODEL_PRIORITY['bd_detran.veiculo'].rank;
const grupo = MODEL_PRIORITY['bd_detran.veiculo'].grupo;

const ATRIBUTOS_DETALHADO = `
Placa as placa,
Chassi as chassi,
Renavam as renavam,
Ano_Fabricacao as anoFab,
Ano_Modelo as anoMod,
V.Municipio as municipio,
'PB' as uf,
Tipo_Veiculo as tipo,
Marca_Modelo as marcaModelo,
Cor as cor,
Especie as especie,
Combustivel as combustivel,
TRY_CAST(Ultima_Atualizacao AS DATE) as dataAtualizacao,
RESTRICAO_1 AS restricao_1,
RESTRICAO_2 AS restricao_2,
RESTRICAO_3 AS restricao_3,
RESTRICAO_4 AS restricao_4,
'completo' as tipoDado,
Ano_Licenciamento as anoRegistro,
'${modelConfig.sigla}' as fonte
`

export const getVeiculoDetalhadoCPF_BD_Detran = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj as cpf
            ,PF.Nome as nome

        FROM ${modelConfig.get('VEICULO')} V
          LEFT OUTER JOIN ${modelReceita.get('PF')} AS PF ON (V.CPF_CNPJ = PF.CPF)
        WHERE cpf_cnpj=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoCNPJ_BD_Detran = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj as cnpj
            ,PJ.RazaoSocial as razaoSocial
            ,PJ.RazaoSocial as nome

        FROM ${modelConfig.get('VEICULO')} V
          LEFT OUTER JOIN ${modelReceita.get('PJ')} AS PJ ON (V.cpf_cnpj = PJ.CNPJ)
        WHERE cpf_cnpj=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoChassi_BD_Detran = function(chassi: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CHASSI', ISql.VarChar, chassi],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
        WHERE CHASSI=@CHASSI
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoRenavam_BD_Detran = function(renavam: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RENAVAM', ISql.VarChar, renavam],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
        WHERE RENAVAM=@RENAVAM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoPlaca_BD_Detran = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
        WHERE PLACA=@PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoPlaca_LIKE_BD_Detran = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj
            , TRIM(Proprietario) as nome
        FROM ${modelConfig.get('VEICULO')} V
        WHERE PLACA LIKE @PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoNome_BD_Detran = function(nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,PF.Nome as nome
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
          INNER JOIN ${modelReceita.get('PF')} AS PF ON (V.cpf_cnpj = PF.CPF)
        WHERE CONTAINS(Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};
