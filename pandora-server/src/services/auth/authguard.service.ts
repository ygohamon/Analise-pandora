const { Crawler } = require('es6-crawler-detect/src');
import { Request, Response } from 'express';

import { API_CONFIG, API_CODES, API_MSGS, LOG_CODES, LOG_MSGS, LOG_SECOES, LOG_TIPOS } from '../../config';
import { NovoLog } from '../../schemas/log.schema';
import { criaRespostaAPI, getId_Token, logRequisicao, sha1 } from '../../utils';
import * as jwt from './jwt.service';

/**
 * Guard base para as rotas do sistema
 *
 * Ele recebe uma função que vai fazer a validação dos dados do
 * token, essa função deve retornar true ou false
 * @param _fn
 */
let GuardRotasBase = function(_fn) {
  let alwaysFalse = x => false;
  const fn_validacao = _fn || alwaysFalse;

  return function(req: Request, res: Response, next) {
    let token = req.body?.token || req.headers['token'] || req.headers['Authorization'] || req.headers['authorization'];
    let isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;

    if (isTest) {
      next();
    } else {
      if (token) {
        const { status, payload, error } = jwt.verify(token);

        // Token válido
        if (status) {
          // Aplica a validação _fn
          // Se der certo, libera o acesso
          if (fn_validacao(payload, req)) {
            next();
          } else {
            // Gera erro de acesso negado
            const log = new NovoLog({
              req,
              secao: LOG_SECOES.SISTEMA.NOME,
              code: API_CODES.CODE_ROTA_NAO_AUTORIZADA,
              item: LOG_TIPOS.TENTATIVA_CONSULTA_SEM_PERFIL,
              mensagem: API_MSGS.MSG_ROTA_NAO_AUTORIZADA,
            });
            logRequisicao(log).then(() =>
              res.status(403).send(criaRespostaAPI(API_CODES.CODE_ROTA_NAO_AUTORIZADA, API_MSGS.MSG_ROTA_NAO_AUTORIZADA))
            );
          }
        }
        // Token inválido
        else {
          const log = new NovoLog({
            req,
            secao: LOG_SECOES.SISTEMA.NOME,
            code: API_CODES.CODE_TOKEN_INVALIDO,
            mensagem: API_MSGS.MSG_TOKEN_INVALIDO,
          });
          logRequisicao(log).then(() => res.status(403).send(criaRespostaAPI(API_CODES.CODE_TOKEN_INVALIDO, API_MSGS.MSG_TOKEN_INVALIDO)));
        }
      } else {
        // Token inexistente (cliente não autenticado)
        const log = new NovoLog({
          req,
          secao: LOG_SECOES.SISTEMA.NOME,
          code: API_CODES.CODE_TOKEN_NAO_ENCONTRADO,
          mensagem: API_MSGS.MSG_TOKEN_NAO_ENCONTRADO,
        });
        logRequisicao(log, true).then(() =>
          res.status(401).send(criaRespostaAPI(API_CODES.CODE_TOKEN_NAO_ENCONTRADO, API_MSGS.MSG_TOKEN_NAO_ENCONTRADO))
        );
      }
    }
  };
};

/**
 *  Guard que valida o token recebido e garante ou não a passagem para a rota desejada.
 *  Garante acesso para qualquer usuário logado ao sistema.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasLogado = GuardRotasBase(x => true);

/**
 *  Guard que valida o token recebido e garante ou não a passagem para a rota desejada.
 *  Garante acesso para os usuários com perfil 'privado'.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasPerfilPrivado = GuardRotasBase(payload => payload.user.perfil === 'admin' || payload.user.perfil === 'privado');

/**
 *  Guard que valida o token recebido e garante ou não a passagem para a rota desejada.
 *  Garante acesso para os usuários com perfil 'admin'.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasPerfilAdmin = GuardRotasBase(payload => payload.user.perfil === 'admin');

/**
 *  Guard que valida o token recebido e garante ou não a passagem para a rota desejada.
 *  Garante acesso para os usuários que tenham o atributo 'operacoes'.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasOperacoes = GuardRotasBase(payload => payload.user.perfil === 'admin' || payload.user.operacoes);

/**
 *  Guard que valida o token recebido e garante ou não a passagem para a rota desejada.
 *  Garante acesso para os usuários que tenham o atributo 'operacoes'.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasMembro = GuardRotasBase(payload => payload.user.perfil === 'admin' || payload.user.membro);

/**
 * Guard que valida se o token recebido tem permissão ou não para acessar a rota
 * @param options
 */
export let ControleAcessoGuard = function(options) {
  const opts = options || {};

  /**
   * Valida se a sessao do usuario é a mesma garantida ao token.
   * Valida se o usuario dessa sessao tem permissao para acessar a determinada rota
   */
  return GuardRotasBase(
    (payload, req) =>
      payload.user.ss === req.session.id &&
      req.session.permissoes[opts.secao] &&
      req.session.permissoes[opts.secao].includes(opts.item)
  );
};

/**
 *  Guard que valida o hash 'hs' recebido e garante ou não a passagem para a rota desejada.
 *
 *  O hash 'hs' foi criado como mais uma camada de segurança ao sistema, impede que um atacante
 *  roube uma requisição genuína feita por um usuário e a replique para ter acesso ao sistema.
 *
 *  Ele é composto por um cálculo utilizando o ID do usuário, o User Agent da requisição e o tempo de quando
 *  ela foi criada.
 *
 *  Com o hash, toda requisição tem um tempo de vida definido através da variável API_CONFIG.CFG_TEMPO_VALIDADE_HASH.
 *
 * @param req
 * @param res
 * @param next
 */
export let GuardRotasChecaHash = function(req, res, next) {
  const hs = req.headers['hs'];
  // const isTest = (API_CONFIG.CFG_ENV === 'test' && req.query.test === 's') ? true : false;
  const isTest = API_CONFIG.CFG_ENV === 'test' ? true : false;

  if (isTest) {
    next();
  } else {
    if (hs) {
      const hash = hs.slice(0, 40);
      const ts = hs.slice(40, hs.length);

      let authHeader = req.headers['Authorization'] || req.headers['authorization'];
      let token = jwt.getTokenFromHeader(authHeader);

      const decoded = <any>jwt.decode(token);
      const id = getId_Token(token);
      const agent = req.headers['user-agent'];
      const contraHash = sha1(id + agent + ts);

      const deltats = Date.now() - parseInt(ts, 10); //  Converte ms pra s

      if (hash === contraHash && deltats < API_CONFIG.CFG_TEMPO_VALIDADE_HASH) {
        //if (hash === contraHash){
        next();
      } else {
        const log = new NovoLog({
          req,
          secao: LOG_SECOES.SISTEMA.NOME,
          code: API_CODES.CODE_HASH_INVALIDO,
          mensagem: API_MSGS.MSG_HASH_INVALIDO,
        });
        logRequisicao(log).then(() => res.status(403).send(criaRespostaAPI(API_CODES.CODE_HASH_INVALIDO, API_MSGS.MSG_HASH_INVALIDO)));
      }
    } else {
      const log = new NovoLog({
        req,
        secao: LOG_SECOES.SISTEMA.NOME,
        code: API_CODES.CODE_HASH_NAO_ENCONTRADO,
        mensagem: API_MSGS.MSG_HASH_NAO_ENCONTRADO,
      });
      logRequisicao(log).then(() =>
        res.status(403).send(criaRespostaAPI(API_CODES.CODE_HASH_NAO_ENCONTRADO, API_MSGS.MSG_HASH_NAO_ENCONTRADO))
      );
    }
  }
};

/**
 *  Guard que detecta se a requisição veio de um bot.
 *
 *  Se detectar, retorna um código de acesso negado.
 */
export let GuardBot = function(req: Request, res: Response, next) {
  const isTest = API_CONFIG.CFG_ENV === 'test' ? true : false;

  if (isTest) {
    next();
  } else {
    const analise = new Crawler(req);

    if (analise.isCrawler(req.headers['user-agent'])) {
      const log = new NovoLog({
        req,
        secao: LOG_SECOES.SISTEMA.NOME,
        code: API_CODES.CODE_BOT_DETECTADO,
        mensagem: API_MSGS.MSG_BOT_DETECTADO,
      });
      logRequisicao(log).then(() =>
        res.status(403).send(criaRespostaAPI(API_CODES.CODE_ROTA_NAO_AUTORIZADA, API_MSGS.MSG_ROTA_NAO_AUTORIZADA))
      );
    } else {
      next();
    }
  }
};

/**
 * Middleware que retorna a chamada do metodo http OPTIONS
 */
export let GuardOptions = function(req: Request, res: Response, next) {
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
  } else {
    next();
  }
};
