
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY } from './../../config';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { getModelConfig } from '../../config.models';

import { trataResultadosCruzamentoSisobi } from '.';

const modelSagres = getModelConfig('BD_SAGRES');
const modelReceita = getModelConfig('BD_RECEITA');
const modelObito = getModelConfig('BD_SISOBI');
const modelEndereco = getModelConfig('BD_ENDERECO');
const modelMisc = getModelConfig('BD_MISC');
const modelBF = getModelConfig('BD_BOLSAFAMILIA');
const modelSiaf = getModelConfig('BD_SIAF');
const modelTipologias = getModelConfig('BD_TIPOLOGIAS');
const modelEleitoral = getModelConfig('BD_ELEITORAL');
const modelCondenacoes = getModelConfig('BD_CONDENACOES');
const modelRais = getModelConfig('BD_RAIS');

const fonte = MODEL_PRIORITY['tipologias.cacafantasmas'].fonte;
const rank  = MODEL_PRIORITY['tipologias.cacafantasmas'].rank;
const grupo = MODEL_PRIORITY['tipologias.cacafantasmas'].grupo;

const tipologias = {
    'fp_sisobi':                    { codigo: 't1', peso: 5},
    'empenho_sisobi':               { codigo: 't2', peso: 5 },

    'fp_enderecosrf':               { codigo: 't3', peso: 2 },
    'fp_enderecosre':               { codigo: 't4', peso: 1 },

    'fp_sociopj':                   { codigo: 't5', peso: 2 },
    'fp_responsavelpj':             { codigo: 't6', peso: 2 },

    'fp_extravinculo_publico':      { codigo: 't7', peso: 4 },
    'fp_rais':                      { codigo: 't8', peso: 2 },

    'fp_analfabetos':               { codigo: 't9', peso: 5 },
    'fp_bolsafamilia':              { codigo: 't10', peso: 5 },
    // 'fp_bolsafamilia_veiculos':     { codigo: 't11', peso: 5 },

    'fp_siaf':                      { codigo: 't11', peso: 1 },

    'fp_tipologia_tcu':             { codigo: 't12', peso: 0.2 },
    'fp_tipologia_tcu_doadores':    { codigo: 't13', peso: 10 },
    'fp_rf_cpf_inexistente':        { codigo: 't14', peso: 100 },

    'fp_filiacaoregular':           { codigo: 't15', peso: 5 },
    'fp_filiacaocancelada':         { codigo: 't16', peso: 5 },

    'fp_cadicon':                   { codigo: 't17', peso: 5 },
    'fp_ceis':                      { codigo: 't18', peso: 5 },



    // 'fp_sociopj_empenho':           { codigo: 't7', peso: 10 },
    // 'fp_veiculos':                  { codigo: 't20', peso: 1 },
    // 'fp_sociopj_rais':             { codigo: 't21', peso: 50 },
}

export let getTipologiaSimplificadaFP_SISOBI = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_sisobi'].peso],
      ],`
          ;WITH SERVIDORES(CPF, MESANO)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor, FP.ano + RIGHT('00' + TRIM(FP.mes), 2)
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,SERVIDORES_COM_OBITO(CPF, NOMEFALECIDO, DATAOBITO, QTD, PIORPAGAMENTO)
          AS
          (
            SELECT S.CPF, O.Falecido, O.DT_OBITO, COUNT(*) as QTD, MAX(DATEDIFF(M, O.DT_OBITO, S.MESANO + '01'))
            FROM ${modelObito.get('OBITO')} O
              INNER JOIN SERVIDORES S ON (S.CPF = O.CPF)
            WHERE S.MESANO+'01' > O.DT_OBITO
            GROUP BY S.CPF, O.Falecido, O.DT_OBITO
          )
          , RESULTADO(CPF, NOME, NOMEFALECIDO, DATAOBITO, SCORE)
          AS
          (
            SELECT S.CPF, NOME, NOMEFALECIDO, DATAOBITO, QTD * @PESO_TIPOLOGIA + PIORPAGAMENTO/12
            FROM SERVIDORES_COM_OBITO  S
              INNER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
          )

          SELECT CPF as cpf, NOME as nome, NOMEFALECIDO as nomeFalecido, SCORE as score, '${tipologias['fp_sisobi'].codigo}' as tipologia
          FROM RESULTADO
          ORDER BY SCORE DESC
      `);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return trataResultadosCruzamentoSisobi(result);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo, fnProcessaDadosEncontrados});
}

export let getTipologiaSimplificadaFP_ENDERECOSRF = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_enderecosrf'].peso],
      ],`
          ;WITH SERVIDORES(CPF)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
          AS
          (
            SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
            FROM ${modelSagres.get('CODIGO_UGESTORA')} G
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
            WHERE G.cd_ugestora = @CDUGESTORA
          )
          ,ENDERECOS_SERVIDORES(CPF, NOME, S_MUNICIPIO, S_UF, S_MICRORREGIAO, UG_MICRORREGIAO, CUSTO)
          AS
          (
            SELECT
                PF.CPF, PF.Nome, PF.Municipio, PF.UF, MMM.MICROREGIAO, UG.MICROREGIAO,
                CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

            FROM ${modelReceita.get('PF')} PF
              INNER JOIN SERVIDORES S ON (PF.CPF = S.CPF)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PF.MUNICIPIO AND PF.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
            WHERE CUSTO.custo > 0 OR CUSTO.custo IS NULL
          )

          SELECT CPF as cpf, NOME as nome, CUSTO * @PESO_TIPOLOGIA as score, '${tipologias['fp_enderecosrf'].codigo}' as tipologia
          FROM ENDERECOS_SERVIDORES
          ORDER BY 3 DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadaFP_ENDERECOSRE = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_enderecosre'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
          AS
          (
            SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
            FROM ${modelSagres.get('CODIGO_UGESTORA')} G
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
          )
          ,ENDERECOS_SERVIDORES(CPF, S_MUNICIPIO, S_UF, S_MICRORREGIAO, UG_MICRORREGIAO, CUSTO)
          AS
          (
            SELECT
                S.CPF, E.Municipio, E.UF, MMM.MICROREGIAO, UG.MICROREGIAO,
                CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

            FROM SERVIDORES S
              INNER JOIN ${modelEndereco.get('ENDERECO')} E ON (S.CPF COLLATE Latin1_General_CI_AI = E.cpf_cnpj)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = E.MUNICIPIO AND E.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
            WHERE (CUSTO.custo > 0 OR CUSTO.custo IS NULL)
              AND NOT(E.UF = 'PB' AND MMM.MICROREGIAO IS NULL )
          )
          ,RESULTADO(CPF, MICRORREGIAO, UF, CUSTO, QTD)
          AS
          (
            SELECT CPF, S_MICRORREGIAO, S_UF, CUSTO, COUNT(*) AS QTD
            FROM ENDERECOS_SERVIDORES E
            GROUP BY CPF, S_MUNICIPIO, S_MICRORREGIAO, S_UF, CUSTO
          )

          SELECT R.CPF as cpf, PF.Nome as nome, SUM(CUSTO * QTD * @PESO_TIPOLOGIA) as score, '${tipologias['fp_enderecosre'].codigo}' as tipologia
          FROM RESULTADO R
              INNER JOIN ${modelReceita.get('PF')} PF ON (R.CPF = PF.CPF)
          GROUP BY R.CPF, PF.Nome
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadaEmpenhos_SISOBI = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['empenho_sisobi'].peso],
      ],`
          ;WITH EMPENHOS_COM_OBITO(CPF, NOME, NOMEFALECIDO, DATAOBITO, QTD, PIOREMPENHO)
          AS
          (
            SELECT RIGHT(E.cpf_cnpj_credor,11), E.credor, O.Falecido, O.DT_OBITO, COUNT(*) as QTD, MAX(DATEDIFF(M, O.DT_OBITO, CAST(E.data_emissao AS DATE)))
            FROM ${modelSagres.get('SM_EMPENHOS_PAGOS')} E
                INNER JOIN ${modelObito.get('OBITO')} O ON (RIGHT(E.cpf_cnpj_credor, 11) = O.CPF)

            WHERE E.cod_unidade_gestora = @CDUGESTORA
                AND FORMAT(CAST(E.data_emissao AS DATE), 'yyyyMM') BETWEEN @DT_INICIAL AND @DT_FINAL
                --AND E.tipo_credor = '1'
                AND CAST(E.data_emissao AS DATE) > O.DT_OBITO
                AND O.CPF <> '00000000000'
                AND E.cpf_cnpj_credor <> '00000000000191'
            GROUP BY E.cpf_cnpj_credor, E.credor, O.Falecido, O.DT_OBITO
          )
          , RESULTADO(CPF, NOME, NOMEFALECIDO, DATAOBITO, SCORE)
          AS
          (
            SELECT CPF, NOME, NOMEFALECIDO, DATAOBITO, QTD * @PESO_TIPOLOGIA + PIOREMPENHO/12
            FROM EMPENHOS_COM_OBITO
          )

          SELECT CPF as cpf, NOME as nome, NOMEFALECIDO as nomeFalecido, SCORE as score, '${tipologias['empenho_sisobi'].codigo}' as tipologia
          FROM RESULTADO
          ORDER BY SCORE DESC
      `);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return trataResultadosCruzamentoSisobi(result);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo, fnProcessaDadosEncontrados});
}

export let getTipologiaSimplificadaFP_SocioPJ = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_sociopj'].peso],
      ],`
          ;WITH SERVIDORES(CPF)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
          AS
          (
            SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
            FROM ${modelSagres.get('CODIGO_UGESTORA')} G
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
          )
          ,SERVIDORES_SOCIOS(CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO)
          AS
          (
            SELECT DISTINCT
                SERV.CPF, PJ.CNPJ, PJ.RazaoSocial, PJ.Municipio, PJ.UF, MMM.MICROREGIAO,
                CASE
                    WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20
                    ELSE Custo.custo + 1
                END as custo

            FROM ${modelReceita.get('SOCIO')} S
              INNER JOIN SERVIDORES SERV ON (('000' + SERV.CPF) = S.CpfCnpjSocio AND S.IdentificadorSocio = 2)
              INNER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = S.Cnpj)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PJ.MUNICIPIO AND PJ.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
          )
          ,RESULTADO(CPF, MICRORREGIAO, UF, CUSTO, QTD)
          AS
          (
            SELECT CPF, MICRORREGIAO, UF, CUSTO, COUNT(*) AS QTD
            FROM SERVIDORES_SOCIOS S
            GROUP BY CPF, MICRORREGIAO, UF, CUSTO
          )

          SELECT PF.CPF as cpf, PF.Nome as nome, SUM(CUSTO * QTD * @PESO_TIPOLOGIA) as score, '${tipologias['fp_sociopj'].codigo}' as tipologia
          FROM RESULTADO
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (RESULTADO.CPF = PF.CPF)
          GROUP BY PF.CPF, PF.Nome
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadaFP_ResponsavelPJ = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_responsavelpj'].peso],
      ],`
          ;WITH SERVIDORES(CPF)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            WHERE FP.cod_orgao = @CDUGESTORA AND CONCAT(FP.ano, FP.mes) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
          AS
          (
            SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
            FROM ${modelSagres.get('CODIGO_UGESTORA')} G
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
          )
          ,SERVIDORES_RESPONSAVEIS_EMPRESA(CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO)
          AS
          (
            SELECT DISTINCT
                SERV.CPF, PJ.CNPJ, PJ.RazaoSocial, PJ.Municipio,  PJ.UF, MMM.MICROREGIAO,
                CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo
            FROM ${modelReceita.get('PJ')} PJ
              INNER JOIN SERVIDORES SERV ON (SERV.CPF = PJ.CpfResponsavel)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PJ.MUNICIPIO AND PJ.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
          )
          ,RESULTADO(CPF, MICRORREGIAO, UF, CUSTO, QTD)
          AS
          (
            SELECT CPF, MICRORREGIAO, UF, CUSTO, COUNT(*) AS QTD
            FROM SERVIDORES_RESPONSAVEIS_EMPRESA S
            GROUP BY CPF, MICRORREGIAO, UF, CUSTO
          )

          SELECT PF.CPF as cpf, PF.Nome as nome, SUM(CUSTO * QTD * @PESO_TIPOLOGIA) as score, '${tipologias['fp_responsavelpj'].codigo}' as tipologia
          FROM RESULTADO
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (RESULTADO.CPF = PF.CPF)
          GROUP BY PF.CPF, PF.Nome
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_ExtraVinculos = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_extravinculo_publico'].peso],
      ],`
        ;WITH SERVIDORES_DO_ORGAO(CPF, ANO)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, FP.ano
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,UG(CD_UGESTORA, UGESTORA, MUNICIPIO, MICROREGIAO)
        AS
        (
          SELECT DISTINCT G.cd_Ugestora, G.de_orgao, G.no_Municipio, MMM.MICROREGIAO
          FROM ${modelSagres.get('CODIGO_UGESTORA')} G
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
        )
        ,EXTRA_VINCULOS(CPF, ANO, CD_UGESTORA)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, FP.ano, FP.cod_orgao
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
            INNER JOIN SERVIDORES_DO_ORGAO S ON (FP.cpf_servidor = S.CPF AND FP.ano = S.ANO)
          WHERE FP.cod_orgao <> @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,SERVIDORES_COM_EXTRAVINCULOS(CPF, ANO, CD_UGESTORA, UGESTORA, MUNICIPIO, MICRORREGIAO)
        AS
        (
          SELECT E.CPF, E.ANO, E.CD_UGESTORA, UG.UGESTORA, UG.MUNICIPIO, UG.MICROREGIAO
          FROM EXTRA_VINCULOS E
            LEFT OUTER JOIN UG ON (E.CD_UGESTORA = UG.CD_UGESTORA)
        )

        SELECT	S.CPF as cpf, PF.Nome as nome, SUM((CUSTO.custo+1) * @PESO_TIPOLOGIA) as score, '${tipologias['fp_extravinculo_publico'].codigo}' as tipologia
        FROM SERVIDORES_COM_EXTRAVINCULOS S
            INNER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
            LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
            LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = S.MICRORREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
        GROUP BY S.CPF, PF.Nome
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_SocioPJ_Empenhos = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_sociopj_empenho'].peso],
      ],`
        ;WITH SERVIDORES(CPF, ANO)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, FP.ano
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
        AS
        (
          SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
          FROM ${modelSagres.get('CODIGO_UGESTORA')} G
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
        )
        ,SERVIDORES_SOCIOS(ANO, CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO)
        AS
        (
          SELECT
              SERV.ANO, SERV.CPF, PJ.CNPJ, PJ.RazaoSocial, PJ.Municipio, PJ.UF, MMM.MICROREGIAO,
              CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

          FROM ${modelReceita.get('SOCIO')} S
            INNER JOIN SERVIDORES SERV ON (('000' + SERV.CPF) = S.CpfCnpjSocio AND S.IdentificadorSocio = 2)
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = S.Cnpj)
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PJ.MUNICIPIO AND PJ.UF = 'PB')
            LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
            LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
        )
        ,EMPRESAS_EMPENHO(CPF,  CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO, EMPENHADO, PAGAMENTO, QTD)
        AS
        (
          SELECT	S.CPF, S.CNPJ, S.RAZAOSOCIAL, S.MUNICIPIO, S.UF, S.MICRORREGIAO, S.CUSTO,
                  SUM(E.valor_empenho) AS EMPENHADO, SUM(E.valor_pago) AS PAGAMENTO, COUNT(*) AS QTD

          FROM SERVIDORES_SOCIOS S
              INNER JOIN ${modelSagres.get('SM_EMPENHOS_PAGOS')} E ON (S.CNPJ = E.cpf_cnpj_credor AND S.ANO = E.ano_emissao)
          WHERE E.cod_unidade_gestora = @CDUGESTORA AND FORMAT(E.data_emissao, 'yyyyMM') BETWEEN @DT_INICIAL AND @DT_FINAL
          GROUP BY S.CPF, S.CNPJ, S.RAZAOSOCIAL, S.MUNICIPIO, S.UF, S.MICRORREGIAO, S.CUSTO
        )
        ,RESULTADO(CPF, NOME, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO, QTD, FX_PAGO)
        AS
        (
          SELECT
              E.CPF, PF.Nome, CNPJ, RAZAOSOCIAL, E.MUNICIPIO, E.UF, MICRORREGIAO, CUSTO, QTD,
              CASE
                  WHEN PAGAMENTO > 0 AND PAGAMENTO <= 10000 THEN 1
                  WHEN PAGAMENTO > 10000 AND PAGAMENTO <= 100000 THEN 2
                  WHEN PAGAMENTO > 100000 AND PAGAMENTO <= 250000 THEN 3
                  WHEN PAGAMENTO > 250000 AND PAGAMENTO <= 500000 THEN 4
                  WHEN PAGAMENTO > 500000 AND PAGAMENTO <= 750000 THEN 5
                  WHEN PAGAMENTO > 750000 AND PAGAMENTO <= 1000000 THEN 6
                  WHEN PAGAMENTO > 1000000 THEN 7
                  ELSE 0
              END AS FX_PAGO
          FROM EMPRESAS_EMPENHO E
            INNER JOIN ${modelReceita.get('PF')} PF ON (E.CPF = PF.CPF)
        )

        SELECT CPF as cpf, NOME as nome, @PESO_TIPOLOGIA * ((FX_PAGO+1) * (FX_PAGO+1) + (QTD/CUSTO)) as score, '${tipologias['fp_sociopj_empenho'].codigo}' as tipologia
        FROM RESULTADO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_SocioPJ_BD_Rais = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_sociopj_rais'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,UG(CD_UGESTORA, MUNICIPIO, MICROREGIAO)
        AS
        (
          SELECT DISTINCT G.cd_Ugestora, G.no_Municipio, MMM.MICROREGIAO
          FROM ${modelSagres.get('CODIGO_UGESTORA')} G
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = G.no_Municipio)
        )
        ,SERVIDORES_SOCIOS(CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO)
        AS
        (
          SELECT DISTINCT
              SERV.CPF, PJ.CNPJ, PJ.RazaoSocial, PJ.Municipio, PJ.UF, MMM.MICROREGIAO,
              CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

          FROM ${modelReceita.get('SOCIO')} S
            INNER JOIN SERVIDORES SERV ON (('000' + SERV.CPF) = S.CpfCnpjSocio AND S.IdentificadorSocio = 2)
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = S.Cnpj)
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PJ.MUNICIPIO AND PJ.UF = 'PB')
            LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
            LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
        )
        ,EMPRESAS_FUNCIONARIOS(CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO, QTD_EMPREGADOS)
        AS
        (
          SELECT S.CPF, S.CNPJ, S.RAZAOSOCIAL, S.MUNICIPIO, S.UF, S.MICRORREGIAO,
                  S.CUSTO, COUNT(DISTINCT R.CO_CPF) as QTD_EMPREGADOS
          FROM SERVIDORES_SOCIOS S
            LEFT OUTER JOIN ${modelRais.get('RAIS')} R ON (S.CNPJ = R.CO_CNPJ_CEI)
          WHERE (R.ANO_RAIS BETWEEN LEFT(@DT_INICIAL,4) AND LEFT(@DT_FINAL,4))
          GROUP BY S.CPF, S.CNPJ, S.RAZAOSOCIAL, S.MUNICIPIO, S.UF, S.MICRORREGIAO, S.CUSTO
        )

        ,RESULTADO(CPF, NOME, CUSTO, QTD_EMPRESAS_FANTASMAS)
        AS
        (
          SELECT E.CPF, PF.Nome, CUSTO, COUNT(CNPJ)
          FROM EMPRESAS_FUNCIONARIOS E
              INNER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = E.CPF)
          WHERE QTD_EMPREGADOS = 0
          GROUP BY E.CPF, Pf.NOME, CUSTO
        )

        SELECT CPF as cpf, NOME as nome, SUM((@PESO_TIPOLOGIA * QTD_EMPRESAS_FANTASMAS)/CUSTO) as score, '${tipologias['fp_sociopj_rais'].codigo}' as tipologia
        FROM RESULTADO
        GROUP BY CPF, NOME
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_BolsaFamilia = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_bolsafamilia'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,SERVIDORES_BOLSA_FAMILIA(CPF)
        AS
        (
          SELECT DISTINCT BF.NUM_CPF_CADUNICO
          FROM SERVIDORES S
            INNER JOIN ${modelBF.get('BF')} BF ON (S.CPF = BF.NUM_CPF_CADUNICO)
        )

        SELECT S.CPF as cpf, PF.Nome as nome, 1 as score, '${tipologias['fp_bolsafamilia'].codigo}' as tipologia
        FROM SERVIDORES_BOLSA_FAMILIA S
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let _getTipologiaSimplificadoFP_BolsaFamilia = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_bolsafamilia'].peso],
      ],`
        ;WITH SERVIDORES(CPF, ANO)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, FP.ano
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,BOLSA_FAMILIA(NIS, ANO)
        AS
        (
          SELECT NISTitular, 2014 as ANO FROM ${modelBF.get('BF2014')}
            UNION
          SELECT NISTitular, 2015 as ANO FROM ${modelBF.get('BF2015')}
            UNION
          SELECT NISTitular, 2016 as ANO FROM ${modelBF.get('BF2016')}
        )

        SELECT S.CPF as cpf, PF.Nome as nome, 1 as score, '${tipologias['fp_bolsafamilia'].codigo}' as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelBF.get('CAD')} CAD ON (CAD.CPF = S.CPF)
          INNER JOIN BOLSA_FAMILIA BF ON (BF.NIS = CAD.NIS AND S.ANO = BF.ANO)
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_SIAF = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_siaf'].peso],
      ],`
          ;WITH SERVIDORES(CPF)
          AS
          (
            SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
          )
          ,SERVIDOR_CONTAS_BANCARIAS(CPF, BANCO, AGENCIA, CONTA, DIGITO, DESCRICAO)
          AS
          (
            SELECT S.CPF as cpf, CC.banco, CC.agencia, CC.conta, CC.digito, CC.ds_conta
            FROM SERVIDORES S
              INNER JOIN ${modelSiaf.get('CREDORES')} C ON (C.nu_cnpj_cpf = S.CPF)
              INNER JOIN ${modelSiaf.get('CREDORES_CONTAS')} CC ON (C.cd = CC.cd_credor)
          )
          ,RESULTADO(CPF, BANCO, AGENCIA, CONTA, QTD)
          AS
          (
            SELECT S.CPF, S.BANCO, S.AGENCIA, S.CONTA, COUNT(cd_credor) AS QTD
            FROM SERVIDOR_CONTAS_BANCARIAS S
              INNER JOIN ${modelSiaf.get('CREDORES_CONTAS')} CC ON (CC.banco = S.BANCO AND CC.agencia = S.AGENCIA AND CC.conta = S.CONTA AND CC.digito = S.DIGITO)
            GROUP BY S.CPF, S.BANCO, S.AGENCIA, S.CONTA
          )

          SELECT PF.CPF as cpf, PF.Nome as nome, QTD as score, '${tipologias['fp_siaf'].codigo}' as tipologia
          FROM RESULTADO
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (RESULTADO.CPF = PF.CPF)
          WHERE QTD > 1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_TipologiasTCU = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Float, tipologias['fp_tipologia_tcu'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, Credor as nome, CAST(TotalPesoTipologia * @PESO_TIPOLOGIA AS INT) as score, ${tipologias['fp_tipologia_tcu'].codigo} as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelTipologias.get('PF')} T ON (S.CPF = T.CPF)
        WHERE T.TotalOcorrencias > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_TipologiasTCU_Doadores = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_tipologia_tcu_doadores'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        , RESULTADO(CPF, NOME, FAIXA)
        AS
        (
          SELECT S.CPF as cpf, Credor as nome,
              CASE
                  WHEN T.DoacaoEleitoral < 5000 THEN 1
                  WHEN T.DoacaoEleitoral >= 5000 AND T.DoacaoEleitoral < 10000 THEN 2
                  WHEN T.DoacaoEleitoral >= 10000 AND T.DoacaoEleitoral < 50000 THEN 3
                  WHEN T.DoacaoEleitoral >= 50000 AND T.DoacaoEleitoral < 100000 THEN 4
                  WHEN T.DoacaoEleitoral >= 100000 AND T.DoacaoEleitoral < 500000 THEN 5
                  WHEN T.DoacaoEleitoral >= 500000 AND T.DoacaoEleitoral < 1000000 THEN 6
                  ELSE 7
              END as score

          FROM SERVIDORES S
            INNER JOIN ${modelTipologias.get('PF')} T ON (S.CPF = T.CPF)
          WHERE T.T27 <> 0 OR T.T28 <> 0 OR T.T29 <> 0 OR T.T30 <> 0 OR T.T31 <> 0
        )

        SELECT CPF as cpf, NOME as nome, @PESO_TIPOLOGIA * FAIXA as score, '${tipologias['fp_tipologia_tcu_doadores'].codigo}' as tipologia
        FROM RESULTADO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_Analfabetos = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_analfabetos'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, NOME_ELEITOR as nome, @PESO_TIPOLOGIA as score, '${tipologias['fp_analfabetos'].codigo}' as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelEleitoral.get('ANALFABETOS')} A ON (S.CPF = A.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_BD_RAIS = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_rais'].peso],
      ],`
        ;WITH SERVIDORES(CPF, ANO)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor, FP.ano
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,SERVIDORES_COM_VINCULOS_PRIVADOS(CPF, ANO, QTD)
        AS
        (
          SELECT S.CPF, R.ANO_RAIS, COUNT(DISTINCT R.CO_CNPJ_CEI) AS QTD
          FROM SERVIDORES S
            INNER JOIN ${modelRais.get('RAIS')} R  ON (S.CPF = R.CO_CPF AND S.ANO = R.ANO_RAIS)
          WHERE R.CO_TIPO_VINCULO_RAIS NOT IN (30, 31, 35) -- Remove agentes públicos
          GROUP BY S.CPF, R.ANO_RAIS
        )

        SELECT PF.CPF as cpf, PF.Nome as nome, SUM(QTD * @PESO_TIPOLOGIA) as score, '${tipologias['fp_rais'].codigo}' as tipologia
        FROM SERVIDORES_COM_VINCULOS_PRIVADOS S
            LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
        GROUP BY PF.CPF, PF.Nome
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_CPFInexistente = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_rf_cpf_inexistente'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF, @PESO_TIPOLOGIA as score, '${tipologias['fp_rf_cpf_inexistente'].codigo}' as tipologia
        FROM SERVIDORES S
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
        WHERE PF.CPF IS NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_FiliacaoPartidariaRegular = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_filiacaoregular'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, MAX(F.nome) as nome, COUNT(*) * @PESO_TIPOLOGIA as score, '${tipologias['fp_filiacaoregular'].codigo}' as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelEleitoral.get('FILIACAO')} F ON (S.CPF = F.CPF)
        WHERE situacaoRegistro='REGULAR'
        GROUP BY S.CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_FiliacaoPartidariaCancelada = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_filiacaocancelada'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, MAX(F.nome) as nome, COUNT(*) * @PESO_TIPOLOGIA as score, '${tipologias['fp_filiacaocancelada'].codigo}' as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelEleitoral.get('FILIACAO')} F ON (S.CPF = F.CPF)
        WHERE situacaoRegistro IN ('CANCELADO', 'DESFILIADO')
        GROUP BY S.CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_Cadicon = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_cadicon'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, UPPER(C.NOME_RESPONSAVEL) as nome, COUNT(*) * @PESO_TIPOLOGIA as score, '${tipologias['fp_cadicon'].codigo}' as tipologia
        FROM SERVIDORES S
            INNER JOIN ${modelCondenacoes.get('CADICON')} C ON (S.CPF = C.NUM_CPF)
        GROUP BY S.CPF, C.NOME_RESPONSAVEL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaSimplificadoFP_CEIS = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(8), dtInicio],
      ['DT_FINAL', ISql.Char(8), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ['PESO_TIPOLOGIA', ISql.Int, tipologias['fp_ceis'].peso],
      ],`
        ;WITH SERVIDORES(CPF)
        AS
        (
          SELECT DISTINCT FP.cpf_servidor
          FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          WHERE FP.cod_orgao = @CDUGESTORA AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )

        SELECT S.CPF as cpf, UPPER(C.NOME_RAZAO_SOCIAL) as nome, COUNT(*) * @PESO_TIPOLOGIA as score, '${tipologias['fp_ceis'].codigo}' as tipologia
        FROM SERVIDORES S
          INNER JOIN ${modelCondenacoes.get('CEIS')} C  ON (S.CPF = C.CPF_CNPJ_SANCIONADA)
        GROUP BY S.CPF, C.NOME_RAZAO_SOCIAL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}
