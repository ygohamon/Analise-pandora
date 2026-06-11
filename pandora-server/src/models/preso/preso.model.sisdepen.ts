
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';
import exp = require('constants');

const modelConfig = getModelConfig('BD_SISDEPEN');

const fonte = MODEL_PRIORITY['sisdepen'].fonte;
const rank  = MODEL_PRIORITY['sisdepen'].rank;
const grupo = MODEL_PRIORITY['sisdepen'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  cpf,
  UPPER(nome) as nome,
  UPPER(alcunha) as vulgo,
  rg,
  cnc,
  cadeia,
  situacao,
  '${modelConfig.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,cadeiaUF,
  cadeiaAmbito,
  situacao,
  tipoRecolhimento,
  regimePrisional,
  UPPER(nomeApresentacao) as nomeApresentacao,
  UPPER(nomeSocial) as nomeSocial,
  sexo,
  nacionalidade,
  naturalidadeUF,
  naturalidade,
  escolaridade,
  rgOrgaoEmissor,
  rgUf,
  rgDataExpedicao,
  dataInformacao,
  tipificacao,
  foto
`;

export let getPresoSimplificadoNome_SISDEPEN = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['nome', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('BR')}
        WHERE CONTAINS(nome, @nome)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoVulgo_SISDEPEN = function (vulgo: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['vulgo', ISql.VarChar, '%' + vulgo + '%'],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('BR')}
        WHERE alcunha LIKE @vulgo
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoCPF_SISDEPEN = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('BR')}
        WHERE cpf=@cpf
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoCNC_SISDEPEN = function (cnc: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNC', ISql.VarChar, cnc],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('BR')}
        WHERE cnc=@CNC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoDetalhadoCNC_SISDEPEN = function (cnc: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNC', ISql.VarChar, cnc],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('BR')}
        WHERE cnc=@CNC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoDetalhadoCPF_SISDEPEN = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('BR')}
        WHERE cpf=@cpf
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoDetalhadoRG_SISDEPEN = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['rg', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('BR')}
        WHERE rg=@rg
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}


export let getPresoSimplificadoRG_SISDEPEN = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['rg', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('BR')}
        WHERE rg=@rg
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}