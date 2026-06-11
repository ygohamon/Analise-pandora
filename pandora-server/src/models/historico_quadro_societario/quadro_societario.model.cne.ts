
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_CNE');

const fonte = MODEL_PRIORITY['historico_quadro_societario.cne'].fonte;
const rank  = MODEL_PRIORITY['historico_quadro_societario.cne'].rank;
const grupo = MODEL_PRIORITY['historico_quadro_societario.cne'].grupo;

export let getHistoricoQuadroPFDetalhadoCPF_CNE = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf', ISql.VarChar, cpf],
    ],
    `EXEC ${modelConfig.get('HISTORICO_PARTICIPACAO_PF_EM_SOCIEDADES')} @CPF`);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return result.map(r => { r.tipo = 'pf'; r.fonte = modelConfig.sigla; return r;}).slice(0, API_CONFIG.SERVER_MAX_RESULTS);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getHistoricoQuadroPJDetalhadoCNPJ_CNE = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.VarChar, cnpj],
    ],
    `EXEC ${modelConfig.get('HISTORICO_PARTICIPACAO_PJ_EM_SOCIEDADES')} @CNPJ`);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return result.map(r => { r.tipo = 'pj-pj'; r.fonte = modelConfig.sigla; return r; }).slice(0, API_CONFIG.SERVER_MAX_RESULTS);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};

export let getHistoricoQuadroPFDetalhadoCNPJ_CNE = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.VarChar, cnpj],
    ],
    `EXEC ${modelConfig.get('HISTORICO_SOCIOS_PF_E_PJ_EMPRESAS')} @CNPJ`);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return result.map(r => { r.tipo = 'pj-pf'; r.fonte = modelConfig.sigla; return r; }).slice(0, API_CONFIG.SERVER_MAX_RESULTS);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo, fnProcessaDadosEncontrados });
};
