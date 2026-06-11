import {
    Request,
    Response
} from 'express';

import {
    NovoLog
} from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    logRequisicao,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    API_CONFIG,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES
} from '../../config';

import {
    procuraListaPermissaoUsuario,
    procuraListaPerfis,
    procuraListaAcessos,
    procuraListaGrupos,
    enviaEmail,
    procuraAPICachePerformance,
    limpaAPICache,
    procuraAPICacheInfo,
    procuraDBInfo,
    procuraModelCacheInfo,
    limpaModelCache,
    procuraMailInfo,
    procuraLimiteAcessoIPInfo,
    procuraLimiteAcessoUsuarioInfo,
    removeLimiteAcessoIP,
    removeLimiteAcessoUsuario,
    procuraLimiteAcessoIPHistorico,
    procuraLimiteAcessoIPBlacklist,
    procuraLimiteAcessoUsuarioHistorico
} from './sistema.functions';

const secao  = LOG_SECOES.SISTEMA.NOME;
const item   = LOG_SECOES.SISTEMA.ITENS.USUARIO.NOME;
const chaves = LOG_SECOES.SISTEMA.ITENS.USUARIO.CHAVES;
// const tipos_busca = LOG_TIPOS_BUSCA;

export let getListaPermissoes = function (req : Request, res : Response) {

    const mensagem = LOG_MSGS.USUARIO_LISTA_CONTROLE_ACESSO;
    const log = new NovoLog({req, secao, item, mensagem});
    const nomeFuncao = getNomeFuncao(1,1);

    logRequisicao(log)
        .then(() => procuraListaPermissaoUsuario(false))
        .then(acesso => res.status(200).send(acesso))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let getListaPerfis = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraListaPerfis()
        .then(perfis => res.status(200).send(perfis))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let getListaAcessos = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraListaAcessos()
        .then(acessos => res.status(200).send(acessos))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let getListaGrupos = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraListaGrupos()
        .then(acessos => res.status(200).send(acessos))
        .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * EmailService
 */
export let postEnviarEmail = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);
    const {email} = req.body;

    enviaEmail(email)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let getMailInfo = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraMailInfo()
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * ModelCacheService
 */
export let getModelCacheInfo = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraModelCacheInfo()
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let clearModelCache = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);
    const chave = req.params.key;

    limpaModelCache(chave)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * APICacheService
 */
export let getAPICachePerformance = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraAPICachePerformance()
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let getAPICacheInfo = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);

    procuraAPICacheInfo()
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let clearAPICache = function (req : Request, res : Response) {
    const nomeFuncao = getNomeFuncao(1,1);
    const chave = req.params.key;

    limpaAPICache(chave)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * DBService
 */
export let getDBServiceInfo = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);

  procuraDBInfo()
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * LimiteAcessoService
 */
export let getLimiteAcessoIPInfo = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  procuraLimiteAcessoIPInfo(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let getLimiteAcessoIPHistorico = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  procuraLimiteAcessoIPHistorico(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let getLimiteAcessoIPBlacklist = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  procuraLimiteAcessoIPBlacklist()
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let clearLimiteAcessoIP = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  removeLimiteAcessoIP(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let getLimiteAcessoUsuarioInfo = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  procuraLimiteAcessoUsuarioInfo(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let getLimiteAcessoUsuarioHistorico = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  procuraLimiteAcessoUsuarioHistorico(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}

export let clearLimiteAcessoUsuario = function (req : Request, res : Response) {
  const nomeFuncao = getNomeFuncao(1,1);
  const chave = req.params.key;

  removeLimiteAcessoUsuario(chave)
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}
