
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from './../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RENACH_2014');

const fonte  = MODEL_PRIORITY['renach.pessoa'].fonte;
const rank   = MODEL_PRIORITY['renach.pessoa'].rank;
const grupo  = MODEL_PRIORITY['renach.pessoa'].grupo;

export let getPessoaDetalhadoCPF_Renach_2016_08 = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['cpf_parameter', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            nr_cpf as cpf
            ,UPPER(nm_condutor) as nome
            ,CASE
                WHEN isdate(dt_nascimento) = 1 THEN cast(dt_nascimento as date)
                ELSE NULL
            END as dataNascimento
            ,UPPER(ds_local_nascimento) as naturalidade
            ,CASE
                WHEN cd_sexo = 1 THEN 'MASCULINO'
                WHEN cd_sexo = 2 THEN 'FEMININO'
                ELSE 'OUTROS'
            END as sexo
            ,CASE
                WHEN isdate(dt_cadastramento) = 1 THEN cast(dt_cadastramento as date)
                ELSE NULL
            END as dataCadastro
            ,UPPER(nm_mae) as nomeMae
            ,UPPER(nm_pai) as nomePai
            ,nr_registro as cnh
            ,nr_documento as rg
            ,ds_orgao_emissor as orgEmissorRg
            ,sg_uf_documento as ufOrgEmissorRG
            ,'${modelConfig?.sigla}' as fonte

        FROM ${modelConfig.get('PF')}
        WHERE nr_cpf=@cpf_parameter
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};
