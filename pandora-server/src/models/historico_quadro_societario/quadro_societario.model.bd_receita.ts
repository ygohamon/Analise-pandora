
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['bd_receita.socio.historico'].fonte;
const rank  = MODEL_PRIORITY['bd_receita.socio.historico'].rank;
const grupo = MODEL_PRIORITY['bd_receita.socio.historico'].grupo;

export let getHistoricoQuadroPFDetalhadoCPF_BD_Receita = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ_EMPRESA as cnpj
            ,PJ.RazaoSocial as razaoSocial
            ,PJ.NomeFantasia as nomeFantasia
            ,PJ.DataInicioAtividade as dataInicioAtividade
            ,PJ.CpfResponsavel as cpfResponsavel
            ,PJ.NomeResponsavel as nomeResponsavel

            ,S.NUM_CPF as cpf
            ,S.Nome as nome
            ,DATA_ENTRADA_SOCIEDADE  as dataEntradaSociedade
            ,DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade
            ,CAST(VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital
            ,Q.nm_qualificacao_responsavel_socio as vinculo
            ,'pf' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            LEFT OUTER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.cnpj)
            LEFT OUTER JOIN ${modelConfig.get('QUALIFICACAO_RESPONSAVEL')} Q ON (S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio)
        WHERE NUM_CPF = @CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getHistoricoQuadroPJDetalhadoCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ_EMPRESA as empresa_cnpj
            ,PJ.RazaoSocial as empresa_razaoSocial
            ,PJ.NomeFantasia as empresa_nomeFantasia
            ,PJ.DataInicioAtividade as dataInicioAtividade
            ,PJ.CpfResponsavel as cpfResponsavel
            ,PJ.NomeResponsavel as nomeResponsavel

            ,S.NUM_CNPJ as cnpj
            ,S.NOME as razaoSocial
            ,CAST(VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital
            ,DATA_ENTRADA_SOCIEDADE as dataEntradaSociedade
            ,DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade
            ,Q.nm_qualificacao_responsavel_socio as vinculo
            ,'pj-pj' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            LEFT OUTER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.cnpj)
            LEFT OUTER JOIN ${modelConfig.get('QUALIFICACAO_RESPONSAVEL')} Q ON (S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio)
        WHERE IND_TIPO = 'PJ' AND NUM_CNPJ_EMPRESA = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getHistoricoQuadroPFDetalhadoCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            NUM_CNPJ_EMPRESA as empresa_cnpj
            ,PJ.RazaoSocial as empresa_razaoSocial
            ,PJ.NomeFantasia as empresa_nomeFantasia
            ,PJ.DataInicioAtividade as dataInicioAtividade
            ,PJ.CpfResponsavel as cpfResponsavel
            ,PJ.NomeResponsavel as nomeResponsavel

            ,S.NUM_CPF as cpf
            ,S.Nome as nome
            ,CAST(VALOR_PERCENTUA_CAPITAL_SOCIAL AS FLOAT) as percCapital
            ,DATA_ENTRADA_SOCIEDADE as dataEntradaSociedade
            ,DATA_DE_EXCLUSAO_NA_SOCIEDADE as dataSaidaSociedade
            ,Q.nm_qualificacao_responsavel_socio as vinculo
            ,'pj-pf' as tipo
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SOCIO_HISTORICO')} S
            LEFT OUTER JOIN ${modelConfig.get('PJ')} PJ ON (S.NUM_CNPJ_EMPRESA = PJ.cnpj)
            LEFT OUTER JOIN ${modelConfig.get('QUALIFICACAO_RESPONSAVEL')} Q ON (S.COD_QUALIFICACAO_SOCIO = Q.cod_qualificacao_responsavel_socio)
        WHERE IND_TIPO = 'PF' AND NUM_CNPJ_EMPRESA = @CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
