
import { db, ISql } from './../../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../../utils';

const modelCorona = getModelConfig('BD_CORONA');
const modelTipologia = getModelConfig('BD_TIPOLOGIAS');
const modelSisobi = getModelConfig('BD_SISOBI');
const modelReceita = getModelConfig('BD_RECEITA');
const modelEmbarcacao = getModelConfig('BD_EMBARCACOES');
const modelRab = getModelConfig('BD_RAB');
const modelDetran = getModelConfig('BD_DETRAN');

const fonte = 'painelcovid';
const rank = 0;
// const grupo = MODEL_PRIORITY['tcepb.empenhos.estadual'].grupo;

export const getTabelaGeralPainelCovid = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          uf, municipio, cpf, nome, total, qtd, falecido, servidor, residente_exterior as exterior,
          empresas_responsavel, empresas_socio, aeronave, embarcacao, veiculo, doador, candidato,
          tipologia_tcu, somatorio
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND SOMATORIO > 0
        ORDER BY SOMATORIO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'tabelageral' });
};

export const getValoresMunicipio = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        ;WITH BENEFICIARIOS(MES, UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, VALOR)
        AS
        (
            SELECT '04' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_ABRIL')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

            UNION ALL

            SELECT '05' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_MAIO')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL
        )

        SELECT uf, municipio, cd_ibge as cdIbge, SUM(VALOR) as total, COUNT(*) as qtd
        FROM BENEFICIARIOS
        GROUP BY UF, MUNICIPIO, CD_IBGE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'valoresmunicipio' });
};

export const getTipologiaFalecidoDetalhado = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        DROP TABLE IF EXISTS #TEMPORARIA
        SELECT A.CPF_BENEFICIARIO_COMPLETO, '202004' AS MES_DISPONIBILIZACAO, CAST('20200401' AS DATE) AS DATA, NOME_BENEFICIARIO, UF as uf, NOME_MUNICIPIO as municipio,
          NIS_BENEFICIARIO as nis, NIS_RESPONSAVEL as nisResponsavel,
          CPF_RESPONSAVEL_COMPLETO as cpfResponsavel, NOME_RESPONSAVEL as nomeResponsavel, ENQUADRAMENTO as enquadramento, REPLACE(VALOR_BENEFICIO,',','.') as valor
              INTO #TEMPORARIA
              FROM ${modelCorona.get('AUXILIO_ABRIL')}  A
              WHERE OBSERVACAO = 'Não há'
                  AND A.UF = @UF

              UNION ALL

              SELECT A.CPF_BENEFICIARIO_COMPLETO, '202005' AS MES_DISPONIBILIZACAO, CAST('20200501' AS DATE) AS DATA, NOME_BENEFICIARIO, UF as uf, NOME_MUNICIPIO as municipio,
          NIS_BENEFICIARIO as nis, NIS_RESPONSAVEL as nisResponsavel,
          CPF_RESPONSAVEL_COMPLETO as cpfResponsavel, NOME_RESPONSAVEL as nomeResponsavel, ENQUADRAMENTO as enquadramento, REPLACE(VALOR_BENEFICIO,',','.') as valor
              FROM ${modelCorona.get('AUXILIO_MAIO')}  A
              WHERE OBSERVACAO = 'Não há'
                  AND A.UF = @UF

        SELECT O.DT_OBITO, O.FALECIDO, T.*
        FROM #TEMPORARIA T
        INNER JOIN ${modelSisobi.get('OBITO')} O ON (T.CPF_BENEFICIARIO_COMPLETO = O.CPF)
                WHERE DIFFERENCE(T.NOME_BENEFICIARIO, FALECIDO) = 4
                    AND DATEDIFF(D, O.DT_OBITO, T.DATA) > 60
      `);
  // const query = () => {
  //   return db.query([
  //     ['UF', ISql.Char(2), uf],
  //     ],`
  //       DROP TABLE IF EXISTS #TEMP
  //       SELECT O.DT_OBITO, O.FALECIDO, A.CPF_BENEFICIARIO_COMPLETO, '202004' AS MES_DISPONIBILIZACAO
  //       INTO #TEMP
  //       FROM ${modelCorona.get('AUXILIO_ABRIL')}  A
  //         INNER JOIN ${modelSisobi.get('OBITO')} O ON (A.CPF_BENEFICIARIO_COMPLETO = O.CPF)
  //       WHERE DIFFERENCE(NOME_BENEFICIARIO, FALECIDO) = 4
  //           AND DATEDIFF(D, O.DT_OBITO, CAST('20200401' AS DATE)) > 60
  //           AND OBSERVACAO = 'Não há'
  //           AND A.UF = @UF

  //       UNION ALL

  //       SELECT O.DT_OBITO, O.FALECIDO, A.CPF_BENEFICIARIO_COMPLETO, '202005' AS MES_DISPONIBILIZACAO
  //       FROM ${modelCorona.get('AUXILIO_MAIO')}  A
  //         INNER JOIN ${modelSisobi.get('OBITO')} O ON (A.CPF_BENEFICIARIO_COMPLETO = O.CPF)
  //       WHERE DIFFERENCE(NOME_BENEFICIARIO, FALECIDO) = 4
  //           AND DATEDIFF(D, O.DT_OBITO, CAST('20200501' AS DATE)) > 60
  //           AND OBSERVACAO = 'Não há'
  //           AND A.UF = @UF

  //       SELECT T.MES_DISPONIBILIZACAO as mesAno, T.DT_OBITO as dtObito, A.UF as uf, NOME_MUNICIPIO as municipio,
  //           NIS_BENEFICIARIO as nis, T.CPF_BENEFICIARIO_COMPLETO as cpf, NOME_BENEFICIARIO as nome, NIS_RESPONSAVEL as nisResponsavel,
  //           CPF_RESPONSAVEL_COMPLETO as cpfResponsavel, NOME_RESPONSAVEL as nomeResponsavel, ENQUADRAMENTO as enquadramento, CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT) as valor
  //       FROM ${modelCorona.get('AUXILIO_ABRIL')}  A
  //         INNER JOIN #TEMP T ON (T.CPF_BENEFICIARIO_COMPLETO = A.CPF_BENEFICIARIO_COMPLETO AND A.MES_DISPONIBILIZACAO = T.MES_DISPONIBILIZACAO)

  //       UNION ALL

  //       SELECT T.MES_DISPONIBILIZACAO, T.DT_OBITO, A.UF, NOME_MUNICIPIO, NIS_BENEFICIARIO, T.CPF_BENEFICIARIO_COMPLETO, NOME_BENEFICIARIO, NIS_RESPONSAVEL, CPF_RESPONSAVEL_COMPLETO, NOME_RESPONSAVEL, ENQUADRAMENTO, TRY_PARSE(VALOR_BENEFICIO AS FLOAT USING 'pt-br')
  //       FROM ${modelCorona.get('AUXILIO_MAIO')}  A
  //         INNER JOIN #TEMP T ON (T.CPF_BENEFICIARIO_COMPLETO = A.CPF_BENEFICIARIO_COMPLETO AND A.MES_DISPONIBILIZACAO = T.MES_DISPONIBILIZACAO)
  //     `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'tipologia_falecido' });
};

export const getTipologiaResidenteExteriorDetalhado = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        DROP TABLE IF EXISTS #TEMP
        SELECT '202004' AS MES_DISPONIBILIZACAO, TRIM(PF.NomePaisExterior) AS PAIS, PF.CPF, TRIM(PF.Nome) AS NOME
        INTO #TEMP
        FROM ${modelCorona.get('AUXILIO_ABRIL')}  A
          INNER JOIN ${modelReceita.get('PF')} PF ON (A.CPF_BENEFICIARIO_COMPLETO = PF.CPF)
        WHERE PF.UF = 'EX' AND A.UF = @UF AND OBSERVACAO = 'Não há'

        UNION ALL

        SELECT '202005' AS MES_DISPONIBILIZACAO, TRIM(PF.NomePaisExterior) AS PAIS, PF.CPF, TRIM(PF.Nome) AS NOME
        FROM ${modelCorona.get('AUXILIO_MAIO')}  A
          INNER JOIN ${modelReceita.get('PF')} PF ON (A.CPF_BENEFICIARIO_COMPLETO = PF.CPF)
        WHERE PF.UF = 'EX' AND A.UF = @UF AND OBSERVACAO = 'Não há'

        SELECT T.MES_DISPONIBILIZACAO as mesAno, pais, cpf, nome, A.parcela, A.enquadramento, CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT) as valor
        FROM ${modelCorona.get('AUXILIO_ABRIL')}  A
          INNER JOIN #TEMP T ON (T.CPF = A.CPF_BENEFICIARIO_COMPLETO AND A.MES_DISPONIBILIZACAO = T.MES_DISPONIBILIZACAO)

        UNION ALL

        SELECT T.MES_DISPONIBILIZACAO as mesAno, pais, cpf, nome, A.parcela, A.enquadramento, CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT) as valor
        FROM ${modelCorona.get('AUXILIO_MAIO')}  A
          INNER JOIN #TEMP T ON (T.CPF = A.CPF_BENEFICIARIO_COMPLETO AND A.MES_DISPONIBILIZACAO = T.MES_DISPONIBILIZACAO)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'tipologia_exterior' });
};

export const getTipologiaProprietarioEmbarcacaoDetalhado = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        ;WITH BENEFICIARIOS(MES, UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, VALOR)
        AS
        (
            SELECT '04' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_ABRIL')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

            UNION ALL

            SELECT '05' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_MAIO')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

        ),BENEFICIARIOS_AGREGADO(UF, MUNICIPIO, CD_IBGE, CPF, NOME, ULTIMO_PAGAMENTO, TOTAL, QTD)
        AS
        (
            SELECT UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, MAX(MES), SUM(VALOR), COUNT(*)
            FROM BENEFICIARIOS
            GROUP BY UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO
        )

        SELECT uf, municipio, cpf, nome, total, qtd, COUNT(*) AS nEmbarcacoes, STRING_AGG(UPPER(TIPO_EMBARCACAO), '; ') AS tipos
        FROM BENEFICIARIOS_AGREGADO B
            INNER JOIN ${modelEmbarcacao.get('EMBARCACOES')} E ON (B.CPF = E.CPF_CNPJ)
        WHERE E.TIPO_EMBARCACAO NOT IN ('Bote', 'Jangada', 'Canoa', 'Caiaque', 'Pesqueiro')
        GROUP BY uf, municipio, cpf, nome, total, qtd
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'tipologia_embarcacao' });
};

export const getTipologiaProprietarioAeronaveDetalhado = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        ;WITH BENEFICIARIOS(MES, UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, VALOR)
        AS
        (
            SELECT '04' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_ABRIL')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

            UNION ALL

            SELECT '05' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_MAIO')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

        ),BENEFICIARIOS_AGREGADO(UF, MUNICIPIO, CD_IBGE, CPF, NOME, ULTIMO_PAGAMENTO, TOTAL, QTD)
        AS
        (
            SELECT UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, MAX(MES), SUM(VALOR), COUNT(*)
            FROM BENEFICIARIOS
            GROUP BY UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO
        )

        SELECT B.uf, municipio, cpf, nome, total, qtd, COUNT(*) AS nAeronaves, STRING_AGG(UPPER(R.NOME_FABRICANTE + ' - ' + R.MODELO), '; ') AS modelos
        FROM BENEFICIARIOS_AGREGADO B
            INNER JOIN ${modelRab.get('RAB')} R ON (B.CPF = R.CPF_CNPJ)
        GROUP BY B.UF, B.MUNICIPIO, B.CD_IBGE, B.CPF, B.NOME, B.ULTIMO_PAGAMENTO, B.TOTAL, B.QTD
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'tipologia_aeronave' });
};

export const getTipologiaProprietarioVeiculoDetalhado = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        ;WITH BENEFICIARIOS(MES, UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, VALOR)
        AS
        (
            SELECT '04' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_ABRIL')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

            UNION ALL

            SELECT '05' as MES, UF, NOME_MUNICIPIO, CODIGO_MUNICIPIO_IBGE, CPF_BENEFICIARIO_COMPLETO, TRIM(NOME_BENEFICIARIO), CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)
            FROM ${modelCorona.get('AUXILIO_MAIO')}
            WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL

        ),BENEFICIARIOS_AGREGADO(UF, MUNICIPIO, CD_IBGE, CPF, NOME, ULTIMO_PAGAMENTO, TOTAL, QTD)
        AS
        (
            SELECT UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO, MAX(MES), SUM(VALOR), COUNT(*)
            FROM BENEFICIARIOS
            GROUP BY UF, MUNICIPIO, CD_IBGE, CPF, NOME_BENEFICIARIO
        )

        SELECT TOP 1000 B.uf, B.municipio, cpf, nome, total, qtd, COUNT(*) AS nVeiculos
        FROM BENEFICIARIOS_AGREGADO B
            INNER JOIN ${modelDetran.get('VEICULO')} V ON (B.CPF = V.CPF_CNPJ)
        GROUP BY uf, B.municipio, cpf, nome, total, qtd
        ORDER BY nVeiculos DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'tipologia_veiculo' });
};

export const getAgregadoFalecidosUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND FALECIDO = 1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_falecido' });
};

export const getAgregadoResidenteExteriorUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND RESIDENTE_EXTERIOR = 1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_exterior' });
};

export const getAgregadoProprietarioEmbarcacaoUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND EMBARCACAO > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_embarcacao' });
};

export const getAgregadoProprietarioAeronaveUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND AERONAVE > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_aeronave' });
};

export const getAgregadoServidorUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND SERVIDOR = 1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_servidor' });
};

export const getAgregadoSociosUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(TOTAL) as total, COUNT(*) as qtd
        FROM ${modelTipologia.get('PAINEL_COVID')}
        WHERE UF = @UF AND EMPRESAS_SOCIO > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelTipologia, { fonte, rank, grupo: 'agregado_socios' });
};

export const getAgregadoTotalAbrilUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)) as total, count(*) as qtd
        FROM ${modelCorona.get('AUXILIO_ABRIL')}
        WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'agregado_abril' });
};

export const getAgregadoTotalMaioUF = function(uf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['UF', ISql.Char(2), uf],
      ],`
        SELECT SUM(CAST(REPLACE(VALOR_BENEFICIO,',','.') AS FLOAT)) as total, count(*) as qtd
        FROM ${modelCorona.get('AUXILIO_MAIO')}
        WHERE UF = @UF AND OBSERVACAO = 'Não há' AND CPF_BENEFICIARIO_COMPLETO IS NOT NULL
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelCorona, { fonte, rank, grupo: 'agregado_maio' });
};
