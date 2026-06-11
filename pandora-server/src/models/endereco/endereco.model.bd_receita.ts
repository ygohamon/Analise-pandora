
import { db, ISql } from '../../services/db.service';
import { modelFactory as mf, getNomeFuncao } from './../../utils';
import { MODEL_PRIORITY, API_CONFIG } from '../../config';
import { getModelConfig } from '../../config.models';

const modelConfig = getModelConfig('BD_RECEITA');
const modelSefaz = getModelConfig('BD_SEFAZ');

const fonte_pf = MODEL_PRIORITY['bd_receita.pf.endereco'].fonte;
const rank_pf  = MODEL_PRIORITY['bd_receita.pf.endereco'].rank;
const grupo_pf = MODEL_PRIORITY['bd_receita.pf.endereco'].grupo;

const PF_ATRIBUTOS_SIMPLIFICADO = `
  CPF as cpf,
  NOME as nome,
  TipoLogradouro as tipoLogradouro,
  Logradouro as logradouro,
  CASE WHEN TRY_CAST(NumeroLogradouro as int) IS NULL THEN 0 ELSE CAST(NumeroLogradouro as int) END as numero,
  Complemento as complemento,
  Bairro as bairro,
  Cep as cep,
  Municipio as municipio,
  UF as uf,
  '${modelConfig?.sigla}' as fonte
`;

export let getEnderecoCPF_BD_Receita = function (cpf: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CPF', ISql.Char(11), cpf],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PF_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PF')}
        WHERE CPF=@CPF
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
}

export let getEnderecoLogradouro_BD_Receita_Pessoa_Fisica = function (logradouro: string, numero: string = null, municipio: string = null){

  let query_numero    = (numero) ? `AND NumeroLogradouro = '${numero}'` : '';
  let query_municipio = (municipio) ? `AND Municipio = '${municipio}'` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['LOGRADOURO', ISql.VarChar, logradouro],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
        ${PF_ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('PF')}
      WHERE CONTAINS(Logradouro, @LOGRADOURO) ${query_numero} ${query_municipio}
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pf, rank: rank_pf, grupo: grupo_pf });
}

const fonte_pj = MODEL_PRIORITY['bd_receita.pj.endereco'].fonte;
const rank_pj  = MODEL_PRIORITY['bd_receita.pj.endereco'].rank;
const grupo_pj = MODEL_PRIORITY['bd_receita.pj.endereco'].grupo;

const PJ_ATRIBUTOS_SIMPLIFICADO = `
  CNPJ as cnpj,
  RazaoSocial as razaoSocial,
  DescricaoTipoLogradouro as tipoLogradouro,
  Logradouro as logradouro,
  Numero as numero,
  Complemento as complemento,
  Bairro as bairro,
  Cep as cep,
  Municipio as municipio,
  UF as uf,
  '${modelConfig?.sigla}' as fonte
`;

export let getEnderecoCNPJ_BD_Receita = function (cnpj: string){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['CNPJ', ISql.Char(14), cnpj],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PJ_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')}
        WHERE CNPJ=@CNPJ
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
}

export let getEnderecoLogradouro_BD_Receita_Pessoa_Juridica = function (logradouro: string, numero: string = null, municipio: string = null){

  let query_numero    = (numero) ? `AND numero = '${numero}'` : '';
  let query_municipio = (municipio) ? `AND municipio = '${municipio}'` : '';

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
    ['LOGRADOURO', ISql.VarChar, logradouro],
    ],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
          ${PJ_ATRIBUTOS_SIMPLIFICADO}

      FROM ${modelConfig.get('PJ')}
      WHERE CONTAINS(Logradouro, @LOGRADOURO) ${query_numero} ${query_municipio}
    `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
}

export let getEnderecoItemNotaFiscal_BD_Receita = function (idItem: any){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['idItem', ISql.BigInt, idItem],
      ],`
        SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PJ_ATRIBUTOS_SIMPLIFICADO}

        FROM ${modelConfig.get('PJ')} PJ
        WHERE PJ.CNPJ = (SELECT TOP 1 CNPJEmitente FROM ${modelSefaz.get('NOTAFISCAL')} NF JOIN ${modelSefaz.get('ITEMNOTAFISCAL')} INF ON INF.IDNF = NF.IDNF WHERE idItem = @idItem ) COLLATE Latin1_General_CI_AS
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
}

export let getEnderecosDestinatariosItemNotaFiscal_BD_Receita = function (idItem: any){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([
      ['idItem', ISql.BigInt, idItem],
      ],`
        SELECT
          DISTINCT
          TOP ${API_CONFIG.SERVER_MAX_RESULTS}
            ${PJ_ATRIBUTOS_SIMPLIFICADO}
        FROM ${modelConfig.get('PJ')} PJ
        INNER JOIN ${modelSefaz.get('NOTAFISCAL')} NF ON NF.CNPJDestinatario = PJ.CNPJ COLLATE Latin1_General_CI_AS
        WHERE CNPJEmitente = (select top 1 cnpjEmitente from ${modelSefaz.get('NOTAFISCAL')} nf join ${modelSefaz.get('ITEMNOTAFISCAL')} inf on nf.IdNF = inf.IdNF and inf.IdItem = @idItem)
        AND NF.IdNF in
        (
          select distinct idnf from ${modelSefaz.get('ITEMNOTAFISCAL')} inf join ${modelSefaz.get('ITEMPRODUTOANOMALO')} inp on inp.idItem = inf.IdItem join ${modelSefaz.get('PRODUTO')} on inp.idproduto = id where idProduto = (select top 1 id from ${modelSefaz.get('PRODUTO')} join ${modelSefaz.get('ITEMPRODUTOANOMALO')} on id = idProduto and idItem = @idItem)
        )
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte: fonte_pj, rank: rank_pj, grupo: grupo_pj });
}
