
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VEP');

const fonte  = MODEL_PRIORITY['vep.pessoa'].fonte;
const rank   = MODEL_PRIORITY['vep.pessoa'].rank;
const grupo  = MODEL_PRIORITY['vep.pessoa'].grupo;

export let getPessoaDetalhadoCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.VarChar(11), cpf],
      ],`
          SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
              UPPER(P.DS_PESSOA) as nome
              ,PF.DT_NASCIMENTO as dataNascimento
              ,UPPER(PF.PAI) as nomePai
              ,UPPER(PF.MAE) as nomeMae
              ,UPPER(PF.CONJUGE) as conjuge
              ,PF.IDENTIDADE_NUM as rg
              ,UPPER(PF.IDENTIDADE_ORGAO) as orgEmissorRg
              ,UPPER(UF_IDENT.DS_SIGLA) AS ufOrgEmissorRG
              ,PF.CPF as cpf
              ,PF.RESERVISTA_NUM as reservista
              ,PF.RESERVISTA_CIRC as reservistaCirc
              ,PF.RESERVISTA_SERIE as reservistaSerie
              ,PF.TITULO_NUM as tituloEleitor
              ,PF.TITULO_SECAO as tituloSecao
              ,PF.TITULO_ZONA as tituloZona
              ,PF.CART_PROF_NUM as carteiraProfNum
              ,PF.CART_PROF_SERIE as carteiraProfSerie
              ,UF_CART_TRAB.DS_UF as carteiraProfUf
              ,UPPER(C.DS_CIDADE) AS naturalidade
              ,UPPER(ALC.DS_ALCUNHA) as vulgo
              ,'${modelConfig?.sigla}' as fonte

          FROM ${modelConfig.get('PF')} PF
              LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
              LEFT OUTER JOIN ${modelConfig.get('UF')} UF_IDENT ON (UF_IDENT.ID_UF = PF.FK_IDENTIDADE_UF)
              LEFT OUTER JOIN ${modelConfig.get('CIDADE')} C ON (C.ID_CIDADE = PF.FK_NATURALIDADE)
              LEFT OUTER JOIN ${modelConfig.get('UF')} UF_CART_TRAB ON (UF_CART_TRAB.ID_UF = PF.FK_CART_PROF_UF)
              OUTER APPLY(
                  SELECT STUFF((
                      SELECT ', ' + ALC2.DS_ALCUNHA
                      FROM ${modelConfig.get('ALCUNHA')} ALC2
                          INNER JOIN ${modelConfig.get('PARTE')} PT2 ON (PT2.ID_PARTE = ALC2.FK_PARTE)
                      WHERE PT2.FK_PESSOAFISICA = PF.ID_PESSOAFISICA
                      FOR XML PATH('')
                  ), 1, 2, '') AS DS_ALCUNHA
              ) ALC
          WHERE CPF = @CPF
              AND  NOT EXISTS(
              SELECT 1
              FROM ${modelConfig.get('PARTEPROCESSOADV')} PPA
              INNER JOIN ${modelConfig.get('PARTEPROC')} PRO ON (PPA.FK_PARTEPROCESSO = PRO.ID_PARTEPROCESSO)
              INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PRO.FK_PARTE)
              WHERE (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
          )
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getPessoaDetalhadoRG_VEP = function (rg: string){

    const nomeFuncao = getNomeFuncao(1, 2);
    const query = () => {
      return db.query([
        ['IDENTIDADE_NUM',ISql.VarChar ,rg],
        ],`
            SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
                UPPER(P.DS_PESSOA) as nome
                ,PF.DT_NASCIMENTO as dataNascimento
                ,UPPER(PF.PAI) as nomePai
                ,UPPER(PF.MAE) as nomeMae
                ,UPPER(PF.CONJUGE) as conjuge
                ,PF.IDENTIDADE_NUM as rg
                ,UPPER(PF.IDENTIDADE_ORGAO) as orgEmissorRg
                ,UPPER(UF_IDENT.DS_SIGLA) AS ufOrgEmissorRG
                ,PF.CPF as cpf
                ,PF.RESERVISTA_NUM as reservista
                ,PF.RESERVISTA_CIRC as reservistaCirc
                ,PF.RESERVISTA_SERIE as reservistaSerie
                ,PF.TITULO_NUM as tituloEleitor
                ,PF.TITULO_SECAO as tituloSecao
                ,PF.TITULO_ZONA as tituloZona
                ,PF.CART_PROF_NUM as carteiraProfNum
                ,PF.CART_PROF_SERIE as carteiraProfSerie
                ,UF_CART_TRAB.DS_UF as carteiraProfUf
                ,UPPER(C.DS_CIDADE) AS naturalidade
                ,UPPER(ALC.DS_ALCUNHA) as vulgo
                ,'${modelConfig?.sigla}' as fonte
  
            FROM ${modelConfig.get('PF')} PF
                LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
                LEFT OUTER JOIN ${modelConfig.get('UF')} UF_IDENT ON (UF_IDENT.ID_UF = PF.FK_IDENTIDADE_UF)
                LEFT OUTER JOIN ${modelConfig.get('CIDADE')} C ON (C.ID_CIDADE = PF.FK_NATURALIDADE)
                LEFT OUTER JOIN ${modelConfig.get('UF')} UF_CART_TRAB ON (UF_CART_TRAB.ID_UF = PF.FK_CART_PROF_UF)
                OUTER APPLY(
                    SELECT STUFF((
                        SELECT ', ' + ALC2.DS_ALCUNHA
                        FROM ${modelConfig.get('ALCUNHA')} ALC2
                            INNER JOIN ${modelConfig.get('PARTE')} PT2 ON (PT2.ID_PARTE = ALC2.FK_PARTE)
                        WHERE PT2.FK_PESSOAFISICA = PF.ID_PESSOAFISICA
                        FOR XML PATH('')
                    ), 1, 2, '') AS DS_ALCUNHA
                ) ALC
            WHERE IDENTIDADE_NUM = @IDENTIDADE_NUM
                AND  NOT EXISTS(
                SELECT 1
                FROM ${modelConfig.get('PARTEPROCESSOADV')} PPA
                INNER JOIN ${modelConfig.get('PARTEPROC')} PRO ON (PPA.FK_PARTEPROCESSO = PRO.ID_PARTEPROCESSO)
                INNER JOIN ${modelConfig.get('PARTE')} P ON (P.ID_PARTE = PRO.FK_PARTE)
                WHERE (PF.ID_PESSOAFISICA = P.FK_PESSOAFISICA)
            )
        `);
    }
  
    return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
  };