
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITAFULL');

const fonte  = MODEL_PRIORITY['receita_full.pj'].fonte;
const rank   = MODEL_PRIORITY['receita_full.pj'].rank;
const grupo  = MODEL_PRIORITY['receita_full.pj'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CNPJ as cnpj,
  TRIM(NomeFantasia) as nomeFantasia,
  TRIM(RazaoSocial) as razaoSocial,
  CASE WHEN isdate(DataInicioAtividade) = 1 THEN cast(DataInicioAtividade as date) ELSE NULL END as dataInicioAtividade,
  TRIM(Municipio) as municipio,
  TRIM(UF) as uf,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,CASE WHEN Matriz = 1 THEN 'S' ELSE 'N' END AS matriz,
  TipoSituacaoCadastralPJ.Descricao as situacaoCadastral,
  TipoNaturezaJuridica.Descricao as naturezaJuridica,
  TipoPorte.DescricaoPorte as porte,
  CASE WHEN isdate(DataSituacaoCadastral) = 1 THEN cast(DataSituacaoCadastral as date) ELSE NULL END as dataSituacaoCadastral,
  TipoCNAE.DescricaoSecao as cnaeSecao,
  TipoCNAE.DescricaoDivisao as cnaeDivisao,
  TipoCNAE.DescricaoSecao as cnaeGrupo,
  TipoCNAE.DescricaoClasse as cnaeClasse,
  TipoCNAE.DescricaoSubclasse as cnaeSubClasse,
  CPFResponsavel as cpfResponsavel,
  NomeResponsavel as nomeResponsavel
`;

export let getEmpresaDetalhadoCNPJ_ReceitaFull_PJ = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PJ')}
            INNER JOIN ${modelConfig.get('SITUACAOPJ')} ON (PJ.SituacaoCadastral = TipoSituacaoCadastralPJ.SituacaoCadastral)
            INNER JOIN ${modelConfig.get('PORTE')} ON (PJ.Porte = TipoPorte.Porte)
            LEFT OUTER JOIN ${modelConfig.get('NATUREZAPJ')} ON (PJ.CodigoNaturezaJuridica = TipoNaturezaJuridica.CodigoNaturezaJuridica)
            LEFT OUTER JOIN ${modelConfig.get('CNAE')} ON (PJ.CNAEFiscal = TipoCNAE.CodigoCNAE)
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoCNPJ_ReceitaFull_PJ = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoRazaoSocial_ReceitaFull_PJ = function (razaoSocial: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['RAZAOSOCIAL', ISql.VarChar, razaoSocial],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CONTAINS(RazaoSocial, @RAZAOSOCIAL)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoNomeFantasia_ReceitaFull_PJ = function (nomeFantasia: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['NOMEFANTASIA', ISql.VarChar, nomeFantasia],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('PJ')}
      WHERE CONTAINS(NomeFantasia, @NOMEFANTASIA)
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoCPFResponsavel_ReceitaFull = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_SIMPLIFICADO}
          ,'responsavel' as vinculo

        FROM ${modelConfig.get('PJ')}
        WHERE CPFResponsavel=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


/**
 * Retorna todas as empresas que o CPF é sócio
 * @param cpf
 */
export let getEmpresaSimplificadoSocioPFCPF_ReceitaFull = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar, cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.Nome as socio_nome, S.CPF as socio_cpf, S.PercentualCapitalSocial as socio_percCapital,

            S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
            PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
            CASE
                WHEN isdate(PJ.DataInicioAtividade) = 1 THEN cast(PJ.DataInicioAtividade as date)
                ELSE NULL
            END as dataInicioAtividade,
            PJ.Municipio as municipio, PJ.UF as uf,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIOPF')} AS S
            INNER JOIN ${modelConfig.get('PJ')} ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CPF=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPFNome_ReceitaFull = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['NOME', ISql.VarChar, nome],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          S.Nome as socio_nome, S.CPF as socio_cpf, S.PercentualCapitalSocial as socio_percCapital,

          S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
          PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
          CASE
              WHEN isdate(PJ.DataInicioAtividade) = 1 THEN cast(PJ.DataInicioAtividade as date)
              ELSE NULL
          END as dataInicioAtividade,
          PJ.Municipio as municipio, PJ.UF as uf,
          '${modelConfig?.sigla}' as fonte

      FROM ${modelConfig.get('SOCIOPF')} AS S
          INNER JOIN ${modelConfig.get('PJ')} ON (S.CNPJ = PJ.CNPJ)
      WHERE CONTAINS(S.Nome, @NOME)
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPJCNPJ_ReceitaFull = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.RazaoSocial as socio_razaoSocial, S.CNPJSocio as socio_cnpj, S.PercentualCapitalSocial as socio_percCapital,

            PJ.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
            PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
            CASE
                WHEN isdate(PJ.DataInicioAtividade) = 1 THEN cast(PJ.DataInicioAtividade as date)
                ELSE NULL
            END as dataInicioAtividade,
            PJ.Municipio as municipio, PJ.UF as uf,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIOPJ')} AS S
            INNER JOIN ${modelConfig.get('PJ')} ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CNPJSocio=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
