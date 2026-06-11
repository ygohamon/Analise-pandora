
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITAFULL');

const fonte = MODEL_PRIORITY['receita_full.contador'].fonte;
const rank  = MODEL_PRIORITY['receita_full.contador'].rank;
const grupo = MODEL_PRIORITY['receita_full.contador'].grupo;

export let getContadorCNPJ_Receita_Full = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj,
            CPFContador AS cpf,
            PF.Nome as nome,
            CRCContadorPF as crc,
            UFCRCPF as ufCRC,
            '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('CONTADOR')} C
            INNER JOIN ${modelConfig.get('PF')} PF ON (C.CPFContador = PF.CPF)
        WHERE C.CNPJ = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
