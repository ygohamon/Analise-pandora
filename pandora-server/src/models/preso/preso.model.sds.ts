
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ORCRIM');

const fonte = MODEL_PRIORITY['sispesquisa.dbo.tbl_prontuarios'].fonte;
const rank  = MODEL_PRIORITY['sispesquisa.dbo.tbl_prontuarios'].rank;
const grupo = MODEL_PRIORITY['sispesquisa.dbo.tbl_prontuarios'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  cpf,
  UPPER(nome) as nome,
  UPPER(mae) as nomeMae,
  UPPER(vulgo) as vulgo,
  rg,
  UPPER(principal_atividade_criminosa) as principalAtividade,
  '${modelConfig.get('PRONTUARIOS_FONTE')}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,UPPER(orgao_exp) as orgEmissor,
  UPPER(pai) as nomePai,
  cabelo,
  olhos,
  cutis,
  UPPER(comparsas) as comparsas,
  faccao,
  barba,
  cicatriz,
  tatuagem,
  informacoes_adicionais_varchar1 as infoAdicional,
  informacoes_adicionais_varchar2 as infoAdicional2
`;

export let getPresoSimplificadoNomeMae_SDS_Prisional = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['nomeMae', ISql.VarChar, nomeMae],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE CONTAINS(mae, @nomeMae)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoNome_SDS_Prisional = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['nome', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE CONTAINS(nome, @nome)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoVulgo_SDS_Prisional = function (vulgo: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['vulgo', ISql.VarChar, '%' + vulgo + '%'],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE VULGO LIKE @vulgo
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoSimplificadoCPF_SDS_Prisional = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE cpf=@cpf
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoDetalhadoCPF_SDS_Prisional = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE CPF=@cpf
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPresoDetalhadoRG_SDS_Prisional = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['rg', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE RG=@rg
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}


export let getPresoSimplificadoRG_SDS_Prisional = function (rg: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['rg', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRONTUARIOS')}
        WHERE RG=@rg
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
