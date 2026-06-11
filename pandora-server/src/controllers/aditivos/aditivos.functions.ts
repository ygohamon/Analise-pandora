import * as aditivoModel from '../../models/aditivo';
import { filtraNaoEncontrados, limpaNumero } from './../../utils';

export let procuraDadosAditivosCNPJ = function (cnpj: string){
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    aditivoModel.getAditivosEstadualDetalhadoCNPJ(cnpj),
    aditivoModel.getAditivosMunicipalDetalhadoCNPJ(cnpj),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosAditivosCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    aditivoModel.getAditivosEstadualDetalhadoCPF(cpf),
    aditivoModel.getAditivosMunicipalDetalhadoCPF(cpf),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosAditivosNuLicitacao = function (nulicitacao: string){

  return Promise.all([
    aditivoModel.getAditivosEstadualDetalhadoNuLicitacao(nulicitacao),
    aditivoModel.getAditivosMunicipalDetalhadoNuLicitacao(nulicitacao),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
