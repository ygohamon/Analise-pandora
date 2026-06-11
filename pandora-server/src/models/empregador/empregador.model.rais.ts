
import { db, ISql } from './../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RAIS');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['empregador.rais'].fonte;
const rank  = MODEL_PRIORITY['empregador.rais'].rank;
const grupo = MODEL_PRIORITY['empregador.rais'].grupo;

const salarioAnual = `
    CAST(REPLACE(VA_REMUNERACAO_JAN_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_FEV_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_MAR_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_ABR_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_MAI_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_JUN_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_JUL_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_AGO_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_SET_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_OUT_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_NOV_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_REMUNERACAO_DEZ_RAIS, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_13SA, ',', '.') AS FLOAT)
    + CAST(REPLACE(VA_13SF, ',', '.') AS FLOAT)
    as salarioAnual
`;

const mesesTrabalhados = `
  CASE WHEN CAST(REPLACE(VA_REMUNERACAO_JAN_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_FEV_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_MAR_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_ABR_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_MAI_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_JUN_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_JUL_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_AGO_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_SET_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_OUT_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_NOV_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
  + CASE WHEN CAST(REPLACE(VA_REMUNERACAO_DEZ_RAIS, ',', '.') AS FLOAT) <> 0 THEN 1 ELSE 0 END
as mesesTrabalhados
`;


export let getEmpregadoresDetalhadoCPF_RAIS = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_RAIS as ano
            ,CO_CPF as cpf
            ,NO_PARTIC_RAIS as nome
            ,CO_CNPJ_CEI as cnpj
            ,PJ.RazaoSocial as razaoSocial
            ,PJ.NomeFantasia as nomeFantasia
            ,PJ.Uf as uf
            ,PJ.Municipio as municipio
            ,CO_PIS as pis
            ,CO_CTPS_NUMERO as ctpsNumero
            ,CO_CTPS_SERIE as ctpsSerie
            ,ocupacao.cargo as cargo
            ,Sinonimo.cargo as sinonimos
            ,DA_ADMISSAO_RAIS_DMA as dtAdmissao
            ,TP_ADM.DS_TIPO_ADMISSAO as tipoAdmissao
            ,TP_V.DS_TIPO_VINCULO  as tipoVinculo
            ,DA_DESLIGAMENTO_RAIS_DM as dtDesligamento
            ,CD.DS_CAUSA_DESLIG as causaDesligamento
            ,QT_HORA_SEMANA_RAIS as cargaHoraria
            ,TP_SAL.DS_TIPO_SALARIO as tipoSalario
            ,VA_SALARIO_CONT_RAIS as salarioContratado
            ,${salarioAnual}
            ,${mesesTrabalhados}
            ,'${modelConfig?.sigla}' as fonte

          FROM ${modelConfig.get('RAIS')} R
              LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = R.CO_CNPJ_CEI)
              LEFT OUTER JOIN ${modelConfig.get('VINCULO')} TP_V ON (R.CO_TIPO_VINCULO_RAIS = TP_V.CD_TIPO_VINCULO)
              LEFT OUTER JOIN ${modelConfig.get('DESLIGAMENTO')} CD ON (R.CO_CAUSA_DESLIGAMENTO_RAIS = CD.CD_CAUSA_DESG)
              LEFT OUTER JOIN ${modelConfig.get('ADMISSAO')} TP_ADM ON (R.IN_TIPO_ADMISSAO_RAIS = TP_ADM.CD_TIPO_ADMISSAO)
              LEFT OUTER JOIN ${modelConfig.get('SALARIO')} TP_SAL ON (R.CO_TIPO_SALARIO_RAIS = TP_SAL.CD_TIPO_SALARIO)
              OUTER APPLY(
                  SELECT DS_OCUPACAO as cargo
                  FROM ${modelConfig.get('CBO')} CBO
                  WHERE (R.CO_CBO_RAIS = CBO.CD_OCUPACAO)
                  AND TIPO = 'Ocupação'
              ) as ocupacao
              OUTER APPLY(
                  SELECT string_agg(DS_OCUPACAO,';') as cargo
                  FROM ${modelConfig.get('CBO')} CBO
                  WHERE (R.CO_CBO_RAIS = CBO.CD_OCUPACAO)
                  AND TIPO = 'Sinônimo'
                  group by TIPO
              ) as Sinonimo

          WHERE CO_CPF = @CPF
          ORDER BY ano
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEstatisticasEmpregadoresCNPJ_RAIS = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cnpj', ISql.Char(14), cnpj],
      ],`
        ;WITH SALARIOS_ANUALIZADOS(ANO, CNPJ, CPF, SALARIO_ANUAL, DECIMO_TERCEIRO, MESES_TRABALHADOS, CNAE,
          NATUREZA_JURIDICA, QT_VINCULO_ESTAB_ANT, QT_VINCULO_ESTAB)
        AS
        (
          SELECT
              ANO_RAIS,
              CO_CNPJ_CEI,
              CO_CPF
              ,${salarioAnual}
              ,0 as decimoTerceiro
              ,${mesesTrabalhados}
              ,CNAE.DS_CNAE
              ,NJ.DS_NAT_JURIDICA
              ,QT_VINCULO_ESTAB_ANT
              ,QT_VINCULO_ESTAB

          FROM ${modelConfig.get('RAIS')} R
            LEFT OUTER JOIN ${modelConfig.get('CNAE')} CNAE ON (R.CO_CNAE20_RAIS = CNAE.SUBCLASSE)
            LEFT OUTER JOIN ${modelConfig.get('NATUREZA')} NJ ON (R.CO_NATUREZA_JURIDICA_RAIS = NJ.CD_NAT_JURIDICA)
          WHERE CO_CNPJ_CEI = @cnpj
        )
        ,SALARIOS_ANUALIZADOS_COM_MEDIOS(ANO, CNPJ, CPF, SALARIO_ANUAL, DECIMO_TERCEIRO, MESES_TRABALHADOS,
            CNAE, NATUREZA_JURIDICA, QT_VINCULO_ESTAB_ANT, QT_VINCULO_ESTAB, MEDIA_SALARIAL)
        AS
        (
          SELECT ANO, CNPJ, CPF, SALARIO_ANUAL, DECIMO_TERCEIRO, MESES_TRABALHADOS, CNAE, NATUREZA_JURIDICA
              ,QT_VINCULO_ESTAB_ANT, QT_VINCULO_ESTAB
              ,CASE WHEN MESES_TRABALHADOS=0 THEN 0 ELSE SALARIO_ANUAL/MESES_TRABALHADOS END as MEDIA_SALARIAL

          FROM SALARIOS_ANUALIZADOS
        )
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ano,
            MIN(CNPJ) as cnpj,
            MIN(CNAE) as cnae,
            MIN(NATUREZA_JURIDICA) as naturezaJuridica,
            MAX(QT_VINCULO_ESTAB_ANT) as qtdVinculosAnterior,
            MIN(QT_VINCULO_ESTAB) as qtdVinculos,

            SUM(SALARIO_ANUAL + DECIMO_TERCEIRO) as folhaAnual,
            AVG(MESES_TRABALHADOS) as mediaMesesTrabalhados,
            AVG(MEDIA_SALARIAL) as mediaSalarial,
            MIN(NULLIF(MEDIA_SALARIAL, 0)) as menorMediaSalarial,
            MAX(MEDIA_SALARIAL) as maiorMediaSalarial,
            '${modelConfig?.sigla}' as fonte

        FROM SALARIOS_ANUALIZADOS_COM_MEDIOS
        GROUP BY ANO
        ORDER BY ANO
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEmpregadoresDetalhadoCPFSadep_RAIS = function (cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ANO_RAIS as ano
            ,CO_CPF as cpf
            ,NO_PARTIC_RAIS as nome
            ,CO_CNPJ_CEI as cnpj
            ,PJ.RazaoSocial as razaoSocial
            ,PJ.NomeFantasia as nomeFantasia
            ,PJ.DescricaoTipoLogradouro as tipoLogradouro
            ,PJ.Logradouro as logradouro
            ,PJ.Numero as numero
            ,PJ.Complemento as complemento
            ,PJ.Bairro as bairro
            ,PJ.Uf as uf
            ,PJ.Municipio as municipio
            ,CO_PIS as pis
            ,CO_CTPS_NUMERO as ctpsNumero
            ,CO_CTPS_SERIE as ctpsSerie
            ,ocupacao.cargo as cargo
            ,Sinonimo.cargo as sinonimos
            ,DA_ADMISSAO_RAIS_DMA as dtAdmissao
            ,TP_ADM.DS_TIPO_ADMISSAO as tipoAdmissao
            ,TP_V.DS_TIPO_VINCULO  as tipoVinculo
            ,DA_DESLIGAMENTO_RAIS_DM as dtDesligamento
            ,CD.DS_CAUSA_DESLIG as causaDesligamento
            ,QT_HORA_SEMANA_RAIS as cargaHoraria
            ,TP_SAL.DS_TIPO_SALARIO as tipoSalario
            ,VA_SALARIO_CONT_RAIS as salarioContratado
            ,${salarioAnual}
            ,${mesesTrabalhados}
            ,'${modelConfig?.sigla}' as fonte
          FROM ${modelConfig.get('RAIS')} R
              LEFT OUTER JOIN ${modelReceita.get('PJ')} PJ ON (PJ.CNPJ = R.CO_CNPJ_CEI)
              LEFT OUTER JOIN ${modelConfig.get('VINCULO')} TP_V ON (R.CO_TIPO_VINCULO_RAIS = TP_V.CD_TIPO_VINCULO)
              LEFT OUTER JOIN ${modelConfig.get('DESLIGAMENTO')} CD ON (R.CO_CAUSA_DESLIGAMENTO_RAIS = CD.CD_CAUSA_DESG)
              LEFT OUTER JOIN ${modelConfig.get('ADMISSAO')} TP_ADM ON (R.IN_TIPO_ADMISSAO_RAIS = TP_ADM.CD_TIPO_ADMISSAO)
              LEFT OUTER JOIN ${modelConfig.get('SALARIO')} TP_SAL ON (R.CO_TIPO_SALARIO_RAIS = TP_SAL.CD_TIPO_SALARIO)
              OUTER APPLY(
                  SELECT DS_OCUPACAO as cargo
                  FROM ${modelConfig.get('CBO')} CBO
                  WHERE (R.CO_CBO_RAIS = CBO.CD_OCUPACAO)
                  AND TIPO = 'Ocupação'
              ) as ocupacao
              OUTER APPLY(
                  SELECT string_agg(DS_OCUPACAO,';') as cargo
                  FROM ${modelConfig.get('CBO')} CBO
                  WHERE (R.CO_CBO_RAIS = CBO.CD_OCUPACAO)
                  AND TIPO = 'Sinônimo'
                  group by TIPO
              ) as Sinonimo

          WHERE CO_CPF = @CPF
          ORDER BY ano DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
