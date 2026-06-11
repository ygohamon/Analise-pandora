import * as operacaoModel from './../../models/operacao';

import {
  filtraNaoEncontrados,
  limpaNumero,
  filtraNulos,
  toTextSearch,
  trataRequisicaNome,
} from './../../utils';

export let procuraInvestigadoCPF = function(cpf: string) {
  cpf = limpaNumero(cpf);

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesCPF_BD_GAECO(cpf),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};

export let procuraInvestigadoNome = function(nome: string) {
  const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesNome_BD_GAECO(nomeTextSearch),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};

export let procuraInvestigadoAlcunha = function(alcunha: string) {

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesAlcunha_BD_GAECO(alcunha),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};


export let procuraInvestigadoCNPJ = function(cnpj: string) {
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesCNPJ_BD_GAECO(cnpj),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};


export let procuraInvestigadoRazaoSocial = function(razaoSocial: string) {
  const nomeTextSearch = toTextSearch(trataRequisicaNome(razaoSocial));

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesRazaoSocial_BD_GAECO(nomeTextSearch),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};

export let procuraInvestigadoOperacao = function(operacao: string) {

  return Promise.all([
    operacaoModel.getInvestigadosOperacoesPFOperacao_BD_GAECO(operacao),
    operacaoModel.getInvestigadosOperacoesPJOperacao_BD_GAECO(operacao),
  ])
    .then(dados => filtraNulos(dados))
    .then(dados => filtraNaoEncontrados(dados));
};
