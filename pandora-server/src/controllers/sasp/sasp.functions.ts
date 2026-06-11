import { LOG_SECOES } from '../../config';
import * as model from '../../models/sasp';

import {
  filtraNaoEncontrados,
  filtraNulos,
  limpaNumero,
  registraNaoEncontrados,
} from './../../utils';

export let procuraSASCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    model.getInvestigadosPessoaCPF(cpf),
    model.getInvestigadosVinculoCPF(cpf),
    model.getInvestigadosFatosCPF(cpf),
    model.getInvestigadosAbordagensCPF(cpf),
    model.getInvestigadosOcorrenciaCPF(cpf),
  ])
  .then(interno => filtraNulos(interno))
  .then(interno => filtraNaoEncontrados(interno))
  .then(interno => registraNaoEncontrados(interno, LOG_SECOES.PESQUISA.ITENS.SASP.CHAVES.CPF, LOG_SECOES.PESQUISA.ITENS.SASP.CHAVES.CPF, cpf));
}

export let procuraSASPNome = function (nome: string){
  return Promise.all([
    model.getInvestigadosPessoaNome(nome),
    model.getInvestigadosVinculoNome(nome),
    model.getInvestigadosFatosNome(nome),
    model.getInvestigadosAbordagensNome(nome),
    model.getInvestigadosOcorrenciaNome(nome),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraSASPRG = function (rg: string){
  rg = limpaNumero(rg);

  return Promise.all([
    model.getInvestigadosPessoaRG(rg),
    model.getInvestigadosVinculoRG(rg),
    model.getInvestigadosFatosRG(rg),
    model.getInvestigadosAbordagensRG(rg),
    model.getInvestigadosOcorrenciaRG(rg),
  ])
  .then(dados => filtraNaoEncontrados(dados))
}

export let procuraSASPAlcunha = function (alcunha: string){
  return Promise.all([
    model.getInvestigadosPessoaAlcunha(alcunha),
    model.getInvestigadosVinculoAlcunha(alcunha),
    model.getInvestigadosFatosAlcunha(alcunha),
    model.getInvestigadosAbordagensAlcunha(alcunha),
    model.getInvestigadosOcorrenciaAlcunha(alcunha),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}