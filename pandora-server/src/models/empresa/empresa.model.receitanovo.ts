
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITANOVO');

const fonte  = MODEL_PRIORITY['receitanovo.pessoajuridica'].fonte;
const rank   = MODEL_PRIORITY['receitanovo.pessoajuridica'].rank;
const grupo  = MODEL_PRIORITY['receitanovo.pessoajuridica'].grupo;


const ATRIBUTOS_SIMPLIFICADO = `
  CNPJ as cnpj,
  NomeFantasia as nomeFantasia,
  RazaoSocial as razaoSocial,
  Municipio as municipio,
  UF as uf,
  cast(DataInicioAtividade as date) as dataInicioAtividade,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,CASE WHEN IdentificadorMatrizFilial = 1 THEN 'S' ELSE 'N' END AS matriz,
  CPFResponsavel as cpfResponsavel,
  NomeResponsavel as nomeResponsavel
`;

export let getEmpresaDetalhadoCNPJ_ReceitaNovo_PessoaJuridica = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoCNPJ_ReceitaNovo_PessoaJuridica = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoLogradouro_ReceitaNovo_PessoaJuridica = function (logradouro: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['LOGRADOURO', ISql.VarChar, logradouro],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CONTAINS(Logradouro, @LOGRADOURO)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoRazaoSocial_ReceitaNovo_PessoaJuridica = function (razaoSocial: string){

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

export let getEmpresaSimplificadoNomeFantasia_ReceitaNovo_PessoaJuridica = function (nomeFantasia: string){

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

export let getEmpresaSimplificadoCPFResponsavel_ReceitaNovo = function (cpf: string){

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
export let getEmpresaSimplificadoSocioPFCPF_ReceitaNovo = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), '000' + cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as socio_nome, RIGHT(S.CpfSocio, 11) as socio_cpf,
            CAST(S.PercentualCapitalSocial AS float)/100 as socio_percCapital,

            S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
            PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio, PJ.UF as uf,
            cast(PJ.DataInicioAtividade as date) as dataInicioAtividade, '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CpfSocio=@CPF AND S.IdentificadorSocio=2
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPFNome_ReceitaNovo = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as socio_nome, RIGHT(S.CpfSocio, 11) as socio_cpf,
            CAST(S.PercentualCapitalSocial AS float)/100 as socio_percCapital,

            S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
            PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio, PJ.UF as uf,
            cast(PJ.DataInicioAtividade as date) as dataInicioAtividade, '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE CONTAINS(S.NomeSocio, @NOME) AND S.IdentificadorSocio=2
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPJCNPJ_ReceitaNovo = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as socio_razaoSocial,
            S.CpfSocio as socio_cnpj,
            CAST(S.PercentualCapitalSocial AS float)/100 as socio_percCapital,

            S.CNPJ as cnpj, PJ.RazaoSocial as razaoSocial, PJ.NomeFantasia as nomeFantasia,
            PJ.CPFResponsavel as cpfResponsavel, PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio, PJ.UF as uf,
            cast(PJ.DataInicioAtividade as date) as dataInicioAtividade, '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CpfSocio=@CNPJ AND S.IdentificadorSocio=1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
