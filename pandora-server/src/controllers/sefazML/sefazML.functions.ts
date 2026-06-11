import * as sefazML from '../../models/_apps/sefazML';
import * as enderecoModel from '../../models/endereco';
import * as utilsModel from '../../models/utils/utils.model';

import {
    filtraNaoEncontrados,
    flat
} from '../../utils';

export let getItemDetalhado = function(idItem : any){
  return Promise.all([
    sefazML.getOutrosItensNF(idItem),
    sefazML.getItensDoProduto(idItem),
    sefazML.getItemDetalhado(idItem),
    sefazML.getItensDiscrepantesMesmaEmpresaDestinatarioItem(idItem),    
    enderecoModel.getEnderecoItemNotaFiscal_BD_Receita(idItem).then(end => utilsModel.getGeoCoordenadasGrupoCustomizado(end, "fornecedor")),
    enderecoModel.getEnderecosDestinatariosItemNotaFiscal_BD_Receita(idItem).then(ends => utilsModel.getGeoCoordenadasGrupoCustomizado(ends, "destinatarios"))
  ])
    .then(dados => flat(dados))
}

export let getItensAnomalos = function(municipio : string, cnpjEmitente:any, cnpjDestinatario:any, dtInicio:any, dtFim:any, produto:any){
  return Promise.all([
    sefazML.getItensAnomalos(municipio, cnpjEmitente, cnpjDestinatario, dtInicio, dtFim, produto)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let getTopFornecedores = function(top : any, tipoProduto:any, dataIni:any, dataFim:any, periodo:any, cnpjDestinatario:any, municipioDestinatario:any, suspeitos:any, produto:any){
  return Promise.all([
    sefazML.getTopFornecedores(top, tipoProduto, dataIni, dataFim, periodo, cnpjDestinatario, municipioDestinatario, suspeitos, produto)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export const getVendasFornecedor = function(tipoProduto:any, dataIni:any, dataFim:any, periodo:any, cnpjDestinatario:any, cnpjEmitente:any, suspeitos:any, produto:any){
  return Promise.all([
    sefazML.getVendasFornecedor(tipoProduto, dataIni, dataFim, periodo, cnpjDestinatario, cnpjEmitente, suspeitos, produto)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export const getProdutos = function(nomeProduto:any){
  return Promise.all([
    sefazML.getProdutos(nomeProduto)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}