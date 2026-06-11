import {
    Request,
    Response
} from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
  criaRespostaAPI,
  controllerFactory as cf,
  validaCPF,
  controllerError,
  getNomeFuncao,
  validaCNPJ,
  trataRequisicaNome,
} from './../../utils';

import {
  API_CODES,
  API_MSGS,
  LOG_SECOES,
  LOG_TIPOS_BUSCA
} from './../../config';

import {
  procuraInvestigadoCNPJ,
  procuraInvestigadoCPF,
  procuraInvestigadoOperacao,
  procuraInvestigadoNome,
  procuraInvestigadoRazaoSocial,
  procuraInvestigadoAlcunha,
} from './investigados.functions';

const secao     = LOG_SECOES.PESQUISA.NOME;
const item      = LOG_SECOES.PESQUISA.ITENS.INVESTIGADO.NOME;
const chaves    = LOG_SECOES.PESQUISA.ITENS.INVESTIGADO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getInvestigadoCPF = function (req : Request, res : Response){
  let cpf = req.params.cpf;
  let processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (validaCPF(cpf)){
    const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoCPF, cpf)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getInvestigadoNome = function (req : Request, res : Response){
  let nome = req.params.nome;
  let nomeArray = trataRequisicaNome(nome);
  let processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (nomeArray.length < 2){
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
  }else{
    const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoNome, nome)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao))
  }
}

export let getInvestigadoAlcunha = function (req : Request, res : Response){
  let alcunha = req.params.alcunha;
  let processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (alcunha.length < 1){
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  } else  {
    const log = new NovoLog({req, secao, item, chave: chaves.ALCUNHA, valor: alcunha, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoAlcunha, alcunha)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao))
  }
}

export let getInvestigadoCNPJ = function (req : Request, res : Response){
  let cnpj         = req.params.cnpj;
  let processo     = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (validaCNPJ(cnpj)){
    const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoCNPJ, cnpj)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getInvestigadoRazaoSocial = function (req : Request, res : Response){
  let razaosocial = req.params.razaosocial;
  let nomeArray = trataRequisicaNome(razaosocial);
  let processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (nomeArray.length < 2){
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
  }else{
    const log = new NovoLog({req, secao, item, chave: chaves.RAZAOSOCIAL, valor: razaosocial, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoRazaoSocial, razaosocial)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao))
  }
}

export let getInvestigadoOperacao = function (req : Request, res : Response){
  let operacao         = req.params.operacao;
  let processo     = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if (operacao.length){
    const log = new NovoLog({req, secao, item, chave: chaves.OPERACAO, valor: operacao, tipo: tipos_busca.SIMPLIFICADA, processo})

    cf(log, procuraInvestigadoOperacao, operacao)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
