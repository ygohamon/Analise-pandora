
import { db, ISql } from './../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';
import { modelFactory as mf, getNomeFuncao } from '../../utils';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte_pf = MODEL_PRIORITY['bd_receita.sociopf'].fonte;
const rank_pf  = MODEL_PRIORITY['bd_receita.sociopf'].rank;
const grupo_pf = MODEL_PRIORITY['bd_receita.sociopf'].grupo;

export let getSocioPFEmpresaSimplificadoCNPJ_BD_Receita = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as nome, RIGHT(S.CpfCnpjSocio, 11) as cpf, CAST(S.PercentualCapitalSocial AS float)/100 as percCapital,
            S.CNPJ as empresa_cnpj, PJ.RazaoSocial as empresa_razaoSocial, PJ.NomeFantasia as empresa_nomeFantasia, '${modelConfig.sigla}' as fonte


        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CNPJ=@CNPJ AND S.IdentificadorSocio=2
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
};

const fonte_pj = MODEL_PRIORITY['bd_receita.sociopj'].fonte;
const rank_pj  = MODEL_PRIORITY['bd_receita.sociopj'].rank;
const grupo_pj = MODEL_PRIORITY['bd_receita.sociopj'].grupo;

export let getSocioPJEmpresaSimplificadoCNPJ_BD_Receita = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as razaoSocial, S.CpfCnpjSocio as cnpj, CAST(S.PercentualCapitalSocial AS float)/100 as percCapital,
            S.CNPJ as empresa_cnpj, PJ.RazaoSocial as empresa_razaoSocial, PJ.NomeFantasia as empresa_nomeFantasia, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CNPJ=@CNPJ AND S.IdentificadorSocio=1
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
};

const fonte_es = MODEL_PRIORITY['bd_receita.socioestrangeiro'].fonte;
const rank_es  = MODEL_PRIORITY['bd_receita.socioestrangeiro'].rank;
const grupo_es = MODEL_PRIORITY['bd_receita.socioestrangeiro'].grupo;

export let getSocioEstrangeiroEmpresaSimplificadoCNPJ_BD_Receita = function (cnpj: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            S.NomeSocio as razaoSocial, S.NomePaisSocio as nomePais, CAST(S.PercentualCapitalSocial AS float)/100 as percCapital,
            S.CNPJ as empresa_cnpj, PJ.RazaoSocial as empresa_razaoSocial, PJ.NomeFantasia as empresa_nomeFantasia, '${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO')} AS S
            INNER JOIN ${modelConfig.get('PJ')} AS PJ ON (S.CNPJ = PJ.CNPJ)
        WHERE S.CNPJ=@CNPJ AND S.IdentificadorSocio=3
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_es, rank: rank_es, grupo: grupo_es });
};
