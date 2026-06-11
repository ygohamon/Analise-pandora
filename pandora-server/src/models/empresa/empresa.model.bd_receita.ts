
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte  = MODEL_PRIORITY['bd_receita.pj'].fonte;
const rank   = MODEL_PRIORITY['bd_receita.pj'].rank;
const grupo  = MODEL_PRIORITY['bd_receita.pj'].grupo;

const ATRIBUTOS_SIMPLIFICADO = `
  CNPJ as cnpj,
  TRIM(RazaoSocial) as razaoSocial,
  TRIM(NomeFantasia) as nomeFantasia,
  TRY_CAST(DataInicioAtividade as date) as dataInicioAtividade,
  TRIM(Municipio) as municipio,
  TRIM(Uf) as uf,
  '${modelConfig?.sigla}' as fonte
`;

const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
  ,CASE WHEN IdentificadorMatrizFilial = 1 THEN 'S' ELSE 'N' END as matriz
  ,SITUACAOPJ.Descricao as situacaoCadastral
  ,TRY_CAST(DataSituacaoCadastral as date) as dataSituacaoCadastral
  ,NATUREZAPJ.DsNaturezaJuridica as naturezaJuridica
  ,CNAE.DsCNAE as cnaeFiscal
  ,CNAES.DsCNAE as cnaeSecundario
  ,TRY_CAST(CapitalSocialEmpresa as money)/100 as capitalSocial
  ,PORTE.Descricao as porte
  ,CpfResponsavel as cpfResponsavel
  ,NomeResponsavel as nomeResponsavel
`;

export let getEmpresaDetalhadoCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['CNPJ', ISql.Char(14), cnpj],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}

      FROM ${modelConfig.get('PJ')} PJ
        LEFT OUTER JOIN ${modelConfig.get('SITUACAOPJ')} SITUACAOPJ ON (PJ.SituacaoCadastralPJ = SITUACAOPJ.SituacaoCadastralPJID)
        LEFT OUTER JOIN ${modelConfig.get('NATUREZAPJ')} NATUREZAPJ ON (PJ.CodigoNaturezaJuridica = NATUREZAPJ.CdNaturezaJuridica)
        LEFT OUTER JOIN ${modelConfig.get('CNAE')} CNAE ON (PJ.CnaeFiscal = CNAE.CdCNAE)
        LEFT OUTER JOIN ${modelConfig.get('CNAE')} CNAES ON (PJ.CnaeSecundaria1 = CNAES.CdCNAE)
        LEFT OUTER JOIN ${modelConfig.get('PORTE')} PORTE ON (PJ.PorteEmpresa = PORTE.PorteEmpresaID)
      WHERE PJ.CNPJ=@CNPJ
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoCNPJ_BD_Receita = function (cnpj: string){

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

export let getEmpresaSimplificadoLogradouro_BD_Receita = function (logradouro: string){

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

export let getEmpresaSimplificadoRazaoSocial_BD_Receita = function (razaoSocial: string){

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

export let getEmpresaSimplificadoNomeFantasia_BD_Receita = function (nomeFantasia: string){

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

export let getEmpresaSimplificadoEmail_BD_Receita = function (email: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['EMAIL', ISql.VarChar, email],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CorreioEletronico=@EMAIL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoTelefone_BD_Receita = function (telefone: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['TELEFONE', ISql.VarChar, telefone],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE DddTelefone1=@TELEFONE OR DddTelefone2=@TELEFONE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoContadorPF_BD_Receita = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}
            ,'contador' as vinculo

        FROM ${modelConfig.get('CONTADOR')} C
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (C.NUM_CNPJ_EMPRESA = PJ.CNPJ)
        WHERE NUM_CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoCPFResponsavel_BD_Receita = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_SIMPLIFICADO}
            ,'responsavel' as vinculo

        FROM ${modelConfig.get('PJ')}
        WHERE CpfResponsavel=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPFCPF_BD_Receita = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(14), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NOME as socio_nome,
            S.NUM_CPF as socio_cpf,
            CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
            CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
            CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,

            S.NUM_CNPJ_EMPRESA as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            -- PJ.CPFResponsavel as cpfResponsavel,
            -- PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio,
            PJ.UF as uf,
            CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            LEFT OUTER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
        WHERE S.NUM_CPF=@CPF
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


export let getEmpresaSimplificadoSocioPFNome_BD_Receita = function (nome: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NOME as socio_nome,
            RIGHT(S.NUM_CPF, 11) as socio_cpf,
            CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
            CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
            CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,

            S.NUM_CNPJ_EMPRESA as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            --PJ.CPFResponsavel as cpfResponsavel,
            --PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio,
            PJ.UF as uf,
            CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
        WHERE CONTAINS(S.NOME, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpresaSimplificadoSocioPJCNPJ_BD_Receita = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.VarChar, cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NOME as socio_razaoSocial,
            S.NUM_CNPJ as socio_cnpj,
            CASE WHEN S.DATA_ENTRADA_SOCIEDADE = '' THEN NULL ELSE S.DATA_ENTRADA_SOCIEDADE END as dataEntrada,
            CASE WHEN S.DATA_DE_EXCLUSAO_NA_SOCIEDADE = '' THEN NULL ELSE S.DATA_DE_EXCLUSAO_NA_SOCIEDADE END as dataSaida,
            CAST(S.VALOR_PERCENTUA_CAPITAL_SOCIAL AS float) as socio_percCapital,

            S.NUM_CNPJ_EMPRESA as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            --PJ.CPFResponsavel as cpfResponsavel,
            --PJ.NomeResponsavel as nomeResponsavel,
            PJ.Municipio as municipio,
            PJ.UF as uf,
            CAST(PJ.DataInicioAtividade as date) as dataInicioAtividade,
            '${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            INNER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.CNPJ)
        WHERE S.NUM_CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
