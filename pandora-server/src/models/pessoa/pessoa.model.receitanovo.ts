
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITANOVO');

const fonte  = MODEL_PRIORITY['receitanovo.pessoafisica'].fonte;
const rank   = MODEL_PRIORITY['receitanovo.pessoafisica'].rank;
const grupo  = MODEL_PRIORITY['receitanovo.pessoafisica'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  UPPER(Nome) as nome,
  UPPER(NomeMae) as nomeMae,
  UPPER(Municipio) as municipio,
  UPPER(UF) as uf,
  CASE
    WHEN Sexo = 1 THEN 'MASCULINO'
    WHEN Sexo = 2 THEN 'FEMININO'
    ELSE NULL
  END AS sexo,
  DataNascimento AS dataNascimento,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,UPPER(NaturezaOcupacao.Descricao) as naturezaOcupacao,
  AnoObito as anoObito,
  CASE
      WHEN ExercicioOcupacao = '0000' THEN NULL
      ELSE ExercicioOcupacao
  END as anoExercicioOcupacao,
  UPPER(OcupacaoPrincipal.Descricao) as ocupacaoPrincipal
`;

export let getPessoaDetalhadoCPF_ReceitaNovo_PessoaFisica = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PF')}
            LEFT OUTER JOIN ${modelConfig.get('NATUREZA')} ON (PessoaFisica.NaturezaOcupacao = NaturezaOcupacao.NaturezaOcupacaoID)
            LEFT OUTER JOIN ${modelConfig.get('OCUPACAO')} ON (PessoaFisica.OcupacaoPrincipal = OcupacaoPrincipal.OcupacaoPrincipalID)
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoCPF_ReceitaNovo_PessoaFisica = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNome_ReceitaNovo_PessoaFisica = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Nome, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaNomeMae_ReceitaNovo_PessoaFisica = function (nomeMae: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['NOMEMAE', ISql.VarChar, nomeMae],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('PF')}
      WHERE CONTAINS(NomeMae, @NOMEMAE)
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}


export let getPessoaSimplificadoLogradouro_ReceitaNovo_PessoaFisica = function (logradouro: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar, logradouro],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CONTAINS(Logradouro, @LOGRADOURO)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
