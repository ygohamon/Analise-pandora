import { db, ISql } from '../../../services/db.service';
import { MODEL_PRIORITY, API_CONFIG } from '../../../config';
import { getModelConfig } from '../../../config.models';
import { modelFactory as mf, getNomeFuncao, toTextSearch } from '../../../utils';
import { isNullOrUndefined } from 'util';
import { Console } from 'console';

const modelConfig = getModelConfig('BD_SEFAZ');
const modelReceita = getModelConfig('BD_RECEITA');

const fonte = MODEL_PRIORITY['bd_sefaz'].fonte;
const rank = MODEL_PRIORITY['bd_sefaz'].rank;
const grupo = MODEL_PRIORITY['bd_sefaz'].grupo;

export const getItensAnomalos = function(municipio : string, cnpjEmitente:string, cnpjDestinatario:string, dtInicio:any, dtFim:any, nomeProduto:any){   
  const nomeFuncao = getNomeFuncao(1, 2);
  let where = 'WHERE it.anomalo = 1'
  if (municipio && municipio != 'null')
    where = where + ` and R.Municipio = '${municipio}'`

  if (cnpjEmitente && cnpjEmitente != 'null')
    where = where + ` and nf.CNPJEmitente = '${cnpjEmitente}'`

  if (cnpjDestinatario && cnpjDestinatario != 'null')
    where = where + ` and nf.CNPJDestinatario = '${cnpjDestinatario}'`

  if (dtInicio && dtInicio != 'null')
    where = where + ` and nf.dhEmi >= '${dtInicio}'`

  if (dtFim && dtFim != 'null')
    where = where + ` and nf.dhEmi <= '${dtFim}'`

  if (nomeProduto)
    where = where + ` and PRO.nome = '${nomeProduto}'`

  const query = () => {
    return db.query([],`
      SELECT TOP ${API_CONFIG.SERVER_MAX_RESULTS}      
        UPPER(nf.NomeEmitente) as NomeEmitente
        ,nf.CNPJEmitente
        ,CONCAT(UPPER(R2.Municipio), '-', R2.UF) as endMunicipioEmitente
        ,nf.endFoneEmitente
        ,UPPER(nf.NomeDestinatario) as NomeDestinatario
        ,nf.CNPJDestinatario
        ,CONCAT(UPPER(R.Municipio), '-', R.UF) as endMunicipioDestinatario
        ,nf.endFoneDestinatario
        ,PRO.id as IdProduto
        ,UPPER(pro.nome) as nomeProduto
        ,UPPER(pro.unidadeAquisicao) as unidadeAquisicao        
        ,pro.lowerLimit
        ,pro.upperLimit
        ,case when pro.lowerLimit < 0 then 'Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
              else 'De ' + FORMAT(pro.lowerLimit, 'C', 'pt-br') + ' Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
        end as faixaPreco
        ,IT.idItem as IdItem
        ,nf.dhEmi as dataEmissao
        ,IT.valorUnitario as ValorUnitario
        ,it.anomalo
      FROM ${modelConfig.get('PRODUTO')} PRO 
      INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON PRO.id = IT.idProduto
      INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} inf on it.idItem = inf.IdItem
      INNER JOIN ${modelConfig.get('NOTAFISCAL')} nf on nf.IdNF = inf.IdNF
      INNER JOIN (SELECT CNPJ,Uf,Municipio
        FROM ${modelReceita.get('PJ')}) R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
      INNER JOIN (SELECT CNPJ,Uf,Municipio
        FROM ${modelReceita.get('PJ')}) R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
      ` + where + ' ORDER BY IT.valorUnitario - upperLimit desc, nf.dhEmi DESC');
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte, rank, grupo });
}

const fonte_outros_itens = MODEL_PRIORITY['sefaz_outros_itens'].fonte;
const rankoutros_itens = MODEL_PRIORITY['sefaz_outros_itens'].rank;
const grupooutros_itens = MODEL_PRIORITY['sefaz_outros_itens'].grupo;

export const getOutrosItensNF = function(idItem : any){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([],`
      SELECT
        UPPER(nf.NomeEmitente) as NomeEmitente
        ,nf.CNPJEmitente
        ,CONCAT(UPPER(R2.Municipio), '-', R2.UF) as endMunicipioEmitente
        ,nf.endFoneEmitente
        ,UPPER(nf.NomeDestinatario) as NomeDestinatario
        ,nf.CNPJDestinatario
        ,CONCAT(UPPER(R.Municipio), '-', R.UF) as endMunicipioDestinatario
        ,nf.endFoneDestinatario
        ,PRO.id as IdProduto
        ,UPPER(pro.nome) as nomeProduto
        ,UPPER(pro.unidadeAquisicao) as unidadeAquisicao
        ,pro.lowerLimit
        ,pro.upperLimit
        ,case when pro.lowerLimit < 0 then 'Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
              else 'De ' + FORMAT(pro.lowerLimit, 'C', 'pt-br') + ' Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
        end as faixaPreco
        ,IT.idItem as IdItem
        ,FORMAT(nf.dhEmi , 'dd/MM/yyyy HH:mm:ss') as dataEmissao
        ,IT.valorUnitario as ValorUnitario
        ,it.anomalo 
      FROM ${modelConfig.get('PRODUTO')} PRO 
      INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON PRO.id = IT.idProduto
      INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} inf on it.idItem = inf.IdItem
      INNER JOIN ${modelConfig.get('NOTAFISCAL')} nf on nf.IdNF = inf.IdNF
      INNER JOIN ${modelReceita.get('PJ')} R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
      INNER JOIN ${modelReceita.get('PJ')} R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
      WHERE nf.IdNF = (SELECT idNf from ${modelConfig.get('ITEMNOTAFISCAL')} where idItem = ${idItem})      
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_outros_itens, rank: rankoutros_itens, grupo:grupooutros_itens });
}

const fonte_itens_produto = MODEL_PRIORITY['sefaz_itens_produtos'].fonte;
const rank_itens_produto = MODEL_PRIORITY['sefaz_itens_produtos'].rank;
const grupo_itens_produto = MODEL_PRIORITY['sefaz_itens_produtos'].grupo;

export const getItensDoProduto = function(idItem : any){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([],`
      SELECT
        UPPER(nf.NomeEmitente) as NomeEmitente
        ,nf.CNPJEmitente
        ,CONCAT(UPPER(R2.Municipio), '-', R2.UF) as endMunicipioEmitente
        ,nf.endFoneEmitente
        ,UPPER(nf.NomeDestinatario) as NomeDestinatario
        ,nf.CNPJDestinatario
        ,CONCAT(UPPER(R.Municipio), '-', R.UF) as endMunicipioDestinatario
        ,nf.endFoneDestinatario
        ,PRO.id as IdProduto
        ,UPPER(pro.nome) as nomeProduto
        ,UPPER(pro.unidadeAquisicao) as unidadeAquisicao
        ,pro.lowerLimit
        ,pro.upperLimit
        ,case when pro.lowerLimit < 0 then 'Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
              else 'De ' + FORMAT(pro.lowerLimit, 'C', 'pt-br') + ' Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
        end as faixaPreco
        ,IT.idItem as IdItem
        ,nf.dhEmi as dataEmissao
        ,IT.valorUnitario as ValorUnitario
        ,it.anomalo 
      FROM ${modelConfig.get('PRODUTO')} PRO 
      INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON PRO.id = IT.idProduto
      INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} inf on it.idItem = inf.IdItem
      INNER JOIN ${modelConfig.get('NOTAFISCAL')} nf on nf.IdNF = inf.IdNF
      INNER JOIN ${modelReceita.get('PJ')} R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
      INNER JOIN ${modelReceita.get('PJ')} R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
      WHERE PRO.id = (SELECT idProduto from ${modelConfig.get('ITEMPRODUTOANOMALO')} where idItem = ${idItem})
      ORDER BY NF.DHEMI
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_itens_produto, rank: rank_itens_produto, grupo:grupo_itens_produto });
}

const fonte_item_detalhado = MODEL_PRIORITY['sefaz_item_detalhado'].fonte;
const rank_item_detalhado = MODEL_PRIORITY['sefaz_item_detalhado'].rank;
const grupo_item_detalhado = MODEL_PRIORITY['sefaz_item_detalhado'].grupo;

export const getItemDetalhado = function(idItem : any){

  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([],`
      SELECT
        UPPER(nf.NomeEmitente) as NomeEmitente
        ,nf.CNPJEmitente
        ,CONCAT(UPPER(R2.Municipio), '-', R2.UF) as endMunicipioEmitente
        ,nf.endFoneEmitente
        ,UPPER(nf.NomeDestinatario) as NomeDestinatario
        ,nf.CNPJDestinatario
        ,CONCAT(UPPER(R.Municipio), '-', R.UF) as endMunicipioDestinatario
        ,nf.endFoneDestinatario
        ,PRO.id as IdProduto
        ,UPPER(pro.nome) as nomeProduto
        ,UPPER(pro.unidadeAquisicao) as unidadeAquisicao
        ,pro.lowerLimit
        ,pro.upperLimit
        ,case when pro.lowerLimit < 0 then 'Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
              else 'De ' + FORMAT(pro.lowerLimit, 'C', 'pt-br') + ' Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
        end as faixaPreco
        ,IT.idItem as IdItem
        ,FORMAT(nf.dhEmi , 'dd/MM/yyyy HH:mm:ss') as dataEmissao
        ,IT.valorUnitario as ValorUnitario
        ,it.anomalo
        ,nf.nsunotafiscal as nsu
        ,nf.nsuan as nsuan
        ,nf.natop
        ,nf.vTotalNota
        ,inf.codigoProduto
        ,inf.QuantidadeItem
        ,inf.ValorTotalItem
        ,inf.NCM
      FROM ${modelConfig.get('PRODUTO')} PRO 
      INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON PRO.id = IT.idProduto
      INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} inf on it.idItem = inf.IdItem
      INNER JOIN ${modelConfig.get('NOTAFISCAL')} nf on nf.IdNF = inf.IdNF
      INNER JOIN ${modelReceita.get('PJ')} R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
      INNER JOIN ${modelReceita.get('PJ')} R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
      WHERE it.idItem = ${idItem}
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_item_detalhado, rank: rank_item_detalhado, grupo:grupo_item_detalhado });
}

const fonte_itens_discrepantes_empresa_destinatario_item = MODEL_PRIORITY['sefaz_itens_discrepantes_empresa_destinatario_item'].fonte;
const rank_itens_discrepantes_empresa_destinatario_item = MODEL_PRIORITY['sefaz_itens_discrepantes_empresa_destinatario_item'].rank;
const grupo_itens_discrepantes_empresa_destinatario_item = MODEL_PRIORITY['sefaz_itens_discrepantes_empresa_destinatario_item'].grupo;

export const getItensDiscrepantesMesmaEmpresaDestinatarioItem = function(idItem : any){
  const nomeFuncao = getNomeFuncao(1, 2);
  const query = () => {
    return db.query([],`
      SELECT
        UPPER(nf.NomeEmitente) as NomeEmitente
        ,nf.CNPJEmitente
        ,CONCAT(UPPER(R2.Municipio), '-', R2.UF) as endMunicipioEmitente
        ,nf.endFoneEmitente
        ,UPPER(nf.NomeDestinatario) as NomeDestinatario
        ,nf.CNPJDestinatario
        ,CONCAT(UPPER(R.Municipio), '-', R.UF) as endMunicipioDestinatario
        ,nf.endFoneDestinatario
        ,PRO.id as IdProduto
        ,UPPER(pro.nome) as nomeProduto
        ,UPPER(pro.unidadeAquisicao) as unidadeAquisicao
        ,pro.lowerLimit
        ,pro.upperLimit
        ,case when pro.lowerLimit < 0 then 'Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
              else 'De ' + FORMAT(pro.lowerLimit, 'C', 'pt-br') + ' Até ' + FORMAT(pro.upperLimit, 'C', 'pt-br')
        end as faixaPreco
        ,IT.idItem as IdItem
        ,FORMAT(nf.dhEmi , 'dd/MM/yyyy HH:mm:ss') as dataEmissao
        ,IT.valorUnitario as ValorUnitario
        ,it.anomalo 
      FROM ${modelConfig.get('PRODUTO')} PRO 
      INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON PRO.id = IT.idProduto AND it.anomalo = 1
      INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} inf on it.idItem = inf.IdItem
      INNER JOIN ${modelConfig.get('NOTAFISCAL')} nf on nf.IdNF = inf.IdNF
      INNER JOIN ${modelReceita.get('PJ')} R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
      INNER JOIN ${modelReceita.get('PJ')} R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
      WHERE nf.cnpjDestinatario = (SELECT cnpjDestinatario from ${modelConfig.get('NOTAFISCAL')} NF JOIN ${modelConfig.get('ITEMNOTAFISCAL')} INF ON NF.IDNF = INF.IDNF where idItem = ${idItem})
      ORDER BY NF.DHEMI
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_itens_discrepantes_empresa_destinatario_item, rank: rank_itens_discrepantes_empresa_destinatario_item, grupo:grupo_itens_discrepantes_empresa_destinatario_item });
}

const fonte_top_fornecedores = MODEL_PRIORITY['sefaz_top_fornecedores'].fonte;
const rank_top_fornecedores = MODEL_PRIORITY['sefaz_top_fornecedores'].rank;
const grupo_top_fornecedores = MODEL_PRIORITY['sefaz_top_fornecedores'].grupo;

export const getTopFornecedores = function(top : any, tipoProduto:any, dataIni:any, dataFim:any, periodo:any, cnpjDestinatario:any, municipioDestinatario:any, suspeitos:any, produto:any){

  const nomeFuncao = getNomeFuncao(1, 2);

  let topRank;
  if (top)
    topRank = top;
  
  let medicamento = "SUBSTRING(NCM,1,4) IN ('3001','3002','3003','3004','3005','3006')";
  let roupa = "SUBSTRING(NCM,1,2) IN ('61','62','63','64')"
  let alimento = "SUBSTRING(NCM,1,2) IN ('02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22')"
  let where = `WHERE 1 = 1`;
  
  let tipoAlimento = [];

  if (tipoProduto && tipoProduto.indexOf("M") !== -1)
    tipoAlimento.push(medicamento)
  if (tipoProduto && tipoProduto.indexOf("V") !== -1)
    tipoAlimento.push(roupa)
  if (tipoProduto && tipoProduto.indexOf("A") !== -1)
    tipoAlimento.push(alimento)

  if (tipoAlimento.length > 0)
    where = `${where} AND (${tipoAlimento.join(' OR ')})`  

  if (periodo){
    where =`${where} AND DATEDIFF(mm,nf.dhEmi,GETDATE()) <= ${periodo}`;
  }
  else{
    if (dataIni && dataIni != 'null'){
      where = ` ${where} AND nf.dhEmi >= '${dataIni}'`;
    }
    if (dataFim && dataFim != 'null'){
      where = ` ${where} AND nf.dhEmi <= '${dataFim}'`;
    }
  }

  if (cnpjDestinatario)
    where = ` ${where} AND CNPJDestinatario = '${cnpjDestinatario}'`;
  if (municipioDestinatario)
    where = ` ${where} AND R.municipio = '${municipioDestinatario}'`

  if (produto)
    where = ` ${where} AND i.NomeProduto = '${produto}'`;
  
  let joinSuspeito = '';
  if (suspeitos === 'true'){
    joinSuspeito = `INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON I.IdItem = it.idItem and it.anomalo = 1`
  }

  const query = () => {
    return db.query([],`
      SELECT TOP(${topRank}) 
        CNPJEmitente, NomeEmitente,
        CNPJDestinatario, NomeDestinatario, MunicipioDestinatario,		   
        MAX(dhEmi) AS OcorrenciaMaisRecente,
        MIN(dhEmi) AS OcorrenciaMaisAntiga,
        SUM(ValorTotalItem) AS SomaTotalItens 
      FROM (
        SELECT
          CNPJEmitente, upper(NomeEmitente) as NomeEmitente,
          CNPJDestinatario,upper(NomeDestinatario) as NomeDestinatario, upper(R.Municipio) AS MunicipioDestinatario,		   
          NF.dhEmi AS dhEmi,
          ValorTotalItem
        FROM ${modelConfig.get('NOTAFISCAL')} NF
          INNER JOIN ${modelReceita.get('PJ')} R ON nf.CNPJDestinatario = R.CNPJ COLLATE Latin1_General_CI_AS
          INNER JOIN ${modelReceita.get('PJ')} R2 ON nf.CNPJEmitente = R2.CNPJ COLLATE Latin1_General_CI_AS
          INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} I ON NF.idnf = I.idnf
          ${joinSuspeito}
          ${where}
      ) T
      GROUP BY CNPJEmitente, NomeEmitente, CNPJDestinatario, NomeDestinatario, MunicipioDestinatario
      ORDER BY 8 DESC
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_top_fornecedores, rank: rank_top_fornecedores, grupo:grupo_top_fornecedores });
}

export const getVendasFornecedor = function(tipoProduto:any, dataIni:any, dataFim:any, periodo:any, cnpjDestinatario:any, cnpjEmitente:any, suspeitos:any, produto:any){

  const nomeFuncao = getNomeFuncao(1, 2);
  
  let medicamento = "SUBSTRING(NCM,1,4) IN ('3001','3002','3003','3004','3005','3006')";
  let roupa = "SUBSTRING(NCM,1,2) IN ('61','62','63','64')"
  let alimento = "SUBSTRING(NCM,1,2) IN ('02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22')"
  let where = `WHERE 1 = 1`;
  
  let tipoAlimento = [];

  if (tipoProduto && tipoProduto.indexOf("M") !== -1)
    tipoAlimento.push(medicamento)
  if (tipoProduto && tipoProduto.indexOf("V") !== -1)
    tipoAlimento.push(roupa)
  if (tipoProduto && tipoProduto.indexOf("A") !== -1)
    tipoAlimento.push(alimento)

  if (tipoAlimento.length > 0)
    where = `${where} AND (${tipoAlimento.join(' OR ')})`
  
  if (periodo)
    where =`${where} AND DATEDIFF(mm,nf.dhEmi,GETDATE()) <= ${periodo}`;
  else{
    if (dataIni && dataIni != 'null')
      where = ` ${where} AND nf.dhEmi >= '${dataIni}'`;
    if (dataFim && dataFim != 'null')
      where = ` ${where} AND nf.dhEmi <= '${dataFim}'`;
  }

  if (produto)
    where = ` ${where} AND i.NomeProduto = '${produto}'`;

  let joinSuspeito = '';
  if (suspeitos === 'true'){
    joinSuspeito = `INNER JOIN ${modelConfig.get('ITEMPRODUTOANOMALO')} IT ON I.IdItem = it.idItem and it.anomalo = 1`
  }

  const query = () => {
    return db.query([],`
        SELECT
          CNPJEmitente,
          CNPJDestinatario,
          NF.dhEmi AS DataEmissao,
          SUM(ValorTotalItem) AS SomaTotalItens
        FROM ${modelConfig.get('NOTAFISCAL')} NF          
          INNER JOIN ${modelConfig.get('ITEMNOTAFISCAL')} I ON NF.idnf = I.idnf
          ${joinSuspeito}
          ${where} AND CNPJEmitente = '${cnpjEmitente}' AND CNPJDestinatario = '${cnpjDestinatario}'
          GROUP BY CNPJEmitente, CNPJDestinatario, NF.dhEmi
        ORDER BY 3
      `);
  }
  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_top_fornecedores, rank: rank_top_fornecedores, grupo:grupo_top_fornecedores });
}

const fonte_nome_produtos = MODEL_PRIORITY['sefaz_nome_produtos'].fonte;
const rank_nome_produtos = MODEL_PRIORITY['sefaz_nome_produtos'].rank;
const grupo_nome_produtos = MODEL_PRIORITY['sefaz_nome_produtos'].grupo;

export const getProdutos = function(nome : any){
  const nomeFuncao = getNomeFuncao(1, 2);
  nome = toTextSearch(nome.split(' '));
  const query = () => {
    return db.query([],`
      SELECT DISTINCT TOP 100
      NomeProduto
      FROM ${modelConfig.get('ITEMNOTAFISCAL')}
      WHERE CONTAINS(NomeProduto, '${nome}')   
      `);
  }

  return mf.call(null, query, nomeFuncao, arguments, modelConfig, { fonte:fonte_nome_produtos, rank: rank_nome_produtos, grupo:grupo_nome_produtos });
}