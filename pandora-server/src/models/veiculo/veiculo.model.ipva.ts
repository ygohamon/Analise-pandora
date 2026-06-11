
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';
import { fixCpfCnpj } from '.';

const modelConfig = getModelConfig('BD_IPVA');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['ipva2019'].fonte;
const rank  = MODEL_PRIORITY['ipva2019'].rank;
const grupo = MODEL_PRIORITY['ipva2019'].grupo;

const ATRIBUTOS_DETALHADO = `
  nrPlaca as placa,
  nrChassi as chassi,
  nrRenavam as renavam,
  nrAnoFabricacao as anoFab,
  nrAnoModelo as anoMod,
  V.municipio,
  V.uf,
  dstipoveiculo as tipo,
  nomarcamodelo as marcaModelo,
  nocor as cor,
  dsespecieveiculo as especie,
  dstpcombustivel as combustivel,
  dtiniciopropried as dataInicioPosse,
  dtfinalpropried as dataFinalPosse,
  'completo' as tipoDado,
  '2022' as anoRegistro,
  '${modelConfig.sigla}' as fonte
`;

export const getVeiculoDetalhadoCPF_IPVA = function(cpf: string) {

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
          LEFT OUTER JOIN ${modelReceita.get('PF')} AS PF ON (V.cpf_cnpj = PF.CPF)
        WHERE cpf_cnpj=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoCNPJ_IPVA = function(cnpj: string) {

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

export const getVeiculoDetalhadoChassi_IPVA = function(chassi: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CHASSI', ISql.VarChar, chassi],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
        WHERE nrChassi=@CHASSI
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoRenavam_IPVA = function(renavam: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RENAVAM', ISql.VarChar, renavam],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,cpf_cnpj

        FROM ${modelConfig.get('VEICULO')} V
        WHERE nrRenavam=@RENAVAM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoPlaca_IPVA = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            , cpf_cnpj
            , Proprietario as nome
        FROM ${modelConfig.get('VEICULO')} V
        WHERE nrPlaca=@PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoPlaca_LIKE_IPVA = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            , cpf_cnpj
            , nome
        FROM ${modelConfig.get('VEICULO')} V
        WHERE nrPlaca LIKE @PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};

export const getVeiculoDetalhadoNome_IPVA = function(nome: string) {

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
        WHERE CONTAINS(PF.Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixCpfCnpj });
};
