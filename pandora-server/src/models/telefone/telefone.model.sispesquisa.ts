
import { db, ISql } from '../../services/db.service';
import { getModelConfig } from '../../config.models';

import {
    MODEL_PRIORITY,
    API_CODES,
    API_CONFIG
} from './../../config';

import {
    logErroBuscaBD,
    modelFactory as mf,
    getNomeFuncao
} from '../../utils';

import { normalizaNumero } from '.';

const modelConfig = getModelConfig('BD_TELEFONE');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte   = MODEL_PRIORITY['sispesquisa.telefones'].fonte;
const rank    = MODEL_PRIORITY['sispesquisa.telefones'].rank;
const grupo   = MODEL_PRIORITY['sispesquisa.telefones'].grupo;

const fnProcessaDadosEncontrados = function (result) {
  return result
    .map(dado => {
      const processado = normalizaNumero('', dado.telefone);
      const {telefone, ...resto} = dado;
      if (typeof processado === 'object') {
        return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
      } else {
        return Object.assign(resto, {telefone: processado, ddd: ''})
      }
    })
}

export let getTelefoneCPF_Sispesquisa_Telefones = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.NVarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            T.cpf_cnpj as cpf, T.telefone, T.fonte, PF.nome as nome

        FROM ${modelConfig.get('TELEFONE')} T
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = T.cpf_cnpj)
        WHERE T.cpf_cnpj=@CPF
          AND T.telefone IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefoneCNPJ_Sispesquisa_Telefones = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.NVarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            T.cpf_cnpj as cnpj, T.telefone, T.fonte, PJ.RazaoSocial as razaoSocial

        FROM ${modelConfig.get('TELEFONE')} T
            LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = T.cpf_cnpj)
        WHERE T.cpf_cnpj=@CNPJ
          AND T.telefone IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefoneNome_Sispesquisa_Telefones = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.NVarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            T.cpf_cnpj as cpf, T.telefone, T.fonte, PF.nome as nome

        FROM ${modelConfig.get('TELEFONE')} T
            INNER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = T.cpf_cnpj)
        WHERE CONTAINS(PF.nome, @NOME)
          AND T.telefone IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefonePFTelefone_Sispesquisa_Telefones = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.NVarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            T.cpf_cnpj as cpf, T.telefone, T.fonte, PF.nome as nome

        FROM ${modelConfig.get('TELEFONE')} T
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = T.cpf_cnpj)
        WHERE T.telefone=@TELEFONE AND LEN(cpf_cnpj) = 11
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefonePJTelefone_Sispesquisa_Telefones = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.NVarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            T.cpf_cnpj as cnpj, T.telefone, T.fonte, PJ.RazaoSocial as razaoSocial

        FROM ${modelConfig.get('TELEFONE')} T
            LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = T.cpf_cnpj)
        WHERE T.telefone=@TELEFONE AND LEN(cpf_cnpj) = 14
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getTelefoneBuscaProfundaTelefone_Sispesquisa_Telefones = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.NVarChar, '%' + telefone + '%'],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          T.cpf_cnpj as cpf, T.telefone, T.fonte, PF.nome as nome

        FROM ${modelConfig.get('TELEFONE')} T
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = T.cpf_cnpj)
        WHERE T.telefone LIKE @TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let insertTelefone_Sispesquisa_Telefones = function (form){

  return db.query([
    ['CPF', form.cpf],
    ['TELEFONE', form.telefone],
    ['FONTE', form.fonte],
    ],`
      INSERT INTO ${modelConfig.get('TELEFONE')}
        (cpf_cnpj, telefone, fonte)
      VALUES
        (@CPF, @TELEFONE, @FONTE)
    `)
    .then(result => {
        return {
            status: API_CODES.CODE_SUCESSO,
            msg: 'Telefone cadastrado com sucesso.'
        }
    }).catch( error => {logErroBuscaBD(error, `Falha no cadastro do telefone.`, 'insertTelefone_Sispesquisa_Telefones')});
};
