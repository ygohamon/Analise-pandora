import { Request, Response } from 'express';

import { NovoUsuario } from '../../models/schemas';
import * as usuarioModel from '../../models/usuario';

import { NovoLog } from '../../schemas/log.schema';

import {
  criaRespostaAPI,
  controllerFactory as cf,
  validaTrocaSenha,
  validaGoogleRecaptcha,
  getId_Token,
  logRequisicao,
  gerarSenha,
  getNomeFuncao,
  controllerError,
} from '../../utils';

import { API_CODES, API_MSGS, API_CONFIG, LOG_CODES, LOG_MSGS, LOG_SECOES } from '../../config';

import { procuraUsuarios, procuraUsuarioMe, procuraPermissaoUsuario, verificaUsuario, procuraUsuariosParcial } from './usuarios.functions';
import { validaApp } from '../aplicativos/aplicativos.functions';

const secao = LOG_SECOES.SISTEMA.NOME;
const item = LOG_SECOES.SISTEMA.ITENS.USUARIO.NOME;
const chaves = LOG_SECOES.SISTEMA.ITENS.USUARIO.CHAVES;
// const tipos_busca = LOG_TIPOS_BUSCA;

/**
 * Função que realiza a verificação dos parametros 'login' e 'senha'
 * enviados através da rota /login
 *
 * Retorna um token contendo informações do usuário.
 *
 * @param req
 * @param res
 */
export let login = function(req: Request, res: Response) {
  const { login, senha, recaptcha } = req.body;
  const isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;

  if (login && senha) {
    if (recaptcha || isTest) {
      validaGoogleRecaptcha(recaptcha, isTest)
        .then(valido => {
          if (valido || isTest) {
            const usuario = new NovoUsuario({ login, senha });
            return verificaUsuario(req, res, usuario);
          } else {
            const mensagem = 'Não foi possível validar o recaptcha.';
            const code = API_CODES.CODE_RECAPTCHA_INVALIDO;
            const log = new NovoLog({ req, secao, item, code, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

            logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, mensagem)));
          }
        })
        .catch(error => {
          const mensagem = 'Erro na validação do recaptcha.';
          const code = API_CODES.CODE_RECAPTCHA_INVALIDO;
          const log = new NovoLog({ req, secao, item, code, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

          logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, mensagem)));
        });
    } else {
      const mensagem = 'Valor para validação do recaptcha não encontrado.';
      const code = API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO;
      const log = new NovoLog({ req, secao, code, item, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

      logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO, mensagem)));
    }
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let loginByApp = function(req: Request, res: Response) {
  const { login, senha, tokenApp } = req.body;
  const isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;

  if (login && senha) {
    if (tokenApp || isTest) {
      validaApp(tokenApp)
        .then(valido => {
          if (valido || isTest) {
            const usuario = new NovoUsuario({ login, senha });
            return verificaUsuario(req, res, usuario);
          } else {
            const mensagem = 'Não foi possível validar o aplicativo.';
            const code = API_CODES.CODE_APLICATIVO_NAOAUTORIZADO;
            const log = new NovoLog({ req, secao, item, code, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

            logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_APLICATIVO_NAOAUTORIZADO, mensagem)));
          }
        })
        .catch(error => {
          const mensagem = 'Erro na validação do aplicativo.';
          const code = API_CODES.CODE_APLICATIVO_NAOAUTORIZADO;
          const log = new NovoLog({ req, secao, item, code, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

          logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_APLICATIVO_NAOAUTORIZADO, mensagem)));
        });
    } else {
      const mensagem = 'token para validação do aplicativo não encontrado.';
      const code = API_CODES.CODE_APP_NAO_ENCONTRADO;
      const log = new NovoLog({ req, secao, code, item, usuario: login, tipo: LOG_CODES.TIPO_TENTATIVA_LOGIN, mensagem });

      logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_APP_NAO_ENCONTRADO, mensagem)));
    }
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let listaUsuarios = function(req: Request, res: Response) {
  const mensagem = LOG_MSGS.USUARIO_LISTA_USUARIOS;
  const log = new NovoLog({ req, secao, item, mensagem });
  const nomeFuncao = getNomeFuncao(1,1);

  cf(log, procuraUsuarios)
    .then(usuarios => res.status(200).send(usuarios))
    .catch(error => controllerError(res, error, nomeFuncao));
};

export let listaUsuariosParcial = function(req: Request, res: Response) {
  const login = req.params.login;
  const mensagem = LOG_MSGS.USUARIO_LISTA_USUARIOS;

  if (login.length > 2) {
    const log = new NovoLog({ req, secao, item, mensagem, valor: login });
    const nomeFuncao = getNomeFuncao(1,1);

    cf(log, procuraUsuariosParcial, login)
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let getUsuarioMe = function(req: Request, res: Response) {
  let id = getId_Token(req.headers['authorization']);
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_GET_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    cf(log, procuraUsuarioMe, id)
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let getPermissoesMe = function(req: Request, res: Response) {
  let id = getId_Token(req.headers['authorization']);
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_GET_PERMISSAO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => procuraPermissaoUsuario(id))
      .then(permissoes => res.status(200).send(permissoes))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let getUsuario = function(req: Request, res: Response) {
  let id = parseInt(req.params.id, 10);
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_GET_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => usuarioModel.getUsuarioID_BD_Pandora(null, id))
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let updateUsuario = function(req: Request, res: Response) {
  let id = req.params.id;
  let dados = req.body;
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_ATUALIZA_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    let novoUsuario = new NovoUsuario(dados);

    logRequisicao(log)
      .then(() => usuarioModel.updateUsuario_BD_Pandora(novoUsuario))
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let updateSenhaUsuario = function(req: Request, res: Response) {
  let dados = req.body;
  const nomeFuncao = getNomeFuncao(1,1);

  const resultado = validaTrocaSenha(dados);
  const { status, msg } = resultado;

  if (status === API_CODES.CODE_SUCESSO) {
    const id = getId_Token(req.headers['authorization']);
    const mensagem = LOG_MSGS.USUARIO_ATUALIZA_SENHA;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => usuarioModel.updateSenhaUsuario_BD_Pandora(id, dados.senhanova))
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(resultado);
  }
};

export let deleteUsuario = function(req: Request, res: Response) {
  let id = parseInt(req.params.id, 10);
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_REMOVE_USUARIO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => usuarioModel.deleteUsuario_BD_Pandora(id))
      .then(usuarios => res.status(200).send(usuarios))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let redefinirSenhaUsuario = function(req: Request, res: Response) {
  let id = req.params.id;
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_REDEFINIR_SENHA;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    const passSize = 8;
    const novaSenha = gerarSenha(passSize);

    logRequisicao(log)
      .then(() => usuarioModel.updateSenhaUsuarioReset_BD_Pandora(id, novaSenha))
      .then(usuario => res.status(200).send(usuario))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let getPermissoesUsuario = function(req: Request, res: Response) {
  let id = req.params.id;
  const nomeFuncao = getNomeFuncao(1,1);

  if (id) {
    const mensagem = LOG_MSGS.USUARIO_LISTA_CONTROLE_ACESSO;
    const log = new NovoLog({ req, secao, item, chave: chaves.ID, valor: id, mensagem });

    logRequisicao(log)
      .then(() => procuraPermissaoUsuario(id, false))
      .then(acesso => res.status(200).send(acesso))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};

export let atualizarPermissoesUsuario = function(req: Request, res: Response) {
  let id = parseInt(req.params.id, 10);
  let permissoes = req.body;
  const nomeFuncao = getNomeFuncao(1,1);

  if (id && permissoes) {
    const mensagem = LOG_MSGS.USUARIO_ATUALIZA_CONTROLE_ACESSO;
    const log = new NovoLog({ req, secao, item, valor: id, mensagem });

    let perm = '';
    for (let secao of Object.keys(permissoes)) {
      for (let item of permissoes[secao]) {
        perm = perm + secao + ',' + item + '|';
      }
    }
    perm = perm.slice(0, -1);

    logRequisicao(log)
      .then(() => usuarioModel.atualizaPermissoesUsuario_BD_Pandora(id, perm))
      .then(usuario => res.status(200).send(usuario))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
};
