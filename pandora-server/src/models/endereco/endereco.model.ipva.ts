
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_IPVA');

const fonte = MODEL_PRIORITY['ipva.endereco'].fonte;
const rank  = MODEL_PRIORITY['ipva.endereco'].rank;
const grupo = MODEL_PRIORITY['ipva.endereco'].grupo;

export let getEnderecoCPF_IPVA = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            cpf_cnpj as cpf, nome,
            dsendnaodecodifica as logradouro, bairro,
            nrcep as cep, municipio, uf, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('VEICULO')}
        WHERE cpf_cnpj=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEnderecoCNPJ_IPVA = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            cpf_cnpj as cnpj, nome as razaoSocial,
            dsendnaodecodifica as logradouro, bairro,
            nrcep as cep, municipio, uf, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('VEICULO')}
        WHERE cpf_cnpj=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
