import * as moment from 'moment';
import * as apicache from 'apicache';
import redis = require('redis');

import { Logger } from './log.service';
import { promisify } from '../utils';

const logger = Logger.get('APICACHE');

const method = process.env.APICACHE_METHOD ? process.env.APICACHE_METHOD : 'bypass';
const debug = process.env.APICACHE_DEBUG ? JSON.parse(process.env.APICACHE_DEBUG) : false;

const redis_server = process.env.APICACHE_REDIS_SERVER ? process.env.APICACHE_REDIS_SERVER : '127.0.0.1';
const redis_port = process.env.APICACHE_REDIS_PORT ? process.env.APICACHE_REDIS_PORT : 6379;

const cacheConfig = {
  debug: debug,
  method: method,
  duration: '1 day',

  redisConfig: {
    host: redis_server,
    port: redis_port,
    retry_strategy: function(options: redis.RetryStrategyOptions) {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: REDIS APICACHE`);
      if (options.error) {
        logger.error(`Codigo: ${options.error.code ? options.error.code : ''}`);
        logger.error(`Mensagem: ${options.error.message}`);
      } else {
        logger.error(options);
      }

      // Tenta reconectar ao REDIS 3 vezes
      if (options.attempt > 2) {
        logger.error(`ERRO: APICACHE com metodo REDIS, aplicando modo default para cache`);
        return undefined;
      }

      // Reconecta
      return Math.min(options.attempt * 1000, 3000);
    },
  },
};

const guardValidacaoApiCache = (req, res) => res.statusCode === 200 && req.method === 'GET';

export class APICacheService {
  private cache;
  private method: string;
  private duration: string;

  private debug: boolean;
  private enabled: boolean;
  private connecting: boolean;
  private connected: boolean;

  // Redis
  private redisConfig;
  private redisClient;

  constructor(cacheConfig) {
    this.connected = false;
    this.connecting = false;
    this.cache = null;

    this.enabled = (cacheConfig.method !== 'bypass') ? true : false;
    this.debug = cacheConfig.debug;
    this.method = cacheConfig.method;
    this.duration = cacheConfig.duration;

    this.redisConfig = cacheConfig.redisConfig;

    this.build();
  }

  private build() {
    // Checagem forçada, sem o === true ele está entrando com valores false
    if (this.enabled) {
      if (!this.connected && !this.connecting) {
        this.connecting = true;

        if (this.method === 'redis') {
          this._criaClienteRedis(this.redisConfig);
        } else if (this.method === 'mem') {
          this._criaClienteMem();
        } else {
          logger.info(`Tipo inválido de cache, instanciando para modo default 'bypass'`);
          this._criaClienteBypass();
        }
      }
    } else {
      if (!this.connected && !this.connecting) {
        this._criaClienteBypass();
      }
    }

    return this.cache;
  }

  private reconnect() {
    this.cache = null;
    this.connected = false;
    this.connecting = false;

    this.connect();
  }

  private _criaClienteBypass() {
    this.method = 'bypass';
    this.connecting = false;
    this.connected = false;
    this.cache = apicache.options({ debug: this.debug, enabled: false }).middleware(this.duration, guardValidacaoApiCache);

    logger.info('BYPASS efetuado com sucesso.');

    return this.cache;
  }

  private _criaClienteMem() {
    this.method = 'mem';
    this.connecting = false;
    this.connected = true;
    this.cache = apicache.options({ debug: this.debug }).middleware(this.duration, guardValidacaoApiCache);

    logger.info('APICACHE: Cache em Memória efetuada com sucesso.');

    return this.cache;
  }

  private _criaClienteRedis(redisConfig) {
    this.cache = null;
    this.method = 'redis';

    const client = redis.createClient(redisConfig);

    client.on('error', err => {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: REDIS APICACHE`);
      logger.error(`Codigo: ${err.code ? err.code : ''}`);
      logger.error(`Mensagem: ${err.syscall} ${err.errno} ${err.address}:${err.port}\n`);

      // A NR_CLOSED error code if the clients connection dropped.
      if (err.code === 'NR_CLOSED') {
        client.quit();
        this._criaClienteMem();
      }
    });

    client.on('connect', () => {
      this.connected = true;
      this.connecting = false;
    });

    client.on('reconnecting', (delay, attempt) => {
      this.connecting = true;
      this.connected = false;
    });

    client.on('ready', () => {
      this.connected = true;
      this.connecting = false;

      logger.info('Conexao com REDIS efetuada com sucesso.');
    });

    this.redisClient = client;
    this.cache = apicache
      .options({ redisClient: client, debug: cacheConfig.debug })
      .middleware(cacheConfig.duration, guardValidacaoApiCache);

    return this.cache;
  }

  public connect() {
    return (this.cache) ? this.cache : this.build();
  }

  private clearRedis() {
    apicache.clear(null);
    return new Promise((resolve, reject) => {
      this.redisClient.flushall((err, success) => {
        if (err) {
          reject(err);
        } else {
          resolve(true)
        }
      })
    })
  }

  public clear(key: any) {
    return (this.method !== 'bypass') ? ((this.method === 'redis') ? this.clearRedis() : promisify(apicache.clear(key))) : promisify(null);
  }

  public getPerformance() {
    return (this.method !== 'bypass') ? promisify(apicache.getPerformance()) : promisify([]);
  }

  private getKeysCountRedis() {
    return new Promise((resolve, reject) => {
      this.redisClient.dbsize((err, success) => {
        if (err) {
          reject(err);
        } else {
          if (this.debug) {
            logger.debug(`getKeysCountRedis: ${success}`);
          }
          resolve(success)
        }
      })
    })
  }

  private getKeysCount() {
    return (this.method !== 'bypass') ? ((this.method === 'redis') ? this.getKeysCountRedis() : promisify(apicache.getIndex().all.length)) : promisify(null);
  }

  private fromInfo(info, key) {
    const regex = new RegExp(`${key}:(.*)`);
    const value = info.match(regex);

    return (value) ? value[1] : null;
  }

  public getMemUsage() {
    return new Promise((resolve, reject) => {
      this.redisClient.info((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    }).then(info => {
      if (this.debug) {
        logger.debug(`getMemUsage: ${info}`);
      }

      return {
        redis_version: this.fromInfo(info, 'redis_version'),
        used_memory_human: this.fromInfo(info, 'used_memory_human'),
        used_memory_rss_human: this.fromInfo(info, 'used_memory_rss_human'),
        maxmemory_human: this.fromInfo(info, 'maxmemory_human'),
        maxmemory_policy: this.fromInfo(info, 'maxmemory_policy'),
      }
    })
  }

  public async getInfo() {
    const mem = (this.method === 'redis') ? await this.getMemUsage(): null;

    return promisify({
      connected: this.connected,
      enabled: this.enabled,
      debug: this.debug,
      method: this.method,
      duration: this.duration,
      keysCount: await this.getKeysCount(),

      ...(this.method === 'redis' && {
        redis: {
          host: this.redisConfig.host,
          port: this.redisConfig.port,
          version: mem.redis_version,
          mem: {
            used_memory_human: mem.used_memory_human,
            used_memory_rss_human: mem.used_memory_rss_human,
            maxmemory_human: mem.maxmemory_human,
            maxmemory_policy: mem.maxmemory_policy
          }
        }
      })
    });
  }

  public logVar() {
    logger.info('\n- APICacheService\n');

    logger.info('this.connected', this.connected);
    logger.info('this.connecting', this.connecting);
    logger.info('this.enabled', this.enabled);
    logger.info('this.debug', this.debug);
    logger.info('this.method', this.method);
    logger.info('this.duration', this.duration);
    logger.info('');
  }
}

export const cache = new APICacheService(cacheConfig);
