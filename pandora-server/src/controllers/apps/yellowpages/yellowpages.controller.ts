import { Request, Response } from 'express';
import { NovoLog } from '../../../schemas/log.schema';

import {
  criaRespostaAPI,
  controllerFactory as cf,
  controllerError,
  getNomeFuncao,
  validaCNPJ,
} from '../../../utils';

import {
  API_CODES,
  API_MSGS,
  LOG_SECOES,
  LOG_TIPOS_BUSCA
} from '../../../config';

import {
  procuraDadosYellowPagesCNPJ,
  procuraDadosYellowPagesRazaoSocial
} from './yellowpages.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.YELLOWPAGES.NOME;
const chaves = LOG_SECOES.APPS.ITENS.YELLOWPAGES.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let controllerDadosYellowPagesRazaoSocial = function (req : Request, res : Response){
  const razaoSocial = req.params.razaosocial;
  const nomeFuncao = getNomeFuncao(1,1);

  if (!!razaoSocial) {
    const log = new NovoLog({req, secao, item, chave: chaves.RAZAOSOCIAL, valor: razaoSocial, tipo: tipos_busca.DETALHADA})

    cf(log, procuraDadosYellowPagesRazaoSocial, razaoSocial)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));

  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let controllerDadosYellowPagesCNPJ = function (req : Request, res : Response){
    const cnpj = req.params.cnpj;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)) {
      const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA})

      cf(log, procuraDadosYellowPagesCNPJ, cnpj)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));

    } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
