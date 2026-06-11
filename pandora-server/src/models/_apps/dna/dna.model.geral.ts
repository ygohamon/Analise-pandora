import { db, ISql } from './../../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao } from './../../../utils';

const modelCNE = getModelConfig('BD_CNE');
const modelReceita = getModelConfig('BD_RECEITA');
const modelBF = getModelConfig('BD_BOLSAFAMILIA');
const modelEleitoral = getModelConfig('BD_ELEITORAL');
const modelTransparencia = getModelConfig('BD_TRANSPARENCIA');
const modelSagres = getModelConfig('BD_SAGRES');
const modelVirtual = getModelConfig('BD_VIRTUAL');
const modelSefaz = getModelConfig('BD_SEFAZ');

const fonte = MODEL_PRIORITY['tcepb.empenhos.estadual'].fonte;
const rank = MODEL_PRIORITY['tcepb.empenhos.estadual'].rank;
const grupo = MODEL_PRIORITY['tcepb.empenhos.estadual'].grupo;

export const getInformacoesSociosCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH SOCIOS(CNPJ, CPF)
        AS
        (
          SELECT CNPJ, RIGHT(CpfCnpjSocio,11)
          FROM ${modelReceita.get('SOCIO')}
          WHERE CNPJ = @CNPJ

          UNION

          SELECT PJ.NR_CGC, PF.NR_CPF
          FROM ${modelCNE.get('VINCULO')} V
            INNER JOIN ${modelCNE.get('CONDICAO')} C ON (C.CO_CONDICAO = V.CO_CONDICAO)
            INNER JOIN ${modelCNE.get('PESSOA')} P1 ON (V.SQ_PESSOA_VINCULANTE = P1.SQ_PESSOA AND V.CO_JUNTA_COMERCIAL = P1.CO_JUNTA_COMERCIAL)  --PJ
            INNER JOIN ${modelCNE.get('PESSOA_JURIDICA')} PJ ON (PJ.SQ_PESSOA = P1.SQ_PESSOA AND PJ.CO_JUNTA_COMERCIAL = P1.CO_JUNTA_COMERCIAL)
            INNER JOIN ${modelCNE.get('PESSOA')} P2 ON (V.SQ_PESSOA_VINCULADA = P2.SQ_PESSOA AND V.CO_JUNTA_COMERCIAL = P2.CO_JUNTA_COMERCIAL)  --PF
            INNER JOIN ${modelCNE.get('PESSOA_FISICA')} PF ON (PF.SQ_PESSOA = P2.SQ_PESSOA AND PF.CO_JUNTA_COMERCIAL = P2.CO_JUNTA_COMERCIAL)
          WHERE (C.NO_VINCULO LIKE 'SOCIO%' OR C.NO_VINCULO LIKE 'SÓCIO%')
            AND PJ.NR_CGC = @CNPJ
        )
        ,
        SOCIOS_COM_TITULO(CNPJ, CPF, TITULOELEITOR)
        AS
        (
          SELECT S.CNPJ, S.CPF, NULL
          FROM SOCIOS S
            -- LEFT OUTER JOIN ${modelReceita.get('PF')} PF ON (PF.CPF = S.CPF)
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNPJ as cnpj,
            CPF as cpf,
            ISNULL(CU.FLAG,0) AS cadastroUnico,
            ISNULL(ANALFABETOS.FLAG,0) AS analfabeto,
            ISNULL(FUNC_PUB_ESTADUAL.FLAG,0) AS servidorEstadual,
            ISNULL(FUNC_PUB_MUNICIPAL.FLAG,0) AS servidorMunicipal,
            ISNULL(FUNC_PUB_FEDERAL.FLAG,0) AS servidorFederal,
            ISNULL(FILIADO_PARTIDO.FLAG,0) AS filiadoPartido,
            ISNULL(DOADOR_PF.FLAG,0) AS doadorEleitoral

        FROM SOCIOS_COM_TITULO S
        OUTER APPLY(
            SELECT TOP 1 1 AS FLAG
            FROM ${modelBF.get('CAD')} B
            WHERE B.CPF = S.CPF

            UNION

            SELECT TOP 1 1
            FROM ${modelBF.get('CAD')} B
            WHERE B.TIT_ELEITOR = S.TITULOELEITOR
        ) CU
        OUTER APPLY(
            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('ANALFABETOS')} A
            WHERE A.CPF = S.CPF

            UNION

            SELECT TOP 1 1
            FROM ${modelEleitoral.get('ANALFABETOS')} A
            WHERE A.TITULO = S.TITULOELEITOR
        ) ANALFABETOS
        OUTER APPLY(

            SELECT TOP 1 1 AS FLAG
            FROM ${modelSagres.get('SE_FOLHAPAGAMENTO')} F
            WHERE F.cpf_servidor = S.CPF

        ) FUNC_PUB_ESTADUAL
        OUTER APPLY(

            SELECT TOP 1 1 AS FLAG
            FROM ${modelSagres.get('SM_FOLHAPAGAMENTO')} S2
            WHERE S2.cpf_servidor = S.CPF

        ) FUNC_PUB_MUNICIPAL
        OUTER APPLY(
            SELECT TOP 1 1 AS FLAG
            FROM ${modelTransparencia.get('SERVIDORES_NORDESTE')} SF
            WHERE SF.CPF_SERVIDOR = S.CPF
        ) FUNC_PUB_FEDERAL
        OUTER APPLY(
            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('FILIACAO')} FIL
            WHERE FIL.numinscricao = S.TITULOELEITOR
        ) AS FILIADO_PARTIDO
        OUTER APPLY(
            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('RECEITA_PARTIDO_2014')} T
            WHERE T.CPF_CNPJ_DOADOR = S.CPF

            UNION

            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('RECEITA_PARTIDO_2016')} T
            WHERE T.CPF_CNPJ_DOADOR = S.CPF

            UNION

            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('RECEITA_CANDIDATO_2014')} T
            WHERE T.CPF_CNPJ_DOADOR = S.CPF

            UNION

            SELECT TOP 1 1 AS FLAG
            FROM ${modelEleitoral.get('RECEITA_CANDIDATO_2016')} T
            WHERE T.CPF_CNPJ_DOADOR = S.CPF
        ) DOADOR_PF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'infosocios' });
};

export const getDoacaoEleitoralCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH DOACOES(VALORES)
        AS
        (
            SELECT VALOR_RECEITA
            FROM ${modelEleitoral.get('RECEITA_PARTIDO_2014')}
            WHERE CPF_CNPJ_DOADOR = @CNPJ

            UNION ALL

            SELECT VALOR_RECEITA
            FROM ${modelEleitoral.get('RECEITA_PARTIDO_2016')}
            WHERE CPF_CNPJ_DOADOR = @CNPJ

            UNION ALL

            SELECT VALOR_RECEITA
            FROM ${modelEleitoral.get('RECEITA_CANDIDATO_2014')}
            WHERE CPF_CNPJ_DOADOR = @CNPJ

            UNION ALL

            SELECT VALOR_RECEITA
            FROM ${modelEleitoral.get('RECEITA_CANDIDATO_2016')}
            WHERE CPF_CNPJ_DOADOR = @CNPJ
        )

        SELECT SUM(VALORES) as doacao
        FROM DOACOES
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelEleitoral, { fonte, rank, grupo: 'doacaoeleitoral' });
};

export const getContadoresCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH CONTADORES(CNPJ, CPF)
        AS
        (
          SELECT NUM_CNPJ_EMPRESA, NUM_CPF AS CPF
          FROM ${modelReceita.get('CONTADOR')} C
          WHERE NUM_CNPJ_EMPRESA = @CNPJ
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            C.CNPJ as cnpj,
            C.CPF as cpf,
            PF.NOME AS nome

        FROM CONTADORES C
            INNER JOIN ${modelReceita.get('PF')} PF ON (C.CPF = PF.CPF)
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'contadores' });
};

export const getEmpresasContadoresCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH CONTADORES(CNPJ, CPF)
        AS
        (
          SELECT NUM_CNPJ_EMPRESA, NUM_CPF AS CPF
          FROM ${modelReceita.get('CONTADOR')} C
          WHERE NUM_CNPJ_EMPRESA = @CNPJ
        )
        ,OUTRAS_EMPRESAS(CNPJ, CPF)
        AS
        (
          SELECT CON.NUM_CNPJ_EMPRESA, C.CPF
          FROM ${modelReceita.get('CONTADOR')} CON
              INNER JOIN CONTADORES C ON (CON.NUM_CPF = C.CPF)
        )
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            C.CNPJ as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            PJ.Municipio as municipio,
            PJ.Uf as uf

        FROM OUTRAS_EMPRESAS C
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (C.CNPJ = PJ.CNPJ)
        ORDER BY C.CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'empresascontadores' });
};

export const getEmpresasReceberamDoEstado = function (cnpj:string){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
      SELECT [CNPJEmitente]
            ,[NomeEmitente]
            ,[endMunicipioEmitente]
            ,[endUFEmitente]
            ,[CNPJDestinatario]
            ,[NomeDestinatario]
            ,[endMunicipioDestinatario]
            ,[endUFDestinatario]
            ,[AnoEmissao]
            ,[ValorTotalNF]
      FROM ${modelSefaz.get('PJRECEBEUESTADO')}
      where CNPJEmitente = @CNPJ
      `)
    }

    return mf.call(null, query, nomeFuncao, arguments, modelSefaz, { fonte, rank, grupo: 'empresasReceberamOrgaoPublico' });
}

export const getEmpresasContadoresReceberamEstadoCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH CONTADORES(CNPJ, CPF)
        AS
        (
          SELECT
            NUM_CNPJ_EMPRESA, NUM_CPF AS CPF
          FROM
            ${modelReceita.get('CONTADOR')} C
          WHERE NUM_CNPJ_EMPRESA = @CNPJ
        )
        ,OUTRAS_EMPRESAS_CONTADOR(CNPJ, CPF)
        AS
        (
          SELECT
            CON.NUM_CNPJ_EMPRESA, C.CPF
          FROM
            ${modelReceita.get('CONTADOR')} CON
          INNER JOIN CONTADORES C ON (CON.NUM_CPF = C.CPF)
          WHERE CON.NUM_CNPJ_EMPRESA <> @CNPJ
        )
        ,OUTRAS_EMPRESAS_CONTADOR_RECEBERAM(CNPJ)
        AS
        (
          SELECT
            EC.CNPJ
          FROM
            OUTRAS_EMPRESAS_CONTADOR EC
          WHERE EXISTS(
            SELECT
              1
            FROM
              ${modelSagres.get('SM_EMPENHOS_PAGOS')} E
            WHERE (EC.CNPJ = E.cpf_cnpj_credor)
        )
          UNION
          SELECT
            EC.CNPJ
          FROM
            OUTRAS_EMPRESAS_CONTADOR EC
          WHERE EXISTS(
            SELECT
              1
            FROM
              ${modelSagres.get('SE_EMPENHOS_PAGOS')} E
            WHERE (EC.CNPJ = E.cpf_cnpj_credor)
          )
        )
        SELECT TOP 1000
            E.CNPJ as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            PJ.Municipio as municipio,
            PJ.Uf as uf
        FROM OUTRAS_EMPRESAS_CONTADOR_RECEBERAM E
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.CNPJ = PJ.CNPJ)
        ORDER BY E.CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'empresascontadoresreceberam' });
};

export const getEmpresasContadoresParticiparamCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH CONTADORES(CNPJ, CPF)
        AS
        (
          SELECT NUM_CNPJ_EMPRESA, NUM_CPF AS CPF
          FROM ${modelReceita.get('CONTADOR')} C
          WHERE NUM_CNPJ_EMPRESA = @CNPJ

        )
        ,OUTRAS_EMPRESAS_CONTADOR(CNPJ, CPF)
        AS
        (
          SELECT CON.NUM_CNPJ_EMPRESA, C.CPF
          FROM ${modelReceita.get('CONTADOR')} CON
              INNER JOIN CONTADORES C ON (CON.NUM_CPF = C.CPF)
        )
        ,LICITACOES_PARTICIPADAS(CD_UGESTORA, ANO, NU_LICITACAO, TP_LICITACAO)
        AS
        (
          SELECT cod_unidade_gestora, ano, numero_licitacao, cod_modalidade_licitacao
          FROM ${modelSagres.get('SM_LICITACOES')}
          WHERE cpf_cnpj_licitante=@CNPJ
        )
        ,EMPRESAS_PARTICIPARAM_JUNTO(CNPJ)
        AS
        (
          SELECT P.cpf_cnpj_licitante
          FROM ${modelSagres.get('SM_LICITACOES')} P
              INNER JOIN LICITACOES_PARTICIPADAS L ON (P.cod_unidade_gestora = L.CD_UGESTORA AND P.numero_licitacao = L.NU_LICITACAO AND P.cod_modalidade_licitacao = L.TP_LICITACAO AND P.ano = L.ANO)
          WHERE P.cpf_cnpj_licitante <> '00000000000000' AND P.cpf_cnpj_licitante <> @CNPJ
        )
        ,OUTRAS_EMPRESAS_CONTADOR_PARTICIPARAM_COMIGO(CNPJ)
        AS
        (
            SELECT DISTINCT E.CNPJ
            FROM OUTRAS_EMPRESAS_CONTADOR E
                INNER JOIN EMPRESAS_PARTICIPARAM_JUNTO EPJ ON (E.CNPJ = EPJ.CNPJ)
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            E.CNPJ as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            PJ.Municipio as municipio,
            PJ.Uf as uf

        FROM OUTRAS_EMPRESAS_CONTADOR_PARTICIPARAM_COMIGO E
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.CNPJ = PJ.CNPJ)
        ORDER BY E.CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'empresascontadoresparticiparam' });
};

export const getEmpresasMesmoEmailCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH EMAIL(CNPJ, EMAIL)
        AS
        (
          SELECT NUM_CNPJ, LOWER(TRIM(DESCR_EMAIL))
          FROM ${modelReceita.get('SOCIO_HISTORICO')}
          WHERE NUM_CNPJ=@CNPJ
            AND (DESCR_EMAIL IS NOT NULL AND DESCR_EMAIL <> '')

          UNION

          SELECT cnpj ,LOWER(TRIM(CorreioEletronico))
          FROM ${modelReceita.get('PJ')}
          WHERE cnpj=@CNPJ AND
            (CorreioEletronico IS NOT NULL AND CorreioEletronico <> '' )

          UNION

          SELECT DISTINCT CPF_CNPJ, LOWER(TRIM(EMAIL)) COLLATE Latin1_General_CI_AS
          FROM ${modelVirtual.get('EMAIL')}
          WHERE CPF_CNPJ=@CNPJ
        )
        , EMPRESAS_COM_MESMO_EMAIL(CNPJ, EMAIL)
        AS
        (
          SELECT NUM_CNPJ, LOWER(TRIM(DESCR_EMAIL))
          FROM ${modelReceita.get('SOCIO_HISTORICO')} PJ
            INNER JOIN EMAIL E ON (PJ.DESCR_EMAIL = E.EMAIL)
          WHERE PJ.NUM_CNPJ <> @CNPJ

          UNION

          SELECT PJ.cnpj, LOWER(TRIM(CorreioEletronico))
          FROM ${modelReceita.get('PJ')} PJ
            INNER JOIN EMAIL E ON (PJ.CorreioEletronico = E.EMAIL)
          WHERE PJ.CNPJ <> @CNPJ

          UNION

          SELECT PJ.CPF_CNPJ, LOWER(TRIM(PJ.EMAIL)) COLLATE Latin1_General_CI_AS
          FROM ${modelVirtual.get('EMAIL')} PJ
          WHERE EXISTS(
            SELECT
              1
            FROM EMAIL E
            WHERE
              (PJ.EMAIL = E.EMAIL)
              AND CPF_CNPJ <> @CNPJ
              AND LEN(CPF_CNPJ) = 14
          )
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            E.CNPJ as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            PJ.Municipio as municipio,
            PJ.Uf as uf,
            E.EMAIL as email

        FROM EMPRESAS_COM_MESMO_EMAIL E
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.CNPJ = PJ.CNPJ)
        ORDER BY E.CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'empresasmesmoemail' });
};

export const getEmpresasMesmoTelefoneCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH TELEFONE(CNPJ, TELEFONE)
        AS
        (
          SELECT CNPJ, DddTelefone1
          FROM ${modelReceita.get('PJ')}
          WHERE CNPJ = @CNPJ AND DddTelefone1 <> ''

          UNION

          SELECT CNPJ, DddTelefone2
          FROM ${modelReceita.get('PJ')}
          WHERE CNPJ = @CNPJ AND DddTelefone2 <> ''
        )
        , EMPRESAS_COM_MESMO_TELEFONE(CNPJ, TELEFONE)
        AS
        (
          SELECT PJ.CNPJ, PJ.DddTelefone1
          FROM ${modelReceita.get('PJ')} PJ
            INNER JOIN TELEFONE T ON (PJ.DddTelefone1 = T.TELEFONE)
          WHERE PJ.CNPJ <> @CNPJ

          UNION

          SELECT PJ.CNPJ, PJ.DddTelefone2
          FROM ${modelReceita.get('PJ')} PJ
            INNER JOIN TELEFONE T ON (PJ.DddTelefone2 = T.TELEFONE)
          WHERE PJ.CNPJ <> @CNPJ
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            E.CNPJ as cnpj,
            PJ.RazaoSocial as razaoSocial,
            PJ.NomeFantasia as nomeFantasia,
            PJ.Municipio as municipio,
            PJ.Uf as uf,
            E.TELEFONE as telefone

        FROM EMPRESAS_COM_MESMO_TELEFONE E
            INNER JOIN ${modelReceita.get('PJ')} PJ ON (E.CNPJ = PJ.CNPJ)
        ORDER BY E.CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'empresasmesmotelefone' });
};

export const getAtividadeEconomicaCNPJ = function(cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH ATIVIDADE(CNAE, DESCRICAO, FONTE)
        AS
        (
          SELECT ATUACAO.CO_ATIVIDADE, UPPER(A.DS_ATIVIDADE), 'CNE'
          FROM ${modelCNE.get('ATUACAO')}
              INNER JOIN ${modelCNE.get('PESSOA_JURIDICA')} PJ ON (ATUACAO.CO_JUNTA_COMERCIAL = PJ.CO_JUNTA_COMERCIAL AND ATUACAO.SQ_PESSOA = PJ.SQ_PESSOA AND ATUACAO.CO_SEQUENCIAL = PJ.CO_SEQUENCIAL AND ATUACAO.NO_ESQUEMA_ORIGEM = PJ.NO_ESQUEMA_ORIGEM)
              INNER JOIN ${modelCNE.get('ATIVIDADE_ECONOMICA')} A ON (ATUACAO.CO_ATIVIDADE = A.CO_ATIVIDADE)
          WHERE PJ.NR_CGC= @CNPJ

          UNION

          SELECT PJ.CnaeFiscal COLLATE Latin1_General_CI_AS, UPPER(A.DsCNAE) COLLATE Latin1_General_CI_AS, 'RF'
          FROM ${modelReceita.get('PJ')} PJ
              INNER JOIN ${modelReceita.get('CNAE')} A ON (PJ.CnaeFiscal = A.CdCNAE)
          WHERE PJ.CNPJ = @CNPJ
        )

        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            CNAE as cnae,
            DESCRICAO as descricao,
            FONTE as fonte

        FROM ATIVIDADE
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelReceita, { fonte, rank, grupo: 'atividadeeconomica' });
};
