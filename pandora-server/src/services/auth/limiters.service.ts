const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
import * as moment from 'moment';

import * as jwt from './jwt.service';
import { Logger } from "../log.service";
import { NovoLog } from '../../schemas/log.schema';
import { LOG_SECOES, API_CODES, API_MSGS, API_CONFIG } from '../../config';
import { logRequisicao, criaRespostaAPI, logErroBuscaBD, sha1, flat, getIpRequest } from '../../utils';
import { getEstourouQuotaDiariaLimiteAcessoIP, getLimiteAcessoBlackListIP, getEstourouQuotaDiariaLimiteAcessoUsuario } from '../../models/limiteacesso';
import { getUsuariosById } from '../../models/usuario';

const logger = Logger.get('LIMITEACESSO');

const redis_server = process.env.MODELCACHE_REDIS_SERVER ? process.env.MODELCACHE_REDIS_SERVER : '127.0.0.1';
const redis_port = process.env.MODELCACHE_REDIS_PORT ? process.env.MODELCACHE_REDIS_PORT : 6379;

const limiteDiarioPorIP = process.env.LIMITE_ACESSO_DIARIO_IP ? process.env.LIMITE_ACESSO_DIARIO_IP : 1000;
const limiteDiarioPorUsuario = process.env.LIMITE_ACESSO_USUARIO_DIARIO ? process.env.LIMITE_ACESSO_USUARIO_DIARIO : 200;
const limiteHoraPorUsuario = process.env.LIMITE_ACESSO_USUARIO_HORA ? process.env.LIMITE_ACESSO_USUARIO_HORA : 100;
const limiteMinutoPorUsuario = process.env.LIMITE_ACESSO_USUARIO_MINUTO ? process.env.LIMITE_ACESSO_USUARIO_MINUTO : 20;

const limiteAcessoWhitelist = process.env.LIMITE_ACESSO_WHITELIST ? process.env.LIMITE_ACESSO_WHITELIST.split(',') : ['127.0.0.1', 'localhost'];
const limiteAcessoBlacklist = process.env.LIMITE_ACESSO_BLACKLIST ? process.env.LIMITE_ACESSO_BLACKLIST.split(',') : [];


const config = {
  host: redis_server,
  port: redis_port,
  enable_offline_queue: false,

  retry_strategy: function(options) {
    const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

    logger.error(`${hora} - Erro: REDIS LIMITEACESSO`);
    if (options.error) {
      logger.error(`Codigo: ${options.error.code ? options.error.code : ''}`);
      logger.error(`Mensagem: ${options.error.message}`);
    } else {
      logger.error(options);
    }

    // Tenta reconectar ao REDIS 3 vezes
    if (options.attempt > 2) {
      logger.error(`ERRO: LIMITEACESSO com metodo REDIS, aplicando modo default para cache`);
      return undefined;
    }

    // Reconecta
    return Math.min(options.attempt * 1000, 3000);
  },
}

const redisClient = redis.createClient(config);

class Limitador {

  private limitador;

  client;
  prefix: string;
  points: number;
  duration: number;
  blockDuration: number;

  constructor({keyPrefix, points, duration, blockDuration = 0, storeClient}) {

    this.prefix = keyPrefix;
    this.points = points;
    this.duration = duration;
    this.blockDuration = blockDuration;

    this.client = storeClient;
    this.limitador = new RateLimiterRedis({keyPrefix: '', points, duration, blockDuration, storeClient});
  }

  consume(chave) {
    // logger.debug(`Consumindo ${this._criaChave(chave)}`);
    return this.limitador.consume(this._criaChave(chave))
  }

  clear(chave) {
    // logger.debug(`Deletando ${this._criaChave(chave)}`);
    return this.limitador.delete(this._criaChave(chave))
  }

  get(chave) {
    // logger.debug(`Pegando ${this._criaChave(chave)}`);
    // return this.limitador.get(this._criaChave(chave))
    return this.limitador.get(chave)
  }

  private _get(chave) {
    // logger.debug(`Pegando info de ${chave}`);
    return new Promise((resolve, reject) => {
      this.client.get(chave, (err, res) => {
        if (err) { reject(err) }
        else { resolve(res) }
      })
    })
  }

  private _criaChave(chave) {
    return `${this.prefix}-${chave}`;
  }

  list(chave=null) {
    return new Promise((resolve, reject) => {
      this.client.keys(`${this.prefix}-*`, (err, res) => {
        if (err) { reject(err) }
        else { resolve(res) }
      })
    })
      .then((chaves:any) => {
        return Promise.all(chaves.map(async (c) => {
          let container = {};

          const chaveSemPrefixo = c.split(`${this.prefix}-`)[1];
          let pontosUsados = await this._get(c) as number;
          const proporcaoUso = pontosUsados / this.points; // Pega o percentual

          if (!chave) {
            container[chaveSemPrefixo] = (proporcaoUso > 1) ? 1 : proporcaoUso;
          } else {
            container[chave] = chaveSemPrefixo;
            container['pontosUsados'] = pontosUsados;
            container['proporcaoUso'] = (proporcaoUso > 1) ? 1 : proporcaoUso;
          }

          return container;
        }))
      })
  }
}

const erroLimite = criaRespostaAPI(API_CODES.CODE_QUOTA_ACESSO_ZERADA, API_MSGS.MSG_QUOTA_ZERADA)


 /**
  * IP
  */
const limitadorDiarioPorIP = new Limitador({
  storeClient: redisClient,
  keyPrefix: 'LIMITE_IP_DIA',
  points: limiteDiarioPorIP,
  duration: 60 * 60 * 24,
  // blockDuration: 60 * 60 * 24,
})

export const GuardLimiteDiarioPorIP = (req, res, next) => {
  let token = req.body?.token || req.headers['token'] || req.headers['Authorization'] || req.headers['authorization'];
  let isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;

  if (isTest) {
    next()
  } else {
    const ip = getIpRequest(req);

    if (limiteAcessoBlacklist.includes(ip)) {
      const log = new NovoLog({ req, secao: LOG_SECOES.SISTEMA.NOME, code: API_CODES.CODE_QUOTA_ACESSO_ZERADA, chave: 'LIMITE_IP_DIA', tipo: 'BLACKLIST' });
      return logRequisicao(log, null, true).then(() => res.status(429).send(erroLimite));
    }
    if (limiteAcessoWhitelist.includes(ip)) { return next() }

    if (token) {
      const { status, payload, error } = jwt.verify(token);
      if (status && payload?.user?.perfil === 'admin') { return next() }
    }

    limitadorDiarioPorIP.consume(ip)
      .then(() => next())
      .catch(error => {
        const log = new NovoLog({ req, secao: LOG_SECOES.SISTEMA.NOME, code: API_CODES.CODE_QUOTA_ACESSO_ZERADA, chave: 'LIMITE_IP_DIA' });
        logRequisicao(log, null, true).then(() => res.status(429).send(erroLimite));
      });
  }
};

export const getLimitePorIPInfo = function (chave: string) {
  return Promise.all([
    limitadorDiarioPorIP.list('ip'),
  ]).then(dados => flat(dados));
}

export const removeLimiteIP = function (chave: string) {
  return Promise.all([
    limitadorDiarioPorIP.clear(chave),
  ]).then(dados => flat(dados));
}

export const getEstouroLimiteIPHistorico = function (chave: string) {
  return Promise.all([
    getEstourouQuotaDiariaLimiteAcessoIP(),
  ]).then(dados => flat(dados));
}

export const getLimiteAcessoIPBlacklist = function () {
  return Promise.all([
    getLimiteAcessoBlackListIP(),
  ]).then(dados => flat(dados));
}


 /**
  * USUARIO
  */

/**
 * Limite de consultas por dia por usuario
 */
const limitadorDiarioPorUsuario = new Limitador({
  storeClient: redisClient,
  keyPrefix: 'LIMITE_USUARIO_DIA',
  points: limiteDiarioPorUsuario,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60  ,
});

/**
 * Limite de consultas por hora por usuario
 */
const limitadorHoraPorUsuario = new Limitador({
  storeClient: redisClient,
  keyPrefix: 'LIMITE_USUARIO_HORA',
  points: limiteHoraPorUsuario,
  duration: 60 * 60,
});


const limitadorMinutoPorUsuario = new Limitador({
  storeClient: redisClient,
  keyPrefix: 'LIMITE_USUARIO_MINUTO',
  points: limiteMinutoPorUsuario,
  duration: 60,
});


export const GuardLimiteAcessoPorUsuario = (req, res, next) => {
  let token = req.body?.token || req.headers['token'] || req.headers['Authorization'] || req.headers['authorization'];
  let isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;

  if (isTest) {
    next()
  } else if (token) {
    const { status, payload, error } = jwt.verify(token);

    if (status && payload?.user?.perfil === 'admin') { return next() }

    if (status) {
      Promise.all([
        limitadorDiarioPorUsuario.consume(payload.user.id),
        limitadorHoraPorUsuario.consume(payload.user.id),
        limitadorMinutoPorUsuario.consume(payload.user.id),
      ])
        .then(() => next())
        .catch(error => {
          logErroBuscaBD(error, 'GuardLimiteAcessoPorUsuario');

          const log = new NovoLog({ req, secao: LOG_SECOES.SISTEMA.NOME, code: API_CODES.CODE_QUOTA_ACESSO_ZERADA, chave: 'LIMITE_USUARIO' });
          logRequisicao(log).then(() => res.status(429).send(erroLimite));
        })

    } else {
      const log = new NovoLog({ req, secao: LOG_SECOES.SISTEMA.NOME, code: API_CODES.CODE_TOKEN_INVALIDO, mensagem: API_MSGS.MSG_TOKEN_INVALIDO });
      logRequisicao(log).then(() => res.status(403).send(criaRespostaAPI(API_CODES.CODE_TOKEN_INVALIDO, API_MSGS.MSG_TOKEN_INVALIDO)));
    }
  } else {
    const log = new NovoLog({ req, secao: LOG_SECOES.SISTEMA.NOME, code: API_CODES.CODE_TOKEN_NAO_ENCONTRADO, mensagem: API_MSGS.MSG_TOKEN_NAO_ENCONTRADO });
    logRequisicao(log, true).then(() => res.status(401).send(criaRespostaAPI(API_CODES.CODE_TOKEN_NAO_ENCONTRADO, API_MSGS.MSG_TOKEN_NAO_ENCONTRADO)));
  }
}

export const getLimitePorUsuarioInfo = async function (chave: string) {

  const limites = await limitadorDiarioPorUsuario.list('usuario') as {usuario: string, pontosUsados: number, proporcaoUso: number}[];
  const ids = limites.map(l => l.usuario);
  const logins = await getUsuariosById(ids);

  const resultado = limites.map(dado => {
    const usuario = logins.filter(d => d.id == dado.usuario)[0];

    dado['usuario'] = usuario.login;
    dado['id'] = usuario.id;

    return dado;
  })

  return resultado;
}

export const removeLimiteUsuario = function (chave: string) {

  return Promise.all([
    limitadorDiarioPorUsuario.clear(chave),
    limitadorHoraPorUsuario.clear(chave),
    limitadorMinutoPorUsuario.clear(chave)
  ]).then(dados => flat(dados));
}

export const getEstouroLimiteUsuarioHistorico = function (chave: string) {
  return Promise.all([
    getEstourouQuotaDiariaLimiteAcessoUsuario(),
  ]).then(dados => flat(dados));
}
