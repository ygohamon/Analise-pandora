
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SISOBI');

const fonte  = MODEL_PRIORITY['sisobi'].fonte;
const rank   = MODEL_PRIORITY['sisobi'].rank;
const grupo  = MODEL_PRIORITY['sisobi'].grupo;

const ATRIBUTOS_BASICOS = `
  CPF as obito_cpf,
  FALECIDO as obito_nome,
  MAE as obito_nomeMae,
  DT_NASC as obito_dataNascimento,
  DT_OBITO as obito_dataObito,
  UPPER(MUNICIPIO) as obito_municipioServentia,
  UF as obito_ufServentia,
  '${modelConfig.sigla}' as fonte

`

export let getObitoDetalhadoCPF_BD_SISOBI = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_BASICOS}
            ,CARTORIO as obito_nomeFantasia,
            NR_LIVRO as obito_livro,
            NR_FOLHA as obito_folha,
            NR_TERMO as obito_termo

        FROM ${modelConfig.get('OBITO')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getObitoSimplificadoCPF_BD_SISOBI = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_BASICOS}

        FROM ${modelConfig.get('OBITO')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getObitoSimplificadoNome_BD_SISOBI = function (nome: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['NOME', ISql.VarChar, nome],
      ],`
        SELECT DISTINCT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${ATRIBUTOS_BASICOS}

        FROM ${modelConfig.get('OBITO')}
        WHERE CONTAINS(Falecido, @NOME)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
