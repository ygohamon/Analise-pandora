
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

import { MODEL_PRIORITY, API_CONFIG } from './../../config';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte  = MODEL_PRIORITY['bd_receita.pf'].fonte;
const rank   = MODEL_PRIORITY['bd_receita.pf'].rank;
const grupo  = MODEL_PRIORITY['bd_receita.pf'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  TRIM(Nome) as nome,
  CASE WHEN NomeMae = '' THEN NULL ELSE TRIM(NomeMae) END as nomeMae,
  TRIM(Municipio) as municipio,
  TRIM(UF) as uf,
  TRY_CAST(DataNascimento as date) as dataNascimento,
  CASE WHEN Sexo = 1 THEN 'MASCULINO' ELSE 'FEMININO' END as sexo,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,UPPER(SITUACAO.Descricao) as situacaoCadastral,
  CASE WHEN ResidenteExterior = 1 THEN 'SIM' ELSE 'NAO' END AS residenteExterior,
  TRIM(NomePaisExterior) as nomePaisExterior,
  CASE WHEN Estrangeiro = 0 THEN 'NÃO' ELSE 'SIM' END AS estrangeiro,
  UPPER(NATUREZA.Descricao) as naturezaOcupacao,
  UPPER(OCUPACAO.Descricao) as ocupacaoPrincipal,
  CASE WHEN ExercicioOcupacao = 0 THEN NULL ELSE ExercicioOcupacao END as anoExercicioOcupacao,
  CASE WHEN AnoObito = 0 THEN NULL ELSE AnoObito END as anoObito
`;

export let getPessoaDetalhadoCPF_BD_Receita = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PF')} PF
          LEFT OUTER JOIN ${modelConfig.get('SITUACAO')} SITUACAO ON (PF.SituacaoCadastral = SITUACAO.SituacaoCadastralID)
          LEFT OUTER JOIN ${modelConfig.get('NATUREZA')} NATUREZA ON (PF.NaturezaOcupacao = NATUREZA.NaturezaOcupacaoID)
          LEFT OUTER JOIN ${modelConfig.get('OCUPACAO')} OCUPACAO ON (PF.OcupacaoPrincipal = OCUPACAO.OcupacaoPrincipalID)
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaSimplificadoCPF_BD_Receita = function (cpf: string){

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
}

export let getPessoaSimplificadoNome_BD_Receita = function (nome: string){

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

export let getPessoaSimplificadoNomeMae_BD_Receita = function (nomeMae: string){

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

export let getPessoaSimplificadoLogradouro_BD_Receita = function (logradouro: string){

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

export let getPessoaSimplificadoTelefone_BD_Receita = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE Telefone=@TELEFONE OR Telefone=RIGHT(@TELEFONE, 8)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
