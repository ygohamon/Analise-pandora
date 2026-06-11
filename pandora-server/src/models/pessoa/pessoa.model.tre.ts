
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TREPB');

const fonte   = MODEL_PRIORITY['trepb.pessoa'].fonte;
const rank    = MODEL_PRIORITY['trepb.pessoa'].rank;
const grupo   = MODEL_PRIORITY['trepb.pessoa'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CPF AS cpf,
  NOME as nome,
  SEXO as sexo,
  MAE as nomeMae,
  NASCIMENTO as dataNascimento,
  MUNICIPIO_VOTACAO as municipio,
  'PB' as uf,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,MUNICIPIO_NATAL as naturalidade,
  PAI as nomePai,
  CASE WHEN TIPO_DOC = 'RG' THEN NUM_DOC ELSE NULL END AS rg,
  CASE WHEN TIPO_DOC = 'RG' THEN EXP ELSE NULL END AS orgEmissorRg,
  ESCOLARIDADE as escolaridade,
  ESTADO_CIVIL as estadoCivil,
  INSCRICAO as tituloEleitor
`;

export let getPessoaDetalhadoCPF_TREPB_Eleitor = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CPF', ISql.Char(11), cpf],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}

      FROM ${modelConfig.get('ELEITOR')}
      WHERE CPF=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoCPF_TREPB_Eleitor = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoTitulo_TREPB_Eleitor = function (titulo: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['TITULO', ISql.Char(12), titulo],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('ELEITOR')}
      WHERE INSCRICAO=@TITULO
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNome_TREPB_Eleitor = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(NOME, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomePai_TREPB_Eleitor = function (nomePai: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEPAI', ISql.VarChar, nomePai],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(PAI, @NOMEPAI)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNomeMae_TREPB_Eleitor = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOMEMAE', ISql.VarChar, nomeMae],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('ELEITOR')}
        WHERE CONTAINS(MAE, @NOMEMAE)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
