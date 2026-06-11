import * as model from '../../models/prontuario';

import {
  filtraNaoEncontrados,
  limpaNumero,
} from './../../utils';

export let procuraProntuarioCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    model.getProntuarioCPF_LINCE(cpf),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraProntuarioNome = function (nome: string){
  return Promise.all([
    model.getProntuarioNome_LINCE(nome),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraProntuarioAlcunha = function (nome: string){
  return Promise.all([
    model.getProntuarioAlcunha_LINCE(nome),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraProntuarioRG = function (rg: string){
  rg = limpaNumero(rg);

  return Promise.all([
    model.getProntuarioRG_LINCE(rg),
  ])
  .then(dados => filtraNaoEncontrados(dados))
}