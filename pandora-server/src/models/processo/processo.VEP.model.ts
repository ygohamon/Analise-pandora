
import { db, ISql } from '../../services/db.service';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';

const modelConfig = getModelConfig('BD_VEP');

const fonte = MODEL_PRIORITY['vep.processo'].fonte;
const rank  = MODEL_PRIORITY['vep.processo'].rank;
const grupo = MODEL_PRIORITY['vep.processo'].grupo;

export let getProcessoCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.CPF AS cpf,
            PRO.NUMEROPROCESSO AS numeroProcesso,
            PRO.DT_RECEBIMENTO AS dataRecebimento,
            PRO.DT_ARQUIVAMENTO as dataArquivamento,
            PRO.STATUS as status,
            PRO.PRIORIDADE as prioridade,
            PRO.SEGREDOJUSTICA as segredoJustica,
            PRO.NUMEROPROCESSOUNIFICADO as numeroProcessoUnificado,
            PRO.NUMEROPROCESSODEPENDENTE as numeroProcessoDependente,
            'processo' as tipo

        FROM ${modelConfig.get('PF')} PF
            INNER JOIN ${modelConfig.get('PARTE')} PT ON (PT.FK_PESSOAFISICA = PF.ID_PESSOAFISICA)
            INNER JOIN ${modelConfig.get('PARTEPROC')} PP ON (PP.FK_PARTE = PT.ID_PARTE)
            INNER JOIN ${modelConfig.get('PROCESSO')} PRO ON (PRO.NUMEROPROCESSO = PP.FK_PROCESSO)

        WHERE PF.CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getProcessoRG_VEP = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.IDENTIDADE_NUM AS rg,
            PRO.NUMEROPROCESSO AS numeroProcesso,
            PRO.DT_RECEBIMENTO AS dataRecebimento,
            PRO.DT_ARQUIVAMENTO as dataArquivamento,
            PRO.STATUS as status,
            PRO.PRIORIDADE as prioridade,
            PRO.SEGREDOJUSTICA as segredoJustica,
            PRO.NUMEROPROCESSOUNIFICADO as numeroProcessoUnificado,
            PRO.NUMEROPROCESSODEPENDENTE as numeroProcessoDependente,
            'processo' as tipo

        FROM ${modelConfig.get('PF')} PF
            INNER JOIN ${modelConfig.get('PARTE')} PT ON (PT.FK_PESSOAFISICA = PF.ID_PESSOAFISICA)
            INNER JOIN ${modelConfig.get('PARTEPROC')} PP ON (PP.FK_PARTE = PT.ID_PARTE)
            INNER JOIN ${modelConfig.get('PROCESSO')} PRO ON (PRO.NUMEROPROCESSO = PP.FK_PROCESSO)

        WHERE PF.IDENTIDADE_NUM=@IDENTIDADE_NUM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPenaProcessoCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              PF.CPF as cpf
              ,PRO.NUMEROPROCESSO as numeroProcesso
              ,PENAACUMPRIR as penaACumprir
              ,TOTALPENA as totalPena
              ,HSP.STATUS as status
              ,SP.DS_SITUACAOPENAL as situacaoPenal
              ,DT_SITUACAO as dataSituacao
              ,DT_FIMPENA as dataFimPena
              ,DT_INICIOPENA as dataInicioPena
              ,'progressaopena' as tipo

          FROM ${modelConfig.get('SOMAPENA')} HSP
              INNER JOIN ${modelConfig.get('SITUACAOPENAL')} SP ON (SP.ID_SITUACAOPENAL = HSP.FK_SITUACAOPENAL)
              INNER JOIN ${modelConfig.get('PARTEPROC')} PP ON (PP.ID_PARTEPROCESSO = HSP.FK_PARTEPROCESSO)
              INNER JOIN ${modelConfig.get('PROCESSO')} PRO ON (PRO.NUMEROPROCESSO = PP.FK_PROCESSO)
              INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PP.FK_PARTE)
              INNER JOIN ${modelConfig.get('PF')} PF ON (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
          WHERE CPF=@CPF
          ORDER BY DT_SITUACAO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPenaProcessoRG_VEP = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.Char, rg],
      ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              PF.IDENTIDADE_NUM as rg
              ,PRO.NUMEROPROCESSO as numeroProcesso
              ,PENAACUMPRIR as penaACumprir
              ,TOTALPENA as totalPena
              ,HSP.STATUS as status
              ,SP.DS_SITUACAOPENAL as situacaoPenal
              ,DT_SITUACAO as dataSituacao
              ,DT_FIMPENA as dataFimPena
              ,DT_INICIOPENA as dataInicioPena
              ,'progressaopena' as tipo

          FROM ${modelConfig.get('SOMAPENA')} HSP
              INNER JOIN ${modelConfig.get('SITUACAOPENAL')} SP ON (SP.ID_SITUACAOPENAL = HSP.FK_SITUACAOPENAL)
              INNER JOIN ${modelConfig.get('PARTEPROC')} PP ON (PP.ID_PARTEPROCESSO = HSP.FK_PARTEPROCESSO)
              INNER JOIN ${modelConfig.get('PROCESSO')} PRO ON (PRO.NUMEROPROCESSO = PP.FK_PROCESSO)
              INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PP.FK_PARTE)
              INNER JOIN ${modelConfig.get('PF')} PF ON (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
          WHERE IDENTIDADE_NUM=@IDENTIDADE_NUM
          ORDER BY DT_SITUACAO DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
