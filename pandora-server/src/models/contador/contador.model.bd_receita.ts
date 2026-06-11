
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['bd_receita.contador'].fonte;
const rank  = MODEL_PRIORITY['bd_receita.contador'].rank;
const grupo = MODEL_PRIORITY['bd_receita.contador'].grupo;

export let getContadorPFCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ_EMPRESA AS cnpj
            ,NUM_CPF AS cpf
            ,NOME AS nome
            ,CASE WHEN NUM_REGISTRO_CRC = 0 THEN NULL ELSE NUM_REGISTRO_CRC END AS crc
            ,CASE WHEN SIGLA_UF_CRC = '' THEN NULL ELSE SIGLA_UF_CRC END AS ufCRC
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('CONTADOR')}
        WHERE NUM_CNPJ_EMPRESA=@CNPJ AND IND_TIPO='PF'
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getContadorPJCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              NUM_CNPJ_EMPRESA AS cnpj
              ,NUM_CNPJ AS cnpjContador
              ,NOME AS razaoSocial
              ,CASE WHEN NUM_REGISTRO_CRC = 0 THEN NULL ELSE NUM_REGISTRO_CRC END AS crc
              ,CASE WHEN SIGLA_UF_CRC = '' THEN NULL ELSE SIGLA_UF_CRC END AS ufCRC
              ,'${modelConfig.sigla}' as fonte

          FROM ${modelConfig.get('CONTADOR')}
          WHERE NUM_CNPJ_EMPRESA=@CNPJ AND IND_TIPO='PJ'
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
