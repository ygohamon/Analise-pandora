import * as contratoModel from '../../models/contrato';
import { filtraNaoEncontrados, limpaNumero } from './../../utils';

export let procuraDadosContratosCNPJ = function (cnpj: string){
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    contratoModel.getContratosEstadualDetalhadoCNPJ(cnpj),
    contratoModel.getContratosMunicipalDetalhadoCNPJ(cnpj),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosContratosCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    contratoModel.getContratosEstadualDetalhadoCPF(cpf),
    contratoModel.getContratosMunicipalDetalhadoCPF(cpf),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosContratosNuLicitacao = function (nulicitacao: string){

  return Promise.all([
    contratoModel.getContratosEstadualDetalhadoNuLicitacao(nulicitacao),
    contratoModel.getContratosMunicipalDetalhadoNuLicitacao(nulicitacao),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosContratosNuContrato = function (nucontrato: string){

  return Promise.all([
    contratoModel.getContratosEstadualDetalhadoNuContrato(nucontrato),
    contratoModel.getContratosMunicipalDetalhadoNuContrato(nucontrato),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
