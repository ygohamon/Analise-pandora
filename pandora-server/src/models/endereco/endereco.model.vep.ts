
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from '../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_VEP');

const fonte = MODEL_PRIORITY['vep.endereco'].fonte;
const rank  = MODEL_PRIORITY['vep.endereco'].rank;
const grupo = MODEL_PRIORITY['vep.endereco'].grupo;

export let getEnderecoCPF_VEP = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.CPF as cpf
            ,UPPER(P.DS_PESSOA) as nome
            ,UPPER(L.DS_LOCALIDADE) AS logradouro
            ,E.NUMERO AS numero
            ,UPPER(E.DS_COMPLEMENTO) AS complemento
            ,UPPER(B.DS_BAIRRO) AS bairro
            ,L.CEPLOCALIDADE AS cep
            ,UF.DS_SIGLA AS uf
            ,UPPER(C2.DS_CIDADE) AS municipio
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('ENDERECOPESSOA')} EP ON (EP.FK_PESSOA = P.ID_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('ENDERECO')} E ON (E.ID_ENDERECO = EP.FK_ENDERECO)
            LEFT OUTER JOIN ${modelConfig.get('LOCALIDADE')} L ON (L.ID_LOCALIDADE = E.FK_LOCALIDADE)
            LEFT OUTER JOIN ${modelConfig.get('BAIRRO')} B ON (B.ID_BAIRRO = L.FK_BAIRRO)
            LEFT OUTER JOIN ${modelConfig.get('CIDADE')} C2 ON (C2.ID_CIDADE = B.FK_CIDADE)
            LEFT OUTER JOIN ${modelConfig.get('UF')} UF ON (UF.ID_UF = C2.FK_UF)

        WHERE PF.CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};

export let getEnderecoRG_VEP = function (rg: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['IDENTIDADE_NUM', ISql.Char, rg],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            PF.IDENTIDADE_NUM as rg
            ,UPPER(P.DS_PESSOA) as nome
            ,UPPER(L.DS_LOCALIDADE) AS logradouro
            ,E.NUMERO AS numero
            ,UPPER(E.DS_COMPLEMENTO) AS complemento
            ,UPPER(B.DS_BAIRRO) AS bairro
            ,L.CEPLOCALIDADE AS cep
            ,UF.DS_SIGLA AS uf
            ,UPPER(C2.DS_CIDADE) AS municipio
            ,'${modelConfig.sigla}' as fonte

        FROM ${modelConfig.get('PF')} PF
            LEFT OUTER JOIN ${modelConfig.get('PESSOA')} P ON (P.ID_PESSOA = PF.FK_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('ENDERECOPESSOA')} EP ON (EP.FK_PESSOA = P.ID_PESSOA)
            LEFT OUTER JOIN ${modelConfig.get('ENDERECO')} E ON (E.ID_ENDERECO = EP.FK_ENDERECO)
            LEFT OUTER JOIN ${modelConfig.get('LOCALIDADE')} L ON (L.ID_LOCALIDADE = E.FK_LOCALIDADE)
            LEFT OUTER JOIN ${modelConfig.get('BAIRRO')} B ON (B.ID_BAIRRO = L.FK_BAIRRO)
            LEFT OUTER JOIN ${modelConfig.get('CIDADE')} C2 ON (C2.ID_CIDADE = B.FK_CIDADE)
            LEFT OUTER JOIN ${modelConfig.get('UF')} UF ON (UF.ID_UF = C2.FK_UF)

        WHERE PF.IDENTIDADE_NUM=@IDENTIDADE_NUM
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
};