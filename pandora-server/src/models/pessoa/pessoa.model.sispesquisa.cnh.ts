
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SISPESQUISA_CNH');

const fonte  = MODEL_PRIORITY['sispesquisa.cnh'].fonte;
const rank   = MODEL_PRIORITY['sispesquisa.cnh'].rank;
const grupo  = MODEL_PRIORITY['sispesquisa.cnh'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  UPPER(Nome) as nome,
  NULL as sexo,
  UPPER(Nome_da_Mae) as nomeMae,
  NULL as municipio,
  UPPER(UF_Emissao_Identidade) as uf,
  NULL as dataNascimento,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,UPPER(Nome_do_Pai) as nomePai,
  Identidade as rg,
  Orgao_Emissor_Identidade as orgEmissorRg,
  UF_Emissao_Identidade as ufOrgEmissorRG,
  Renach as renach,
  CNH as cnh,
  Categoria_Atual as catAtual,
  Resultado_Exame_Psicotecnico as resPsicotecnico,
  Data_Exame_Psicotecnico as dtPsicotecnico,
  Resultado_Exame_Medico as resMedico,
  Data_Exame_Medico as dtMedico
`;

export let getPessoaDetalhadoRG_Sispesquisa_CNH = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['Identidade', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PF')}
        WHERE Identidade=@Identidade
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaDetalhadoCPF_Sispesquisa_CNH = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoCPF_Sispesquisa_CNH = function (cpf : string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CNH.CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoCNH_Sispesquisa_CNH = function (cnh : string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNH', ISql.Char(11), cnh],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE cnh=@CNH
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoRG_Sispesquisa_CNH = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RG', ISql.VarChar, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE Identidade=@RG
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoNome_Sispesquisa_CNH = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['NOME', ISql.VarChar, nome],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('PF')}
      WHERE CNH.Nome=@NOME
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomePai_Sispesquisa_CNH = function (nomePai: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEPAI', ISql.VarChar, nomePai],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Nome_do_Pai, @NOMEPAI)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoNomeMae_Sispesquisa_CNH = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEMAE', ISql.VarChar, nomeMae],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Nome_da_Mae, @NOMEMAE)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
