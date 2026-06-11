import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TSE');

const fonte   = MODEL_PRIORITY['tse.pessoa'].fonte;
const rank    = MODEL_PRIORITY['tse.pessoa'].rank;
const grupo   = MODEL_PRIORITY['tse.pessoa'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  NUM_CPF AS cpf,
  NOM_ELEITOR as nome,
  NULL as sexo,
  NOM_MAE as nomeMae,
  DAT_NASC_FORMATADA as dataNascimento,
  NULL as municipio,
  NULL as uf,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,NOM_PAI as nomePai,
  NUM_INSCRICAO as tituloEleitor
`;

export let getPessoaDetalhadoCPF_TSE_Eleitor = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CPF', ISql.Char(11), cpf],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}

      FROM ${modelConfig.get('ELEITOR')}
      WHERE NUM_CPF=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoCPF_TSE_Eleitor = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE NUM_CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoTitulo_TSE_Eleitor = function (titulo: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['TITULO', ISql.Char(12), titulo],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('ELEITOR')}
      WHERE NUM_INSCRICAO=@TITULO
        AND NUM_CPF IS NOT NULL
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNome_TSE_Eleitor = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(NOM_ELEITOR, @NOME)
          AND NUM_CPF IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomePai_TSE_Eleitor = function (nomePai: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEPAI', ISql.VarChar, nomePai],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(NOM_PAI, @NOMEPAI)
          AND NUM_CPF IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomeMae_TSE_Eleitor = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEMAE', ISql.VarChar, nomeMae],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(NOM_MAE, @NOMEMAE)
          AND NUM_CPF IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
