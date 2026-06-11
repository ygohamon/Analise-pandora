
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

const fonte = MODEL_PRIORITY['tipologias.cacafantasmas'].fonte;
const rank  = MODEL_PRIORITY['tipologias.cacafantasmas'].rank;
const grupo = MODEL_PRIORITY['tipologias.cacafantasmas'].grupo;

const tipologias = {
    'fp_sisobi':            { codigo: 't1', peso: 5 },
    'empenho_sisobi':       { codigo: 't2', peso: 5 },

    'fp_enderecosrf':       { codigo: 't3', peso: 3 },
    'fp_enderecosre':       { codigo: 't4', peso: 1 },

    'fp_sociopj':           { codigo: 't5', peso: 2 },
    'fp_responsavelpj':     { codigo: 't6', peso: 2 },
    'fp_sociopj_empenho':   { codigo: 't7', peso: 10 },

    'fp_extravinculo':      { codigo: 't8', peso: 8 },
    'fp_sociopj_rais':     { codigo: 't9', peso: 50 },
}

export let getTipologiaDetalhadaFP_SISOBI = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ],`
        SELECT
            PF.Nome as nome
            ,O.Falecido as nomeFalecido
            ,FP.cpf_servidor AS cpf
            ,FP.matricula AS matricula
            ,FP.cargo
            ,FP.ano + RIGHT('00' + TRIM(FP.mes), 2) AS mesAno
            ,O.DT_OBITO as dataObito
            ,DATEDIFF(M, O.DT_OBITO, FP.ano + RIGHT('00' + TRIM(FP.mes), 2) + '01') AS mesesFalecido
            ,FP.vinculo AS natureza
            ,SUM(valor_remuneracao_total) AS remuneracaoBruta
            '${tipologias['fp_sisobi'].codigo}' as tipologia

        FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} FP
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (FP.cpf_servidor = PF.CPF)
          LEFT OUTER JOIN ${modelObito.get('OBITO')} O ON (FP.cpf_servidor = O.CPF)

        WHERE FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
            AND FP.cod_orgao = @CDUGESTORA
            AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) + '01' > O.DT_OBITO

        GROUP BY
          PF.Nome, O.Falecido, FP.cpf_servidor, FP.matricula, FP.cargo
          ,FP.ano + RIGHT('00' + TRIM(FP.mes), 2), FP.vinculo, O.DT_OBITO

        ORDER BY nome, mesAno DESC
      `);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return trataResultadosCruzamentoSisobi(result);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo, fnProcessaDadosEncontrados});
}

export let getTipologiaDetalhadaEmpenhos_SISOBI = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
      ],`
        SELECT
            RIGHT(E.cpf_cnpj_credor, 11) as cpf,
            E.credor as nome,
            O.Falecido as nomeFalecido,
            E.historico as descricaoEmpenho,
            E.modalidade_licitacao as descLicitacao,
            E.numero_empenho as numEmpenho,
            CAST(E.data_emissao AS DATE) as dataEmpenho,
            CAST(E.data_pagamento AS DATE) AS dataPagamento,
            CAST(REPLACE(E.valor_empenho, ',', '.') AS FLOAT) as vlEmpenho,
            CAST(REPLACE(E.valor_pago, ',', '.') AS FLOAT) as vlPagamento,
            O.DT_OBITO as dataObito,
            DATEDIFF(M, O.DT_OBITO, CAST(E.data_emissao AS DATE)) AS mesesFalecido,
            '${tipologias['empenho_sisobi'].codigo}' as tipologia

        FROM ${modelSagres.get('SM_EMPENHOS_PAGOS')} E
            INNER JOIN ${modelObito.get('OBITO')} O ON (RIGHT(E.cpf_cnpj_credor, 11) = O.CPF)

        WHERE E.cod_unidade_gestora = @CDUGESTORA
            AND FORMAT(CAST(E.data_emissao AS DATE), 'yyyyMM') BETWEEN @DT_INICIAL AND @DT_FINAL
            AND CAST(E.data_emissao AS DATE) > O.DT_OBITO	-- EMPENHADO POS MORTE
            AND O.CPF <> '00000000000' -- CPF INVALIDO
            AND E.cpf_cnpj_credor <> '00000000000191' -- CPF INVALIDO

        GROUP BY
            E.cpf_cnpj_credor, E.credor, E.historico, E.numero_empenho, E.data_emissao,
            E.valor_empenho, E.valor_pago, E.data_pagamento, O.CPF, O.Falecido, O.DT_OBITO

        ORDER BY cpf, dataEmpenho DESC
      `);
  }

  const fnProcessaDadosEncontrados = function(result) {
    return trataResultadosCruzamentoSisobi(result);
  };

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo, fnProcessaDadosEncontrados});
}

export let getTipologiaDetalhadaFP_ENDERECOSRF = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
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

        ,ENDERECOS_SERVIDORES(CPF, NOME, S_MUNICIPIO, S_UF, S_MICRORREGIAO, UG_MICRORREGIAO, CUSTO)
        AS
        (
          SELECT
            S.CPF, PF.Nome, PF.Municipio, PF.UF, MMM.MICROREGIAO, UG.MICROREGIAO,
            CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

          FROM ${modelReceita.get('PF')} PF
              INNER JOIN SERVIDORES S ON (PF.CPF = S.CPF)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PF.MUNICIPIO AND PF.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
          WHERE CUSTO.custo > 0 OR CUSTO.custo IS NULL
        )

        SELECT CPF as cpf, NOME as nome, S_MUNICIPIO as municipio, S_UF as uf, S_MICRORREGIAO as microrregiao,
              UG_MICRORREGIAO as microrregiaoUG, CUSTO as custo, '${tipologias['fp_enderecosrf'].codigo}' as tipologia
        FROM ENDERECOS_SERVIDORES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaDetalhadaFP_ENDERECOSRE = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
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
            S.CPF, UPPER(E.Municipio), E.UF, MMM.MICROREGIAO, UG.MICROREGIAO,
            CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo

          FROM SERVIDORES S
              INNER JOIN ${modelEndereco.get('ENDERECO')} E ON (S.CPF = E.cpf_cnpj)
              LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = E.MUNICIPIO AND E.UF = 'PB')
              LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
              LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
          WHERE (CUSTO.custo > 0 OR CUSTO.custo IS NULL)
              AND NOT(E.UF = 'PB' AND MMM.MICROREGIAO IS NULL )
        )

        SELECT PF.CPF as cpf, PF.Nome as nome, S_MUNICIPIO as municipio, S_UF as uf, S_MICRORREGIAO as microrregiao,
              UG_MICRORREGIAO as microrregiaoUG, CUSTO as custo, COUNT(*) as qtd, '${tipologias['fp_enderecosre'].codigo}' as tipologia

        FROM ENDERECOS_SERVIDORES E
          INNER JOIN ${modelReceita.get('PF')} PF ON (E.CPF = PF.CPF)
        GROUP BY PF.CPF, PF.Nome, S_MUNICIPIO, S_UF, S_MICRORREGIAO, UG_MICRORREGIAO, CUSTO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaDetalhadaFP_SocioPJ = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
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

        ,SERVIDORES_SOCIOS(CPF, CNPJ, RAZAOSOCIAL, MUNICIPIO, UF, MICRORREGIAO, CUSTO, MICRORREGIAO_UG)
        AS
        (
          SELECT DISTINCT SERV.CPF, PJ.CNPJ, PJ.RazaoSocial, PJ.Municipio, PJ.UF, MMM.MICROREGIAO,
              CASE WHEN ISNULL(CUSTO.custo, -1) = -1 THEN 20 ELSE Custo.custo + 1 END as custo,
              UG.MICROREGIAO

          FROM ${modelReceita.get('SOCIO')} S
            INNER JOIN SERVIDORES SERV ON (('000' + SERV.CPF) = S.CpfCnpjSocio AND S.IdentificadorSocio = 2)
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = S.Cnpj)
            LEFT OUTER JOIN ${modelMisc.get('MUNICIPIO_MESOMICROREGIAO')} MMM ON (MMM.MUNICIPIO COLLATE Latin1_General_CI_AI = PJ.MUNICIPIO AND PJ.UF = 'PB')
            LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
            LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = MMM.MICROREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
        )

        SELECT PF.CPF as cpf, PF.Nome as nome, S.CNPJ as cnpj, S.RAZAOSOCIAL as razaoSocial, S.MUNICIPIO as municipio, S.UF as uf,
              S.MICRORREGIAO as microrregiao, S.CUSTO as custo, S.MICRORREGIAO_UG as microrregiaoUG, '${tipologias['fp_sociopj'].codigo}' as tipologia
        FROM SERVIDORES_SOCIOS S
          LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}

export let getTipologiaDetalhadaFP_ExtraVinculos = function (ugestora: string, dtInicio: string, dtFim: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['DT_INICIAL', ISql.Char(6), dtInicio],
      ['DT_FINAL', ISql.Char(6), dtFim],
      ['CDUGESTORA', ISql.Int, ugestora],
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
              INNER JOIN SERVIDORES_DO_ORGAO S ON (FP.cpf_servidor = S.CPF AND FP.ano = ANO)
          WHERE FP.cod_orgao <> @CDUGESTORA
            AND FP.ano + RIGHT('00' + TRIM(FP.mes), 2) BETWEEN @DT_INICIAL AND @DT_FINAL
        )
        ,SERVIDORES_COM_EXTRAVINCULOS(CPF, ANO, CD_UGESTORA, UGESTORA, MUNICIPIO, MICRORREGIAO)
        AS
        (
          SELECT E.CPF, E.ANO, E.CD_UGESTORA, UG.UGESTORA, UG.MUNICIPIO, UG.MICROREGIAO
          FROM EXTRA_VINCULOS E
            LEFT OUTER JOIN UG ON (E.CD_UGESTORA = UG.CD_UGESTORA)
        )

        SELECT	S.ANO as ano, S.CPF as cpf, PF.Nome as nome, S.UGESTORA as ugestora, S.MUNICIPIO as municipio, S.MICRORREGIAO as microrregiao,
                CUSTO.custo, UG.MICROREGIAO as microrregiaoUG, '${tipologias['fp_extravinculo'].codigo}' as tipologia

        FROM SERVIDORES_COM_EXTRAVINCULOS S
          INNER JOIN ${modelReceita.get('PF')} PF ON (S.CPF = PF.CPF)
          LEFT OUTER JOIN UG ON (UG.CD_UGESTORA = @CDUGESTORA)
          LEFT OUTER JOIN ${modelMisc.get('CUSTO_MICROREGIAO')} CUSTO ON (CUSTO.origem = S.MICRORREGIAO COLLATE Latin1_General_CI_AI AND CUSTO.destino = UG.MICROREGIAO COLLATE Latin1_General_CI_AI)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelSagres, {fonte, rank, grupo});
}
