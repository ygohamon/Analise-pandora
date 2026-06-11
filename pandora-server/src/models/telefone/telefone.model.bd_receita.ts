
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

import { normalizaNumero } from '.';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte_pf   = MODEL_PRIORITY['bd_receita.pf.telefone'].fonte;
const rank_pf    = MODEL_PRIORITY['bd_receita.pf.telefone'].rank;
const grupo_pf   = MODEL_PRIORITY['bd_receita.pf.telefone'].grupo;

const ATRIBUTOS_SIMPLIFICADO_PF = `
  CPF as cpf,
  NOME as nome,
  CASE WHEN TELEFONE = '00000000' OR TELEFONE = '' THEN NULL ELSE CASE WHEN DDD = '0000' THEN NULL ELSE RIGHT(DDD, 2) END END as ddd,
  CASE WHEN TELEFONE = '00000000' OR TELEFONE = '' THEN NULL ELSE TELEFONE END as telefone,
  '${modelConfig.sigla}' as fonte
`;

const fn_pf = function (result) {
  return result
    .map(dado => {
      const processado = normalizaNumero(dado.ddd, dado.telefone);
      const {telefone, ...resto} = dado;
      if (typeof processado === 'object') {
        return Object.assign(resto, {telefone: processado.numero, ddd: processado.ddd})
      } else {
        return Object.assign(resto, {telefone: processado, ddd: ''})
      }
    })
}

export let getTelefoneCPF_BD_Receita_PF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO_PF}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
            AND ( TELEFONE <> '00000000' AND TELEFONE <> '')
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf, fnProcessaDadosEncontrados: fn_pf });
};

export let getTelefoneNome_BD_Receita = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO_PF}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Nome, @NOME)
            AND ( TELEFONE <> '00000000' AND TELEFONE <> '')
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

export let getTelefoneTelefone_BD_Receita = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone ],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO_PF}

        FROM ${modelConfig.get('PF')}
        WHERE TELEFONE = @TELEFONE OR TELEFONE = RIGHT(@TELEFONE, 8)
            AND ( TELEFONE <> '00000000' AND TELEFONE <> '')
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

const fonte_pj   = MODEL_PRIORITY['bd_receita.pj.telefone'].fonte;
const rank_pj    = MODEL_PRIORITY['bd_receita.pj.telefone'].rank;
const grupo_pj   = MODEL_PRIORITY['bd_receita.pj.telefone'].grupo;

const ATRIBUTOS_SIMPLIFICADO_PJ = `
  CNPJ as cnpj,
  TRIM(RazaoSocial) as razaoSocial,
  LEFT(DddTelefone1, 2) as ddd,
  RIGHT(DddTelefone1, 8) as telefone,
  LEFT(DddTelefone2, 2) as ddd2,
  RIGHT(DddTelefone2, 8) as telefone2,
  LEFT(DddFax, 2) as dddfax,
  RIGHT(DddFax, 8) as telefoneFax,
  '${modelConfig.sigla}' as fonte
`;

const fn_pj = function (result) {
  return result
    .reduce((acc, registro) => {
      acc.push(
        { ddd: registro.ddd, telefone: registro.telefone, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte},
        { ddd: registro.ddd2, telefone: registro.telefone2, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte},
        { ddd: registro.dddfax, telefone: registro.telefoneFax, cnpj: registro.cnpj, razaoSocial: registro.razaoSocial, fonte: registro.fonte}
      );
      return acc;
    }, [] )
    .filter(t => (t.ddd !== null) && (t.telefone !== null))
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
}

export let getTelefoneCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO_PJ}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ AND
            (DddTelefone1 IS NOT NULL or DddTelefone2 IS NOT NULL or DddFax IS NOT NULL)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnProcessaDadosEncontrados: fn_pj });
};

export let getTelefoneRazaoSocial_BD_Receita = function (razaoSocial: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RAZAOSOCIAL', ISql.VarChar, razaoSocial],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO_PJ}

        FROM ${modelConfig.get('PJ')}
        WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj, fnProcessaDadosEncontrados: fn_pj });
};

const fonte_socio   = MODEL_PRIORITY['bd_receita.socio.telefone'].fonte;
const rank_socio    = MODEL_PRIORITY['bd_receita.socio.telefone'].rank;
const grupo_socio   = MODEL_PRIORITY['bd_receita.socio.telefone'].grupo;

const ATRIBUTOS_SOCIO = `
  CASE WHEN NUM_TELEFONE = '0' OR NUM_TELEFONE IS NULL THEN NULL ELSE CASE WHEN NUM_DDD = '0' THEN NULL ELSE NUM_DDD END END as ddd,
  CASE WHEN NUM_TELEFONE = '0' OR NUM_TELEFONE IS NULL THEN NULL ELSE NUM_TELEFONE END as telefone,
`

export let getTelefoneCPF_BD_Receita_Socio = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CPF as cpf,
            ${ATRIBUTOS_SOCIO}
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')}
        WHERE NUM_CPF=@CPF AND ( NUM_TELEFONE <> '0' AND NUM_TELEFONE IS NOT NULL )
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_socio, rank: rank_socio, grupo: grupo_socio, fnProcessaDadosEncontrados: fn_pf });
};

export let getTelefoneCNPJ_BD_Receita_Socio = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ AS cnpj,
            ${ATRIBUTOS_SOCIO}
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')}
        WHERE NUM_CNPJ=@CNPJ AND ( NUM_TELEFONE <> '0' AND NUM_TELEFONE IS NOT NULL )
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_socio, rank: rank_socio, grupo: grupo_socio, fnProcessaDadosEncontrados: fn_pf });
};
