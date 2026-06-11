
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');

const fonte = MODEL_PRIORITY['bd_tse.eleitoral'].fonte;
const rank = MODEL_PRIORITY['bd_tse.eleitoral'].rank;
const grupo = MODEL_PRIORITY['bd_tse.eleitoral'].grupo;

export const getGastosCandidatosDetalhadoCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO as ano
            ,SG_UF as uf
            ,NM_UE as ue
            ,NR_CNPJ_PRESTADOR_CONTA as prestador
            ,DS_CARGO as cargo
            ,SG_PARTIDO as partido
            ,NR_CANDIDATO as numCandidato
            ,NR_CPF_CANDIDATO as cpf
            ,NM_CANDIDATO as nome
            ,NR_CPF_CNPJ_FORNECEDOR as cpfCnpjFornecedor
            ,NM_FORNECEDOR as nomeFornecedor
            ,TP_DESPESA as origem
            ,DT_DESPESA as dataDespesa
            ,DS_DESPESA as descricao
            ,VR_DESPESA as valor
            ,'gastos' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_GASTOS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getGastosCandidatosSimplificadoCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO AS ano
            ,SG_UF as uf
            ,DS_CARGO as cargo
            ,COUNT(*) AS qtd
            ,SUM(VR_DESPESA) AS valor
            ,AVG(VR_DESPESA) AS media
            ,MIN(VR_DESPESA) AS menor
            ,MAX(VR_DESPESA) AS maior
            ,'gastos' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_GASTOS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
        GROUP BY ANO_ELEICAO, SG_UF, DS_CARGO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
