
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ORCRIM');

const fonte   = MODEL_PRIORITY['sispesquisa.prisional.preso'].fonte;
const rank    = MODEL_PRIORITY['sispesquisa.prisional.preso'].rank;
const grupo   = MODEL_PRIORITY['sispesquisa.prisional.preso'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  cpf,
  nome_prisional as nome,
  mae as nomeMae,
  dtEntrada as dataEntrada,
  apelido_vulgo as vulgo,
  status,
  '${modelConfig.get('PRISIONAL_FONTE')}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,pai as nomePai,
  prontuario,
  FACCAO as faccao,
  id_unidade_prisional as unidade_prisional
`;

let getPrisionalDetalhado = function (paramBusca: string, valor: string, nomeFuncao){

  const query = () => {
    return db.query([
      ['search_parameter', ISql.NVarChar, valor],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PRISIONAL')}
        WHERE ${paramBusca}=@search_parameter
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

let getPrisionalSimplificado = function (paramBusca: string, valor: string, nomeFuncao){

  const query = () => {
    return db.query([
      ['search_parameter', ISql.NVarChar, valor],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRISIONAL')}
        WHERE ${paramBusca}=@search_parameter
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

let getPrisionalSimplificadoLike = function (paramBusca: string, valor: string, nomeFuncao){

  const query = () => {
    return db.query([
      ['search_parameter', ISql.NVarChar, valor],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRISIONAL')}
        WHERE ${paramBusca} LIKE @search_parameter
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

let getPrisionalSimplificadoFullText = function (paramBusca: string, valor: string, nomeFuncao){

  const query = () => {
    return db.query([
      ['search_parameter', ISql.NVarChar, valor],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PRISIONAL')}
        WHERE CONTAINS(${paramBusca}, @search_parameter)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPresoDetalhadoCPF_Sispesquisa_Prisional = function (cpf: string){
  return getPrisionalDetalhado("cpf", cpf, 'getPresoDetalhadoCPF_Sispesquisa_Prisional');
}

export let getPresoSimplificadoCPF_Sispesquisa_Prisional = function (cpf: string){
  return getPrisionalSimplificado("cpf", cpf, 'getPresoSimplificadoCPF_Sispesquisa_Prisional');
};

export let getPresoSimplificadoVulgo_Sispesquisa_Prisional = function(vulgo: string){
  return getPrisionalSimplificadoLike("apelido_vulgo", '%' + vulgo + '%', 'getPresoSimplificadoVulgo_Sispesquisa_Prisional');
}

export let getPresoSimplificadoNome_Sispesquisa_Prisional = function (nome: string){
  return getPrisionalSimplificadoFullText("nome_prisional", nome, 'getPresoSimplificadoNome_Sispesquisa_Prisional');
};

export let getPresoSimplificadoNomeMae_Sispesquisa_Prisional = function (nomeMae: string){
  return getPrisionalSimplificadoFullText("mae", nomeMae, 'getPresoSimplificadoNomeMae_Sispesquisa_Prisional');
};
