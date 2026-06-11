
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITANOVO');

const fonte_pf = MODEL_PRIORITY['receitanovo.pessoafisica.endereco'].fonte;
const rank_pf  = MODEL_PRIORITY['receitanovo.pessoafisica.endereco'].rank;
const grupo_pf = MODEL_PRIORITY['receitanovo.pessoafisica.endereco'].grupo;


const PF_ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  Nome as nome,
  TipoLogradouro as tipoLogradouro,
  Logradouro as logradouro,
  CASE WHEN TRY_CAST(NumeroLogradouro as int) IS NULL THEN 0 ELSE CAST(NumeroLogradouro as int) END as numero,
  Complemento as complemento,
  Bairro as bairro,
  CEP as cep,
  UF as uf,
  Municipio as municipio,
  '${modelConfig.sigla}' as fonte
`;

export let getEnderecoCPF_ReceitaNovo_PessoaFisica = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PF_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

export let getEnderecoLogradouro_ReceitaNovo_PessoaFisica = function (logradouro: string, numero: string = null, municipio: string = null){

  let query_numero    = (numero) ? `AND NumeroLogradouro = '${numero}'` : '';
  let query_municipio = (municipio) ? `AND Municipio = '${municipio}'` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar, logradouro],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${PF_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Logradouro, @LOGRADOURO) ${query_numero} ${query_municipio}
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

const fonte_pj = MODEL_PRIORITY['receitanovo.pessoajuridica.endereco'].fonte;
const rank_pj  = MODEL_PRIORITY['receitanovo.pessoajuridica.endereco'].rank;
const grupo_pj = MODEL_PRIORITY['receitanovo.pessoajuridica.endereco'].grupo;


const PJ_ATRIBUTOS_SIMPLIFICADO = `
  CNPJ as cnpj,
  RazaoSocial as razaoSocial,
  DescricaoTipoLogradouro as tipoLogradouro,
  Logradouro as logradouro,
  CASE WHEN TRY_CAST(Numero as int) IS NULL THEN 0 ELSE CAST(Numero as int) END as numero,
  Complemento as complemento,
  Bairro as bairro,
  CEP as cep,
  UF as uf,
  Municipio as municipio,
  '${modelConfig.sigla}' as fonte
`;

export let getEnderecoCNPJ_ReceitaNovo_PessoaJuridica = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PJ_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};

export let getEnderecoLogradouro_ReceitaNovo_PessoaJuridica = function (logradouro: string, numero: string = null, municipio: string = null){

  let query_numero    = (numero) ? `AND Numero = '${numero}'` : '';
  let query_municipio = (municipio) ? `AND Municipio = '${municipio}'` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar, logradouro],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PJ_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CONTAINS(Logradouro, @LOGRADOURO) ${query_numero} ${query_municipio}
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};
