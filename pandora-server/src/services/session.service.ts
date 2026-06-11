import * as moment from 'moment';
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

import { Logger } from './log.service';
import { API_CONFIG } from '../config';
const logger = Logger.get('SESSION');

/**
 * Configurações para o REDIS
 */
const redis_server = process.env.MODELCACHE_REDIS_SERVER ? process.env.MODELCACHE_REDIS_SERVER : '127.0.0.1';
const redis_port = process.env.MODELCACHE_REDIS_PORT ? process.env.MODELCACHE_REDIS_PORT : 6379;

const redisConfig = {
  host: redis_server,
  port: redis_port,

  retry_strategy: function(options) {
    const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

    logger.error(`${hora} - Erro: Session REDIS`);
    if (options.error) {
      logger.error(`Codigo: ${options.error.code ? options.error.code : ''}`);
      logger.error(`Mensagem: ${options.error.syscall} ${options.error.errno} ${options.error.address}:${options.error.port}`, '\n');
    } else {
      logger.error(options);
    }

    // Tenta reconectar ao REDIS 3 vezes
    if (options.attempt > 2) {
      logger.error(`ERRO: Session REDIS`);
      return undefined;
    }

    // Reconecta
    return Math.min(options.attempt * 1000, 3000);
  },
};

const client = redis.createClient(redisConfig);

client.on('error', function (err) {
  logger.error("Conexão com SESSION falhou.", {err});
});

client.on('ready', function(ready) {
  logger.info('Conexao com SESSION efetuada com sucesso.');
});

/**
 * Configurações para o middleware de sessão
 */
const sessionConfig = {
  client: client,
  ttl: API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO,
};

export let sessionMiddleware = session({
  store: new RedisStore(sessionConfig),
  secret: API_CONFIG.SERVER_SESSION_SECRET,
  name: 'ss',
  cookie: { httpOnly: false, secure: false, maxAge: API_CONFIG.JWT_TOKEN_TEMPO_EXPIRACAO * 1000 },

  saveUninitialized: false,
  resave: false,
});
