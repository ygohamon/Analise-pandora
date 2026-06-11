import * as jwt from 'jsonwebtoken';
import { API_CONFIG } from './../../config';

/**
 * Cria um token válido para ser enviado ao usuário
 *
 * @param user
 */
export const create = function(user) {
  const opt: jwt.SignOptions = {
    algorithm: API_CONFIG.JWT_TOKEN_HASH_ALGORITHM as jwt.Algorithm,
    expiresIn: API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO,
  };

  return jwt.sign({ user: user, ts: Date.now() }, API_CONFIG.JWT_TOKEN_SENHA, opt);
};

/**
 * Retorna o payload do token
 *
 * @param user
 */
export const decode = function(token) {
  const opt: jwt.DecodeOptions = {
    complete: true,
  };

  return jwt.decode(token, opt);
};

export const getTokenFromHeader = function(authHeader: string) {
  if (!authHeader) {
    return null;
  }

  if (authHeader.split(' ').length > 1) {
    return authHeader.split(' ')[1];
  } else {
    return authHeader.split(' ')[0];
  }
};

/**
 * Verifica se o token recebido na requisição é válido ou não
 *
 * @param token
 */
export const verify = function(token): { status: boolean; payload: any; error: any } {
  token = getTokenFromHeader(token);

  const opt: jwt.VerifyOptions = {
    algorithms: [API_CONFIG.JWT_TOKEN_HASH_ALGORITHM as jwt.Algorithm],
  };

  try {
    const payload = jwt.verify(token, API_CONFIG.JWT_TOKEN_SENHA, opt);

    return {
      status: true,
      payload,
      error: null,
    };
  } catch (error) {
    return {
      status: false,
      payload: null,
      error,
    };
  }
};

/**
 * Cria um token válido para autorizar aplicativos externos ao pandora o acessarem
 *
 * @param user
 */
export const generateAppToken = function(app) {
  const opt: jwt.SignOptions = {
    algorithm: API_CONFIG.JWT_TOKEN_HASH_ALGORITHM as jwt.Algorithm,
  };

  return jwt.sign({ app: app, ts: Date.now() }, API_CONFIG.JWT_TOKEN_SENHA, opt);
};
