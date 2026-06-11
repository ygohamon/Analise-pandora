
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_ELEITORAL');

const fonte = MODEL_PRIORITY['bd_tse.eleitoral'].fonte;
const rank = MODEL_PRIORITY['bd_tse.eleitoral'].rank;
const grupo = MODEL_PRIORITY['bd_tse.eleitoral'].grupo;

export const getCandidatoCPF = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_ELEICAO AS ano
            ,NR_TURNO AS turno
            ,DS_SIT_TOT_TURNO AS situacao
            ,SG_UF as uf
            ,NM_UE as ue
            ,DS_CARGO as cargo
            ,SG_PARTIDO as partido
            ,NR_CANDIDATO as numCandidato
            ,NM_URNA_CANDIDATO as nomeUrna
            ,DS_SITUACAO_CANDIDATURA as situacaoCandidatura
            ,DS_COMPOSICAO_COLIGACAO as coligacao
            ,NM_COLIGACAO as nomeColigacao
            ,'candidato' as tipo
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('VW_TSE_DADOS_CANDIDATO')}
        WHERE NR_CPF_CANDIDATO = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
