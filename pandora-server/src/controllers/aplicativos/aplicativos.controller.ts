import { Request, Response } from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
  criaRespostaAPI,
  getId_Token,
  logRequisicao,
  getNomeFuncao,
  controllerError,
  agrupaEFiltraDuplicados
} from '../../utils';

import { API_CODES, API_MSGS, LOG_MSGS, LOG_SECOES, LOG_TIPOS_BUSCA } from '../../config';

import { criarApp, listarApps, atualizarApp  } from './aplicativos.functions';

const secao = LOG_SECOES.SISTEMA.NOME;
const item = LOG_SECOES.SISTEMA.ITENS.USUARIO.NOME;
const chaves = LOG_SECOES.SISTEMA.ITENS.USUARIO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let criar = function(req: Request, res: Response){

  let user_token = getId_Token(req.headers['authorization']);
  let id = req.params.id;
  let dados = req.body;

  const nomeFuncao = getNomeFuncao(1,1);

  if (dados) {
    const mensagem = LOG_MSGS.USUARIO_GET_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => criarApp(dados))
      .then(result => res.status(200).send(result))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let atualizar = function(req: Request, res: Response) {

  let user_token = getId_Token(req.headers['authorization']);
  let id = req.params.id;
  let dados = req.body;

  const nomeFuncao = getNomeFuncao(1,1);

  if (dados) {
    const mensagem = LOG_MSGS.USUARIO_GET_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => atualizarApp(dados))
      .then(result => res.status(200).send(result))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getApps = function(req: Request, res:Response) {
  let { processo } = req.body;
  const nomeFuncao = getNomeFuncao(1, 1);
  const log = new NovoLog({req, secao, item, tipo: tipos_busca.SIMPLIFICADA, processo});

  logRequisicao(log)
    .then(() => listarApps())
    .then(orcrins => agrupaEFiltraDuplicados(orcrins))
    .then(orcrins => res.status(200).send(orcrins))
    .catch(error => controllerError(res, error, nomeFuncao));
}
