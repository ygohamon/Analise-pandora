
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');

const fonte = MODEL_PRIORITY['bd_tse.eleitoral'].fonte;
const rank = MODEL_PRIORITY['bd_tse.eleitoral'].rank;
const grupo = MODEL_PRIORITY['bd_tse.eleitoral'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  ANO_ELEICAO AS ano
  ,SG_UF as uf
  ,NM_UE as ue
  ,DS_CARGO as cargo
  ,SG_PARTIDO as partido
  ,NR_CANDIDATO as numeroCandidato
  ,NR_CPF_CANDIDATO as cpf
  ,NM_CANDIDATO as nome
  ,COUNT(*) AS qtd
  ,SUM(VR_DESPESA) AS valor
  ,AVG(VR_DESPESA) AS media
  ,MIN(VR_DESPESA) AS menor
  ,MAX(VR_DESPESA) AS maior
  ,'forneceu' as tipo
  ,'${modelConfig?.sigla}' as fonte
`

const ATRIBUTOS_DETALHADO = `
  ANO_ELEICAO AS ano
  ,SG_UF as uf
  ,NM_UE as ue
  ,DS_CARGO as cargo
  ,SG_PARTIDO as partido
  ,NR_CANDIDATO as numeroCandidato
  ,NR_CPF_CANDIDATO as cpf
  ,NM_CANDIDATO as nome
  ,TP_DESPESA as origem
  ,DT_DESPESA as data
  ,DS_DESPESA as descricao
  ,VR_DESPESA as valor
  ,'forneceu' as tipo
  ,'${modelConfig?.sigla}' as fonte
`

export const getCandidatosFornecedoresSimplificadoFornecedorCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}
      FROM ${modelConfig.get('VW_TSE_FORNECEDORES_CANDIDATO')}
      WHERE NR_CPF_CNPJ_FORNECEDOR = @CPF
      GROUP BY ANO_ELEICAO, SG_UF, NM_UE, DS_CARGO, SG_PARTIDO, NR_CANDIDATO, NR_CPF_CANDIDATO, NM_CANDIDATO
`);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


export const getCandidatosFornecedoresSimplificadoFornecedorCNPJ_Eleitoral = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('VW_TSE_FORNECEDORES_CANDIDATO')}
        WHERE NR_CPF_CNPJ_FORNECEDOR = @CNPJ
        GROUP BY ANO_ELEICAO, SG_UF, NM_UE, DS_CARGO, SG_PARTIDO, NR_CANDIDATO, NR_CPF_CANDIDATO, NM_CANDIDATO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getCandidatosFornecedoresDetalhadoCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}
        FROM ${modelConfig.get('VW_TSE_FORNECEDORES_CANDIDATO')}
        WHERE NR_CPF_CNPJ_FORNECEDOR = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getCandidatosFornecedoresDetalhadoCNPJ_Eleitoral = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}
        FROM ${modelConfig.get('VW_TSE_FORNECEDORES_CANDIDATO')}
        WHERE NR_CPF_CNPJ_FORNECEDOR = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

