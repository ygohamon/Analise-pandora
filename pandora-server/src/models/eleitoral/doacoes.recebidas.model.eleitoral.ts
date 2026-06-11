
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');

const fonte = MODEL_PRIORITY['bd_tse.eleitoral'].fonte;
const rank = MODEL_PRIORITY['bd_tse.eleitoral'].rank;
const grupo = MODEL_PRIORITY['bd_tse.eleitoral'].grupo;

export const getDoacoesRecebidasSimplificadoCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO AS ano
            ,SG_UF as uf
            ,NM_UE as ue
            ,COUNT(*) as qtd
            ,SUM(VR_RECEITA) as valor
            ,MAX(VR_RECEITA) as maior
            ,MIN(VR_RECEITA) as menor
            ,AVG(VR_RECEITA) as media
            ,'doador' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_DOACOES_RECEBIDAS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
        GROUP BY ANO_ELEICAO, SG_UF, NM_UE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getDoacoesRecebidasDetalhadoCPF_Eleitoral = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO AS ano
            ,SG_UF as uf
            ,NM_UE as ue
            ,DS_CARGO as cargo
            ,TP_RECEITA as origem
            ,NR_CPF_CNPJ_DOADOR as cpf_cnpj
            ,NM_DOADOR as nome
            ,VR_RECEITA as valor
            ,DT_RECEITA as dataReceita
            ,DS_RECEITA as descricao
            ,'doador' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_DOACOES_RECEBIDAS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
