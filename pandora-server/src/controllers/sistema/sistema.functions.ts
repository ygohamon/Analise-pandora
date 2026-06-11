import * as usuarioModel from '../../models/usuario';

import {
    filtraNaoEncontrados,
    print,
    criaRespostaAPI,
    logRequisicao,
    atob, first
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_CODES,
    LOG_SECOES
} from '../../config';

import { NovoUsuario } from '../../models/schemas';
import { Email } from '../../schemas/email.schema';
import { mailer } from '../../services/mail.service';
import { cache as apicache } from '../../services/apicache.service';
import { cache as modelcache  } from '../../services/cache.service';
import { db } from '../../services/db.service';

import {
  getLimitePorIPInfo,
  removeLimiteIP,
  getLimitePorUsuarioInfo,
  removeLimiteUsuario,
  getEstouroLimiteIPHistorico,
  getLimiteAcessoIPBlacklist,
  getEstouroLimiteUsuarioHistorico
} from '../../services/auth/limiters.service';



export let procuraListaPermissaoUsuario = function (encrypt=true){

    return usuarioModel.getListaPermissoesUsuario_BD_Pandora()
            .then(permissoes => {
                if (encrypt) {
                    const u = new NovoUsuario({});
                    u.setPermissoes(permissoes);
                    return u.getPermissoesCrypt();
                } else {
                    return permissoes;
                }
            })
            .then(permissoes => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, permissoes))
}

export let procuraListaPerfis = function (){

    return usuarioModel.getListaPerfisUsuario_BD_Pandora()
        .then(dados => dados.map(d => d.perfil))
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraListaAcessos = function (){

    return usuarioModel.getListaAcessosUsuario_BD_Pandora()
        .then(dados => dados.map(d => d.acesso))
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraListaGrupos = function (){

    return usuarioModel.getListaGruposUsuario_BD_Pandora()
        .then(dados => dados.map(d => d.grupo))
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}


/**
 * MailService
 */


export let enviaEmail = function (email: Email){

  const isBroadcast = first(email?.to)?.email === 'broadcast';

  if(!isBroadcast) {
    const {to, ...resto} = email;
    const novoEmail = Object.assign(resto, {to: email.to.map((d:any) => d.email)})

    return mailer.send(novoEmail)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))

  } else {
    // Envia para todos os usuários
    return usuarioModel.getUsuariosAtivosMailer()
      .then(dados => dados?.resultado?.dados)
      .then(dados => {
        const emails = dados.map(d => d.email).filter(d => d !== null);
        const {to, ...resto} = email;
        const novoEmail = Object.assign(resto, {to: emails});

        return mailer.send(novoEmail)
      })
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
  }

}

export let procuraMailInfo = function () {

  return mailer.getInfo()
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}


/**
 * CacheService
 */


export let procuraModelCacheInfo = function (){

    return modelcache.getInfo()
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let limpaModelCache = function (key){

    return modelcache.clear(key)
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

/**
 * APICache
 */
export let procuraAPICachePerformance = function (){

    return apicache.getPerformance()
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraAPICacheInfo = function (){

    return apicache.getInfo()
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let limpaAPICache = function (key){

    return apicache.clear(key)
        .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

/**
 * DBService
 */

export let procuraDBInfo = function (){

  return db.getInfo()
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

/**
 * LimiteAcessoService
 */

export let procuraLimiteAcessoIPInfo = function (chave){

  return getLimitePorIPInfo(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraLimiteAcessoIPHistorico = function (chave){

  return getEstouroLimiteIPHistorico(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraLimiteAcessoIPBlacklist = function (){

  return getLimiteAcessoIPBlacklist()
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let removeLimiteAcessoIP = function (chave){

  return removeLimiteIP(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraLimiteAcessoUsuarioInfo = function (chave){

  return getLimitePorUsuarioInfo(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let procuraLimiteAcessoUsuarioHistorico = function (chave){

  return getEstouroLimiteUsuarioHistorico(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}

export let removeLimiteAcessoUsuario = function (chave){

  return removeLimiteUsuario(chave)
      .then(dados => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, dados))
}
