
import { db, ISql } from '../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

import { fixVeiculoCPF_CNPJ } from '.';

const modelConfig = getModelConfig('BD_SISPESQUISA_RENACH');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['sispesquisa.veiculos_novo'].fonte;
const rank = MODEL_PRIORITY['sispesquisa.veiculos_novo'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.veiculos_novo'].grupo;

const ATRIBUTOS_DETALHADO = `
  PLACA as placa,
  CHASSI as chassi, TIPO_CHASSI as tipoChassi,
  RENAVAM as renavam,
  Ano_Fabricacao as anoFab, ANO_MOD as anoMod,
  Descricao_Tipo as tipo,
  Descricao_Marca_Modelo as marcaModelo,
  Categoria as especie, Especie as procedencia,
  COMBUSTIVEL as combustivel,
  Ultimo_Ano_Licenciamento as
  ultLicenciamento,
  Restricao_Gravame as situacao,
  Restricao_Tributaria as observacao,
  Restricao_Judicial as restricao,
  Restricao_Adm as restricao_,
  'completo' as tipoDado,
  CASE
      WHEN isdate(Dt_Ultima_Atualizacao) = 1 THEN cast(Dt_Ultima_Atualizacao as date)
      ELSE NULL
  END AS dataAtualizacao,
  '${modelConfig.sigla}' as fonte
`

export const getVeiculoDetalhadoCPF_Sispesquisa_VeiculosNovo = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cpf
            ,PF.Nome as nome

        FROM ${modelConfig.get('VEICULO')} V
          LEFT OUTER JOIN ${modelReceita.get('PF')} AS PF ON (V.CPF_CNPJ_Proprietario = PF.CPF)
        WHERE CPF_CNPJ_Proprietario=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoCNPJ_Sispesquisa_VeiculosNovo = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cnpj
            ,PJ.RazaoSocial as razaoSocial
            ,PJ.RazaoSocial as nome

        FROM ${modelConfig.get('VEICULO')} V
          LEFT OUTER JOIN ${modelReceita.get('PJ')} AS PJ ON (V.CPF_CNPJ_Proprietario = PJ.CNPJ)
        WHERE CPF_CNPJ_Proprietario=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoChassi_Sispesquisa_VeiculosNovo = function(chassi: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CHASSI', ISql.VarChar, chassi],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cpf

        FROM ${modelConfig.get('VEICULO')}
        WHERE CHASSI=@CHASSI
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getVeiculoDetalhadoRenavam_Sispesquisa_VeiculosNovo = function(renavam: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RENAVAM', ISql.VarChar, renavam],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cpf

        FROM ${modelConfig.get('VEICULO')}
        WHERE RENAVAM=@RENAVAM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoPlaca_Sispesquisa_VeiculosNovo = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cpf

        FROM ${modelConfig.get('VEICULO')}
        WHERE PLACA=@PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoPlaca_LIKE_Sispesquisa_VeiculosNovo = function(placa: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['PLACA', ISql.VarChar, placa],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,CPF_CNPJ_Proprietario as cpf,
            nome_proprietario as nome

        FROM ${modelConfig.get('VEICULO')}
        WHERE PLACA LIKE @PLACA
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};

export const getVeiculoDetalhadoNome_Sispesquisa_VeiculosNovo = function(nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
            ,PF.Nome as nome
            ,CPF_CNPJ_Proprietario as cpf

        FROM ${modelConfig.get('VEICULO')} V
          INNER JOIN ${modelReceita.get('PF')} AS PF ON (V.CPF_CNPJ_Proprietario = PF.CPF)
        WHERE CONTAINS(Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados: fixVeiculoCPF_CNPJ });
};
