
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_DETRAN');

const fonte  = MODEL_PRIORITY['detran.pessoa'].fonte;
const rank   = MODEL_PRIORITY['detran.pessoa'].rank;
const grupo  = MODEL_PRIORITY['detran.pessoa'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  TRIM(Nome_Condutor) as nome,
  NULL as sexo,
  TRIM(Nome_Mae) as nomeMae,
  NULL as municipio,
  UPPER(UF_Emissor_Identidade) as uf,
  NULL as dataNascimento,
  '${modelConfig?.sigla}' + ANO as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,TRIM(Nome_Pai) as nomePai,
  Numero_Identidade as rg,
  Orgao_Emissor_Identidade as orgEmissorRg,
  UF_Emissor_Identidade as ufOrgEmissorRG,
  Numero_Renach as renach,
  Numero_Registro_CNH as cnh,
  Categoria_Atual as catAtual,
  Resultado_Exame_Psicotecnico as resPsicotecnico,
  TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Psicotecnico, 5, 0, '/'), 3, 0, '/'), 103) as dtPsicotecnico,
  Resultado_Exame_Medico as resMedico,
  TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Medico, 5, 0, '/'), 3, 0, '/'), 103) as dtMedico,
  Resultado_Exame_Legislacao as resLegislacao,
  TRY_CONVERT(DATE, STUFF(STUFF(Data_Exame_Legislacao, 5, 0, '/'), 3, 0, '/'), 103) as dtLegislacao
`;

export let getPessoaDetalhadoRG_BD_Detran = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['Numero_Identidade', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('CNH')}
        WHERE Numero_Identidade=@Numero_Identidade
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaDetalhadoCPF_BD_Detran = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('CNH')}
        WHERE CPF=@CPF
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoCPF_BD_Detran = function (cpf : string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CNH')}
        WHERE CPF=@CPF
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoCNH_BD_Detran = function (cnh : string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNH', ISql.Char(11), cnh],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CNH')}
        WHERE Numero_Registro_CNH=@CNH
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoRG_BD_Detran = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['Numero_Identidade', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CNH')}
        WHERE Numero_Identidade=@Numero_Identidade
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoNome_BD_Detran = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['NOME', ISql.VarChar, nome],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('CNH')}
      WHERE Nome_Condutor=@NOME
      ORDER BY ANO DESC
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomePai_BD_Detran = function (nomePai: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['NOMEPAI', ISql.VarChar, nomePai],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CNH')}
        WHERE CONTAINS(Nome_Pai, @NOMEPAI)
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoNomeMae_BD_Detran = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
        ['NOMEMAE', ISql.VarChar, nomeMae],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('CNH')}
        WHERE CONTAINS(Nome_Mae, @NOMEMAE)
        ORDER BY ANO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
