
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_SAGRES');

const fonte = MODEL_PRIORITY['sagres_municipal.v_folhapagamento'].fonte;
const rank = MODEL_PRIORITY['sagres_municipal.v_folhapagamento'].rank;
const grupo = MODEL_PRIORITY['sagres_municipal.v_folhapagamento'].grupo;

export let getServidorMunicipalSimplificadoCPF_BD_Sagres = function(cpf: string) {

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ano as dtAno
            ,cpf_servidor as cpf
            ,matricula
            ,poder
            ,TRIM(orgao) as orgao
            ,cargo
            ,vinculo
            ,SUM(valor_remuneracao_total) as vlBruto
            ,COUNT(*) as meses
            ,SUM(valor_remuneracao_total) / COUNT(*) as media
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SM_FOLHAPAGAMENTO')}
        WHERE cpf_servidor=@CPF
        GROUP BY ano, cpf_servidor, matricula, poder, orgao, cargo, vinculo
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};


export let getServidorMunicipalDetalhadoCPF_BD_Sagres = function(cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ano
            ,ano + mes as mesAno
            ,cpf_servidor as cpf
            ,matricula
            ,poder
            ,TRIM(orgao) as orgao
            ,cargo
            ,vinculo
            ,valor_remuneracao_total as vlBruto
            ,data_admissao as dtAdmissao
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('SM_FOLHAPAGAMENTO')}
        WHERE cpf_servidor=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}
