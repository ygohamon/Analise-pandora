import * as ActiveDirectory from 'activedirectory';
import * as soap from 'soap';

import { Usuario, NovoUsuario } from '../../models/schemas';
import { autenticaUsuario_BD_Pandora } from '../../models/usuario';
import { criaRespostaAPI } from '../../utils';

import { API_CONFIG, API_CODES, API_MSGS } from './../../config';

/**
 * Função que faz a autenticação do usuário ao ActiveDirectory.
 *
 * @param usuario
 * @param adConfig
 * @param dominio
 */
const authAD = function(usuario, adConfig, dominio) {
  const ad = new ActiveDirectory(adConfig);

  return new Promise((resolve, reject) => {
    ad.authenticate(usuario.login + dominio, usuario.senha, function(err, auth) {
      if (err) {
        reject(criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_FALHA_LOGIN));
        return;
      }

      if (auth) {
        resolve(criaRespostaAPI(API_CODES.CODE_SUCESSO, API_MSGS.MSG_LOGIN_SUCESSO));
      } else {
        reject(criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_FALHA_LOGIN));
        return;
      }
    });

    setTimeout(() => {
      reject(criaRespostaAPI(API_CODES.CODE_FALHA_LOGIN, API_MSGS.MSG_LOGIN_TIMEOUT));
    }, API_CONFIG.AD_TIMEOUT);
  });
};

/**
 * Função que decide o modo de autenticação do usuário.
 *
 * @param usuario
 * @param tipoAD
 */
export const autenticaUsuario = function(usuario: NovoUsuario, tipoAD: string) {
  switch (tipoAD) {
    case 'MP': {
      const adConfigMP = { url: `ldap://${API_CONFIG.AD_MP_URL}`, baseDN: API_CONFIG.AD_MP_BASE_DN };
      return authAD(usuario, adConfigMP, API_CONFIG.AD_MP_DOMAIN);
    }
    case 'LAB': {
      const adConfigLAB = { url: `ldap://${API_CONFIG.AD_LAB_URL}`, baseDN: API_CONFIG.AD_LAB_BASE_DN };
      return authAD(usuario, adConfigLAB, API_CONFIG.AD_LAB_DOMAIN);
    }
    case 'LOCAL':
      return autenticaUsuario_BD_Pandora(usuario);
    default:
      return false;
  }
};

/**
 * Função que valida o token recebido pela rota '/externo' necessária para a integração do sistema
 * ao MPVIRTUAL.
 *
 * @param token
 */
export const validaTokenDitecMPPB = function(token) {
  return new Promise((resolve, reject) => {
    soap.createClient(API_CONFIG.MP_DITEC_WSDL_URL, (error, client: any) => {
      if (error) {
        reject(error);
        return;
      }

      client.consultaAutorizacao(
        { token: token, siglaSistema: 'MPVIRTUAL' },
        function(err, result, raw, header) {
          if (err) {
            reject(err);
            return;
          }
          if (!result) {
            reject(null);
            return;
          }

          const usuario = result.return ? result.return.usuario : null;
          if (usuario) {
            resolve({
              id: usuario.id,
              login: usuario.login,
              nome: usuario.nome,
            });
          } else {
            reject(null);
          }
        },
        { timeout: API_CONFIG.MP_DITEC_REQUEST_TIMEOUT }
      );
    });
  });
};
