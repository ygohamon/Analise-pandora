
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

import { normalizaNumero } from '.';

const modelConfig = getModelConfig('BD_RECEITAFULL');

const fonte_pf   = MODEL_PRIORITY['receita_full.pf.telefone'].fonte;
const rank_pf    = MODEL_PRIORITY['receita_full.pf.telefone'].rank;
const grupo_pf   = MODEL_PRIORITY['receita_full.pf.telefone'].grupo;

const fn_pf = function(result) {
  return result
    .filter(r => r.ddd.trim().length !== 0 && r.telefone.trim().length !== 0 && r.telefone !== '00000000')
    .map(dado => {
      const processado = normalizaNumero(dado.ddd, dado.telefone);
      const {telefone, ...resto} = dado;
      if (typeof processado === 'object') {
        return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
      } else {
        return Object.assign(resto, {telefone: processado, ddd: ''})
      }
    })
};

export let getTelefoneCPF_ReceitaFull_PF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF as cpf, DDD as ddd, Telefone as telefone,
            Nome as nome, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnProcessaDadosEncontrados: fn_pf });
};

export let getTelefoneNome_ReceitaFull_PF = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF as cpf, DDD as ddd, Telefone as telefone,
            Nome as nome, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnProcessaDadosEncontrados: fn_pf });
};

export let getTelefoneTelefone_ReceitaFull_PF = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone ],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF as cpf, DDD as ddd, Telefone as telefone,
            Nome as nome, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE telefone = @TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnProcessaDadosEncontrados: fn_pf });
};

const fonte_pj   = MODEL_PRIORITY['receita_full.pj.telefone'].fonte;
const rank_pj    = MODEL_PRIORITY['receita_full.pj.telefone'].rank;
const grupo_pj   = MODEL_PRIORITY['receita_full.pj.telefone'].grupo;

const fn_pj = function(result) {
  return result
    .reduce((acc, registro) => {
      acc.push(
        { ddd: registro.ddd, telefone: registro.telefone, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte},
        { ddd: registro.ddd2, telefone: registro.telefone2, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte},
        { ddd: registro.dddfax, telefone: registro.telefoneFax, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte}
      );

      return acc;
    }, [] )
    .filter(registro => (((registro.ddd.trim().length !== 0) && (registro.telefone.trim().length !== 0))) && (registro.telefone !== '00000000'))
    .map(dado => {
      const processado = normalizaNumero(dado.ddd, dado.telefone);
      const {telefone, ...resto} = dado;
      if (typeof processado === 'object') {
        return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
      } else {
        return Object.assign(resto, {telefone: processado, ddd: ''})
      }
    })
};

export let getTelefoneCNPJ_ReceitaFull_PJ = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj, DDD as ddd, Telefone as telefone,
            DDD2 as ddd2, Telefone2 as telefone2,
            DDDFax as dddfax, TelefoneFax as telefoneFax,
            RazaoSocial as razaoSocial, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnProcessaDadosEncontrados: fn_pj });
};

export let getTelefoneRazaoSocial_ReceitaFull_PJ = function (razaoSocial: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RAZAOSOCIAL', ISql.VarChar, razaoSocial],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj, DDD as ddd, Telefone as telefone,
            DDD2 as ddd2, Telefone2 as telefone2,
            DDDFax as dddfax, TelefoneFax as telefoneFax,
            RazaoSocial as razaoSocial, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnProcessaDadosEncontrados: fn_pj });
};

export let getTelefoneTelefone_ReceitaFull_PJ = function (telefone: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj, DDD as ddd, Telefone as telefone,
            RazaoSocial as razaoSocial, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE Telefone = @TELEFONE OR Telefone2 = @TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnProcessaDadosEncontrados: fn_pj });
};
