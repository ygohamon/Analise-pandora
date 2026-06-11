
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RENACH_2014');

const fonte = MODEL_PRIORITY['renach.endereco'].fonte;
const rank  = MODEL_PRIORITY['renach.endereco'].rank;
const grupo = MODEL_PRIORITY['renach.endereco'].grupo;

export let getEnderecoCPF_Renach_2016_08 = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            nr_cpf as cpf, nm_condutor as nome, ds_endereco as logradouro
            ,nr_endereco as numero, ds_municipio_endereco as municipio
            ,sg_uf_endereco as uf, nr_cep_endereco as cep
            ,ds_complemento_endereco as complemento, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE nr_cpf=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
