
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY } from './../../config';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_TIPOLOGIAS');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte_pf   = MODEL_PRIORITY['tipologias.pf'].fonte;
const rank_pf    = MODEL_PRIORITY['tipologias.pf'].rank;
const grupo_pf   = MODEL_PRIORITY['tipologias.pf'].grupo;

export let getTipologiaSimplificadoCPF_Tipologias = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT
            CPF as cpf, Credor as nome,
            T1 as t1,   T2 as t2,   T3 as t3,   T4 as t4,   T5 as t5,
            T6 as t6,   T7 as t7,   T8 as t8,   T9 as t9,   T10 as t10,
            T11 as t11, T12 as t12, T13 as t13, T14 as t14, T15 as t15,
            T16 as t16, T17 as t17, T18 as t18, T19 as t19, T20 as t20,
            T21 as t21, T22 as t22, T23 as t23, T24 as t24, T25 as t25,
            T26 as t26, T27 as t27, T28 as t28, T29 as t29, T30 as t30,
            T31 as t31,
            TotalOcorrencias as totalOcorrencias, TotalPesoTipologia as totalPeso,
            DoacaoEleitoral as doacaoEleitoral, TaxaDoacao as taxaDoacao,
            TotalTCS as totalTCS, '${modelConfig.sigla}' AS fonte

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF AND TotalOcorrencias > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

export let getTipologiaPFSimplificadoUFMunicipio_Tipologias = function (dados){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['uf', ISql.NVarChar, dados.uf],
    ['municipio', ISql.VarChar, dados.municipio],
    ],`
      SELECT TOP 100
          PF.CPF,
          PF.Nome,
          T.TotalPesoTipologia,
          T.TotalOcorrencias,
          T.DoacaoEleitoral,
          T.TaxaDoacao,
          T.TotalTCS,
          '${modelConfig.sigla}' AS fonte
      FROM ${modelReceita.get('PF')} PF
        LEFT OUTER JOIN ${modelConfig.get('PF')} T ON (PF.CPF = T.CPF)
      WHERE PF.UF=@uf AND PF.Municipio=@municipio
      ORDER BY T.TotalPesoTipologia DESC, T.TotalTCS DESC
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

const fonte_pj   = MODEL_PRIORITY['tipologias.pj'].fonte;
const rank_pj    = MODEL_PRIORITY['tipologias.pj'].rank;
const grupo_pj   = MODEL_PRIORITY['tipologias.pj'].grupo;

export let getTipologiaSimplificadoCNPJ_Tipologias = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT
            CNPJ as cnpj, TRIM(Credor) as razaoSocial, TRIM(NomeFantasia) as nomeFantasia,
            T1 as t1,   T2 as t2,   T3 as t3,   T4 as t4,   T5 as t5,
            T6 as t6,   T7 as t7,   T8 as t8,   T9 as t9,   T10 as t10,
            T11 as t11, T13 as t13, T14 as t14,
            T16 as t16, T17 as t17, T18 as t18, T19 as t19, T20 as t20,
            T21 as t21, T22 as t22, T23 as t23, T24 as t24, T25 as t25,
            T26 as t26, T27 as t27, T28 as t28, T29 as t29, T30 as t30,
            T31 as t31, T32 as t32, T33 as t33, T34 as t34, T35 as t35,
            T36 as t36, T37 as t37, T38 as t38, T39 as t39, T40 as t40,
            T41 as t41, T42 as t42, T43 as t43, T44 as t44, T45 as t45,
            T46 as t46, T47 as t47, T48 as t48, T49 as t49, T50 as t50,
            T51 as t51, T52 as t52, T53 as t53, T54 as t54,
            TotalOcorrencias as totalOcorrencias, TotalPesoTipologia as totalPeso,
            DoacaoEleitoral as doacaoEleitoral, TaxaDoacao as taxaDoacao,
            TotalTCS as totalTCS, '${modelConfig.sigla}' AS fonte
      FROM ${modelConfig.get('PJ')}
      WHERE CNPJ=@CNPJ  AND TotalOcorrencias > 0
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};

export let getTipologiaPJSimplificadoUFMunicipio_Tipologias = function (uf: string, municipio: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['uf', ISql.NVarChar, uf],
      ['municipio', ISql.VarChar, municipio],
      ],`
        SELECT TOP 100
            PJ.CNPJ AS cnpj,
            TRIM(PJ.RazaoSocial) AS razaoSocial,
            TRIM(PJ.NomeFantasia) AS nomeFantasia,
            T.TotalPesoTipologia AS totalPeso,
            T.TotalOcorrencias AS totalOcorrencias,
            T.DoacaoEleitoral AS doacaoEleitoral,
            T.TaxaDoacao AS taxaDoacao,
            T.TotalTCS AS totalTCS,
            '${modelConfig.sigla}' AS fonte
        FROM ${modelReceita.get('PJ')} PJ
            LEFT OUTER JOIN ${modelConfig.get('PJ')} T ON (PJ.CNPJ = T.CNPJ)
        WHERE PJ.UF=@uf AND PJ.Municipio=@municipio
        ORDER BY T.TotalPesoTipologia DESC, T.TotalTCS DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};
