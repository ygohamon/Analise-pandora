import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
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
} from './../../config';

import {
  procuraEmpenhosCNPJ,
  procuraEmpenhosCPF,
} from './empenhos.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.EMPENHO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.EMPENHO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getEmpenhosCNPJ = function (req: Request, res: Response){
  let cnpj = req.params.cnpj;
  let processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if(validaCNPJ(cnpj)){
    const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

    cf(log, procuraEmpenhosCNPJ, cnpj)
      .then(empenhos => res.status(200).send(empenhos))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getEmpenhosCPF = function (req: Request, res: Response){
  const cpf = req.params.cpf;
  const processo = req.query.processo;
  const nomeFuncao = getNomeFuncao(1,1);

  if(validaCPF(cpf)){
    const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

    cf(log, procuraEmpenhosCPF, cpf)
      .then(empenhos => res.status(200).send(empenhos))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
