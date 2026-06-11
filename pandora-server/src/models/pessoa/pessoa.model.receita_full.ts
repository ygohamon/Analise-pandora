
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITAFULL');

const fonte  = MODEL_PRIORITY['receita_full.pf'].fonte;
const rank   = MODEL_PRIORITY['receita_full.pf'].rank;
const grupo  = MODEL_PRIORITY['receita_full.pf'].grupo;

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
  CASE
    WHEN isdate(DataNascimento) = 1 THEN cast(DataNascimento as date)
    ELSE NULL
  END AS dataNascimento,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,UPPER(TipoSituacaoCadastralPF.Descricao) as situacaoCadastral,
  CASE
      WHEN AnoObito = 0 THEN NULL
      ELSE AnoObito
  END as anoObito,
  CASE
      WHEN isdate(DataAtualizacao) = 1 THEN cast(DataAtualizacao as date)
      ELSE NULL
  END AS dataAtualizacao,
  CASE
      WHEN (Estrangeiro) = 0 THEN 'NÃO'
      ELSE 'SIM'
  END AS estrangeiro,
  CASE
      WHEN (ResidenteExterior) = 0 THEN 'NÃO'
      ELSE 'SIM'
  END AS residenteExterior,
  UPPER(NomePaisExterior) as nomePaisExterior,
  CASE
      WHEN RIGHT(TituloEleitor, 12) = '000000000000' THEN NULL
      ELSE RIGHT(TituloEleitor, 12)
  END AS tituloEleitor,
  UPPER(TipoNaturezaOcupacao.Descricao) as naturezaOcupacao,
  CASE
      WHEN ExercicioOcupacao = 0 THEN NULL
      ELSE ExercicioOcupacao
  END as anoExercicioOcupacao,
  UPPER(TipoOcupacaoPrincipal.Tipo) as tipoOcupacaoPrincipal,
  UPPER(TipoOcupacaoPrincipal.Descricao) as ocupacaoPrincipal
`;

export let getPessoaDetalhadoCPF_ReceitaFull_PF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PF')}
            INNER JOIN ${modelConfig.get('SITUACAO')} ON (PF.SituacaoCadastral = TipoSituacaoCadastralPF.SituacaoCadastral)
            LEFT OUTER JOIN ${modelConfig.get('NATUREZA')} ON (PF.NaturezaOcupacao = TipoNaturezaOcupacao.NaturezaOcupacao)
            LEFT OUTER JOIN ${modelConfig.get('OCUPACAO')} ON (PF.OcupacaoPrincipal = TipoOcupacaoPrincipal.OcupacaoPrincipal)
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoCPF_ReceitaFull_PF = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaSimplificadoNome_ReceitaFull_PF = function (nome: string){

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

export let getPessoaSimplificadoTitulo_ReceitaFull_PF = function (titulo: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TITULO', ISql.VarChar, titulo],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE RIGHT(TituloEleitor, 12)=@TITULO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

export let getPessoaNomeMae_ReceitaFull_PF = function (nomeMae: string){

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

export let getPessoaTelefone_ReceitaFull_PF = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE Telefone=@TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
