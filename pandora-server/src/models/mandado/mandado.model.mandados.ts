// import { db, ISql } from '../../services/db.service';
// import { modelFactory as mf, getNomeFuncao } from '../../utils';
// import { getModelConfig } from '../../config.models';

// import { MODEL_PRIORITY, API_CONFIG } from './../../config';

// const modelConfig = getModelConfig('BD_MANDADO');

// const fonte = MODEL_PRIORITY['cnj.bnmp.mandado'].fonte; // = 'bnmp.mandado';
// const rank = MODEL_PRIORITY['cnj.bnmp.mandado'].rank; // 1;
// const grupo = MODEL_PRIORITY['cnj.bnmp.mandado'].grupo; // 1;

// const ATRIBUTOS_SIMPLIFICADO = `
//   CPF as cpf,
//   TRIM(UPPER(nome)) as nome,
//   CASE WHEN nome_mae = '' THEN NULL ELSE TRIM(UPPER(nome_mae)) END as nomeMae,
//   CASE WHEN municipio_nascimento = '' THEN NULL ELSE TRIM(UPPER(municipio_nascimento)) END as municipio,
//   CASE WHEN uf_nascimento = '' THEN NULL ELSE TRIM(UPPER(uf_nascimento)) END as uf,
//   CASE WHEN data_nascimento = '' THEN NULL ELSE TRY_CONVERT(DATE, data_nascimento, 103) END as dataNascimento,
//   '${modelConfig?.sigla}' as fonte
// `;

// const ATRIBUTOS_DETALHADO = ATRIBUTOS_SIMPLIFICADO + `
//   ,data_expedicao as dataExpedicao
//   ,data_validade as dataValidade
//   ,CASE WHEN tipo_prisao = '' THEN NULL ELSE TRIM(UPPER(tipo_prisao)) END as tipo
//   ,CASE WHEN regime_prisional = '' THEN NULL ELSE TRIM(UPPER(regime_prisional)) END as regime
//   ,CASE WHEN status = '' THEN NULL ELSE TRIM(UPPER(status)) END as status
//   ,numero_mandado_prisao as numMandado
//   ,numero_processo as numProcesso
//   ,tempo_pena_ano + '-' + tempo_pena_mes + '-' + tempo_pena_dia as tempoPena
//   ,TRIM(UPPER(orgao_expedidor)) as orgaoExp
//   ,TRIM(UPPER(orgao_expedidor_municipio)) as orgaoExpMun
//   ,TRIM(UPPER(orgao_expedidor_uf)) as orgaoExpUF
//   ,TRIM(UPPER(orgao_judiciario)) as orgaoJud
//   ,TRIM(UPPER(orgao_judiciario_municipio)) as orgaoJudMun
//   ,TRIM(UPPER(orgao_judiciario_uf)) as orgaoJudUF
//   ,LTRIM(RTRIM(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(sintese_decisao), CHAR(10), CHAR(32)),CHAR(13), CHAR(32)),CHAR(160), CHAR(32)),CHAR(9),CHAR(32)))) as decisao
//   ,CASE WHEN magistrado = '' THEN NULL ELSE TRIM(UPPER(magistrado)) END as magistrado
// `;

// export const getMandadoDetalhadoCPF_BNMP = function(cpf: string) {

//   const nomeFuncao = getNomeFuncao(1, 2);
//   const query = () => {
//     return db.query([
//       ['CPF', ISql.Char(11), cpf],
//       ],`
//         SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
//           ${ATRIBUTOS_DETALHADO}

//         FROM ${modelConfig.get('MANDADO')}
//         WHERE CPF=@CPF
//       `);
//   }

//   return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
// };

// export const getMandadoSimplificadoCPF_BNMP = function(cpf: string) {

//   const nomeFuncao = getNomeFuncao(1, 2);
//   const query = () => {
//     return db.query([
//       ['CPF', ISql.Char(11), cpf],
//       ],`
//         SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
//           ${ATRIBUTOS_SIMPLIFICADO}

//         FROM ${modelConfig.get('MANDADO')}
//         WHERE CPF=@CPF
//       `);
//   }

//   return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
// };

// export const getMandadoSimplificadoNome_BNMP = function(nome: string) {

//   const nomeFuncao = getNomeFuncao(1, 2);
//   const query = () => {
//     return db.query([
//       ['NOME', ISql.VarChar, nome],
//       ],`
//         SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
//           ${ATRIBUTOS_SIMPLIFICADO}

//         FROM ${modelConfig.get('MANDADO')}
//         WHERE CONTAINS(NOME, @NOME)
//       `);
//   }

//   return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
// };

// export const getMandadoSimplificadoNumMandado_BNMP = function(numMandado: string) {

//   const nomeFuncao = getNomeFuncao(1, 2);
//   const query = () => {
//     return db.query([
//       ['MANDADO', ISql.VarChar, numMandado],
//       ],`
//         SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
//           ${ATRIBUTOS_SIMPLIFICADO}

//         FROM ${modelConfig.get('MANDADO')}
//         WHERE numero_mandado_prisao=@MANDADO
//       `);
//   }

//   return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
// };

// export const getMandadoSimplificadoNumProcesso_BNMP = function(numProcesso: string) {

//   const nomeFuncao = getNomeFuncao(1, 2);
//   const query = () => {
//     return db.query([
//       ['PROCESSO', ISql.VarChar, numProcesso],
//       ],`
//         SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
//           ${ATRIBUTOS_SIMPLIFICADO}

//         FROM ${modelConfig.get('MANDADO')}
//         WHERE numero_processo=@PROCESSO
//       `);
//   }

//   return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
// };

