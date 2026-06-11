import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
  procuraDadosAditivosCNPJ,
  procuraDadosAditivosCPF,
  procuraDadosAditivosNuLicitacao,
} from './aditivos.functions';

import {
    criaRespostaAPI,
    print,
    validaCNPJ,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
    validaCPF,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';


const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.LICITACAO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.LICITACAO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getAditivosCNPJ = function (req: Request, res: Response){
  const cnpj       = req.params.cnpj;
  const processo   = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if(validaCNPJ(cnpj)){
    const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

    cf(log, procuraDadosAditivosCNPJ, cnpj)
      .then(aditivos => res.status(200).send(aditivos))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getAditivosCPF = function (req: Request, res: Response){
  const cpf        = req.params.cpf;
  const processo   = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if(validaCPF(cpf)){
    const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

    cf(log, procuraDadosAditivosCPF, cpf)
      .then(aditivos => res.status(200).send(aditivos))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getAditivosNuLicitacao = function (req: Request, res: Response){

  const nuLicitacao = req.params.nulicitacao;
  const processo = req.query.processo;

  const cdUgestora = req.query.cdugestora;
  const cdMdLicitacao = req.query.cdmdlicitacao;

  const nomeFuncao = getNomeFuncao(1,1);

  if(cdUgestora && nuLicitacao && cdMdLicitacao){
    const valor = `${cdUgestora} - ${nuLicitacao} - ${cdMdLicitacao}`;
    const log = new NovoLog({req, secao, item, chave: chaves.DADOSLICITACAO, valor, tipo: tipos_busca.DETALHADA, processo})

    cf(log, procuraDadosAditivosNuLicitacao, nuLicitacao)
      .then(aditivos => res.status(200).send(aditivos))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
