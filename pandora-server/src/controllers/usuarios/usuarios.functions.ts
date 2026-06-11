import { Request, Response } from 'express';
import * as jwt from '../../services/auth/jwt.service';

import * as usuarioModel from '../../models/usuario';

import { filtraNaoEncontrados, print, criaRespostaAPI, logRequisicao, getNomeFuncao, controllerError } from './../../utils';
import { API_CODES, API_MSGS, LOG_CODES, LOG_SECOES } from '../../config';
import { NovoUsuario } from '../../models/schemas';
import { autenticaUsuario } from '../../services/auth/auth.service';
import { NovoLog } from '../../schemas/log.schema';

const secao = LOG_SECOES.SISTEMA.NOME;
const item = LOG_SECOES.SISTEMA.ITENS.USUARIO.NOME;
// const chaves = LOG_SECOES.SISTEMA.ITENS.CONDENACAO.CHAVES;
// const tipos_busca = LOG_TIPOS_BUSCA;

export let procuraUsuarios = function() {
  return Promise.all([usuarioModel.getUsuarios()]).then(dados => filtraNaoEncontrados(dados));
};

export let procuraUsuariosParcial = function(loginParcial) {
  return Promise.all([usuarioModel.getUsuarios(loginParcial)]).then(dados => filtraNaoEncontrados(dados));
};

export let procuraUsuarioMe = function(id) {
  return Promise.all([usuarioModel.getUsuarioID_BD_Pandora(null, id)]).then(dados => filtraNaoEncontrados(dados));
};

export let procuraPermissaoUsuario = function(id, encrypt = true) {
  return usuarioModel
    .getPermissoesUsuario_BD_Pandora(null, id)
    .then(permissoes => {
      if (encrypt) {
        const u = new NovoUsuario({});
        u.setPermissoes(permissoes);
        return u.getPermissoesCrypt();
      } else {
        return permissoes;
      }
    })
    .then(permissoes => criaRespostaAPI(API_CODES.CODE_SUCESSO, null, permissoes));
};

let montaUsuario = function(login: string) {
  let usuario: NovoUsuario;

  return usuarioModel
    .getUsuario_BD_Pandora(login)
    .then(u => {
      usuario = u;
      return u;
    })
    .then(() => usuarioModel.getPermissoesUsuario_BD_Pandora(login))
    .then(permissoes => usuario.setPermissoes(permissoes))
    .then(() => usuario);

  // .then(usuario => )
};

/**
 * Cria uma nova sessão para o usuário.
 *
 * @param usuario
 * @param req
 */
let criaSessaoUsuario = function(usuario: NovoUsuario, req: Request) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(err => {
      if (err) {
        reject(null);
      }

      // 1 - Captura as permissoes do usuario
      // 2 - Seta as permissões dele na sessao
      // 3 - Retorna o usuario

      req.session['idUsuario'] = usuario.id;
      req.session['permissoes'] = usuario.getPermissoes();
      resolve(usuario);
    });
  });
};

export let verificaUsuario = function(req: Request, res: Response, usuario: NovoUsuario) {
  let usuarioEncontrado;
  const nomeFuncao = getNomeFuncao(1,1);

  return usuarioModel
    .checaStatusLogin_BD_Pandora(usuario.login)
    .then(r => autenticaUsuario(usuario, r.dados.acesso))
    .then(() => montaUsuario(usuario.login))
    .then(usuarioEncontrado => criaSessaoUsuario(usuarioEncontrado, req))
    .then((usuarioEncontrado: NovoUsuario) => {
      const mensagem = API_MSGS.MSG_LOGIN_SUCESSO;
      const code = API_CODES.CODE_SUCESSO;
      const log = new NovoLog({ req, secao, item, code, usuario: usuario.login, tipo: LOG_CODES.TIPO_LOGIN, mensagem });

      let token = usuarioEncontrado.toToken();
      token.ss = req.session.id;

      logRequisicao(log, true).then(() =>
        res.status(200).json(criaRespostaAPI(API_CODES.CODE_SUCESSO, API_MSGS.MSG_LOGIN_SUCESSO, { token: jwt.create(token) }))
      );
    })
    .catch(error => {
      if (error.status && error.status === API_CODES.CODE_FALHA_LOGIN) {
        const mensagem = error.msg;
        const code = API_CODES.CODE_FALHA_LOGIN;
        const log = new NovoLog({ req, secao, item, code, usuario: usuario.login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

        logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, error.msg)));
      } else {
        const mensagem = error.msg;
        const code = API_CODES.CODE_ERRO_500;
        const log = new NovoLog({ req, secao, item, code, usuario: usuario.login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

        logRequisicao(log, true).then(() => controllerError(res, error, nomeFuncao));
      }
    });
};
