
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_EMBARCACOES');

const fonte  = MODEL_PRIORITY['bd_embarcacoes.embarcacoes'].fonte;
const rank   = MODEL_PRIORITY['bd_embarcacoes.embarcacoes'].rank;
const grupo  = MODEL_PRIORITY['bd_embarcacoes.embarcacoes'].grupo;

const ATRIBUTOS_DETALHADO = `
  TRIM(CPF_CNPJ) as cpfCnpj
  ,NOME_PESSOA as nome
  ,TIPO_PESSOA_FISICA_JURIDICA as tipoPessoa
  ,DS_NOME_EMBARCACAO as embarcacao
  ,TIPO_EMBARCACAO as descricao
  ,ANO_CONSTRUCAO as anoConstrucao
  ,CAST(CAST(NR_COMPRIMENTO AS money)/10000 AS FLOAT) as comprimento
  ,CONSTRUTOR_CASCO as constCasco
  ,NR_INSCRICAO as inscricao
  ,SITUACAO_EMBARCACAO as situacao
  ,DT_INSCRICAO_EMB as dataInscricao
  ,DT_VALIDADE_DOC_EMB as dataValidade
  ,ORGAO_INSCRICAO as orgaoInscricao
  ,DS_CIDADE_ORGAO as cidadeOrgao
  ,DATA_AQUISICAO as dataAquisicao
  ,ULT_LOCAL_AQUISICAO_PROP_ATUAL as localAquisicao
  ,CASE
      WHEN ULT_VALOR_AQUISICAO_PROP_ATUAL = ',00' THEN NULL
      ELSE CAST(CAST(ULT_VALOR_AQUISICAO_PROP_ATUAL AS money)/100 AS FLOAT)
  END as valor
  ,ANO_MES_CARGA as dataCarga
  ,'${modelConfig.get('FONTE_EMB')}' as fonte
`;


export let getEmbarcacaoDetalhadoCPF_BD_Embarcacao_Embarcacao = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('EMBARCACOES')}
        WHERE CPF_CNPJ = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmbarcacaoDetalhadoCNPJ_BD_Embarcacao_Embarcacao = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${ATRIBUTOS_DETALHADO}

        FROM ${modelConfig.get('EMBARCACOES')}
        WHERE CPF_CNPJ = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmbarcacaoDetalhadoNome = function (nome: String) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DS_NOME_EMBARCACAO', ISql.VarChar, nome],
      ],
      `SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
        ${ATRIBUTOS_DETALHADO}

      FROM ${modelConfig.get('EMBARCACOES')}
      WHERE DS_NOME_EMBARCACAO = @DS_NOME_EMBARCACAO`
      );
    }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo })
};

export let getEmbarcacaoDetalhadoNumeroInscricao = function (inscricao: string) {

  const nomeFuncao = getNomeFuncao(1,2);
  const query = () => {
    return db.query([
      ['NR_INSCRICAO', ISql.VarChar, inscricao],
    ],
    `SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
      ${ATRIBUTOS_DETALHADO}
      
    FROM ${modelConfig.get('EMBARCACOES')}
    WHERE NR_INSCRICAO = @NR_INSCRICAO`
    );
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo })
} 

