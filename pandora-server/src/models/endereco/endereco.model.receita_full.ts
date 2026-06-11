
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITAFULL');

const fonte_pf = MODEL_PRIORITY['receita_full.pf.endereco'].fonte;
const rank_pf  = MODEL_PRIORITY['receita_full.pf.endereco'].rank;
const grupo_pf = MODEL_PRIORITY['receita_full.pf.endereco'].grupo;

export let getEnderecoCPF_ReceitaFull_PF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CPF as cpf, Nome as nome, TipoLogradouro as tipoLogradouro, Logradouro as logradouro, NumeroLogradouro as numero,
            Complemento as complemento, Bairro as bairro, CEP as cep, UF as uf, Municipio as municipio, '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

const fonte_pj = MODEL_PRIORITY['receita_full.pj.endereco'].fonte;
const rank_pj  = MODEL_PRIORITY['receita_full.pj.endereco'].rank;
const grupo_pj = MODEL_PRIORITY['receita_full.pj.endereco'].grupo;

export let getEnderecoCNPJ_ReceitaFull_PJ = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj, RazaoSocial as razaoSocial, TipoLogradouro as tipoLogradouro, Logradouro as logradouro, Numero as numero,
            Complemento as complemento, Bairro as bairro, CEP as cep, UF as uf, Municipio as municipio, '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};
