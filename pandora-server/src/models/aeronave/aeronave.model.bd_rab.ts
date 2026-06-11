
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RAB');

const fonte = MODEL_PRIORITY['bd_rab'].fonte;
const rank = MODEL_PRIORITY['bd_rab'].rank;
const grupo = MODEL_PRIORITY['bd_rab'].grupo;

const ATRIBUTOS_DETALHADO = `
  ,PROPRIETARIO as proprietario
  ,UF as uf
  ,CPF_CNPJ as cpf_cnpj
  ,OPERADOR as operador
  ,UF2 as uf2
  ,CPF_CNPJ2 as cpf_cnpj2
  ,MARCA as marca
  ,MATRICULA as matricula
  ,NUM_SERIE as num_serie
  ,CATEGORIA as categoria
  ,TIPO_CERT as tipo_cert
  ,MODELO as modelo
  ,NOME_FABRICANTE as fabricante
  ,CLASSE as classe
  ,PMD as pmd
  ,TRIP_MIN as trip_min
  ,PAX_MAX as pax_max
  ,ASSENTOS as assentos
  ,ANO_FAB as ano_fab
  ,VAL_IAM as dt_iam
  ,VAL_SEG as dt_seg
  ,VAL_CA as val_ca
  ,DATA_CANC as dt_can
  ,MOTIVO as motivo
  ,CD_INTERDICAO as cd_interdicao
  ,MARCA_NAC1 as marca_nac_1
  ,MARCA_NAC2 as marca_nac_2
  ,MARCA_NAC3 as marca_nac_3
  ,MARCA_EST as marca_est
  ,DESCRICAO_GRAVAME as descricao_gravame
  ,'${modelConfig?.sigla}' as fonte
`;


export const getAeronaveDetalhadoCPF_BD_RAB = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CASE
              WHEN CPF_CNPJ = @CPF THEN 'proprietario'
              WHEN CPF_CNPJ2 = @CPF THEN 'operador'
              ELSE NULL
            END as tipo
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('RAB')}
        WHERE cpf_cnpj = @CPF OR CPF_CNPJ2 = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export const getAeronaveDetalhadoCNPJ_BD_RAB = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CASE
              WHEN CPF_CNPJ = @CNPJ THEN 'proprietario'
              WHEN CPF_CNPJ2 = @CNPJ THEN 'operador'
              ELSE NULL
            END as tipo
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('RAB')}
        WHERE cpf_cnpj = @CNPJ OR CPF_CNPJ2 = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
