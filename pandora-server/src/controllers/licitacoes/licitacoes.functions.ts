import * as licitacaoModel from '../../models/licitacao';
import { filtraNaoEncontrados, limpaNumero } from './../../utils';

export let procuraDadosLicitacoesCNPJ = function (cnpj: string){
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    licitacaoModel.getLicitacoesEstadualDetalhadoCNPJ(cnpj),
    licitacaoModel.getLicitacoesMunicipalDetalhadoCNPJ(cnpj),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosLicitacoesCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    licitacaoModel.getLicitacoesEstadualDetalhadoCPF(cpf),
    licitacaoModel.getLicitacoesMunicipalDetalhadoCPF(cpf),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosLicitacoesDados = function (cdugestora: string, nulicitacao: string, cdmdlicitacao: string){

  return Promise.all([
    licitacaoModel.getLicitacoesEstadualDetalhadoDados(cdugestora, nulicitacao, cdmdlicitacao),
    licitacaoModel.getLicitacoesMunicipalDetalhadoDados(cdugestora, nulicitacao, cdmdlicitacao),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
