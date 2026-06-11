
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_DOI');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte  = MODEL_PRIORITY['itbi'].fonte;
const rank   = MODEL_PRIORITY['itbi'].rank;
const grupo  = MODEL_PRIORITY['itbi'].grupo;


const ATRIBUTOS_DETALHADO = `
  CNPJ_CARTORIO AS cartorioCnpj
  ,TRIM(PJ.Municipio) AS cartorioMunicipio
  ,PJ.Uf as cartorioUf
  -- ,TRIM(PJ.Logradouro) as cartorioLogradouro
  ,NOME_CARTORIO as cartorioRazaoSocial
  ,TP_CARTORIO as tipoCartorio
  ,TRY_CONVERT(DATE, DT_LAVRATURA, 103) as dataLavratura
  ,NR_LIVRO as livro
  ,FOLHA as folha
  ,MATRICULA as matricula
  ,REGISTRO as registro
  ,CPF_CNPJ_ALIENANTE as cpfCnpjAlienante
  ,NOME_ALIENANTE as alientante
  ,CPF_CNPJ_ADQUIRENTE as cpfCnpjAdquirente
  ,NOME_ADQUIRENTE as adquirente
  ,TRY_CONVERT(DATE, DT_CARGA, 103) as dataCarga
  ,'${modelConfig?.sigla}' as fonte

`;

export let getImovelCPFAdquirente_BD_DOI = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_DETALHADO}
          ,'adquirente' as tipo

        FROM ${modelConfig.get('DOI')} D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ_CARTORIO = PJ.CNPJ)
        WHERE CPF_CNPJ_ADQUIRENTE = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getImovelCNPJAdquirente_BD_DOI = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
          ${ATRIBUTOS_DETALHADO}
          ,'adquirente' as tipo

        FROM ${modelConfig.get('DOI')} D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ_CARTORIO = PJ.CNPJ)
        WHERE CPF_CNPJ_ADQUIRENTE = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getImovelCPFAlienante_BD_DOI = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
          ${ATRIBUTOS_DETALHADO}
          ,'alienante' as tipo
        FROM ${modelConfig.get('DOI')} D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ_CARTORIO = PJ.CNPJ)
        WHERE CPF_CNPJ_ALIENANTE = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getImovelCNPJAlienante_BD_DOI = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
          ${ATRIBUTOS_DETALHADO}
          ,'alienante' as tipo
        FROM ${modelConfig.get('DOI')} D
          LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (D.CNPJ_CARTORIO = PJ.CNPJ)
        WHERE CPF_CNPJ_ALIENANTE = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
