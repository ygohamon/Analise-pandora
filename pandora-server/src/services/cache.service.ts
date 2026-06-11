const ioredis = require('ioredis');

import * as moment from 'moment';

import { Logger } from './log.service';
import { sha1, promisify } from '../utils';

const logger = Logger.get('CACHE');

const enabled = process.env.MODELCACHE_ENABLED ? JSON.parse(process.env.MODELCACHE_ENABLED) : false;
const debug = process.env.MODELCACHE_DEBUG ? JSON.parse(process.env.MODELCACHE_DEBUG) : false;

const redis_server = process.env.MODELCACHE_REDIS_SERVER ? process.env.MODELCACHE_REDIS_SERVER : '127.0.0.1';
const redis_port = process.env.MODELCACHE_REDIS_PORT ? process.env.MODELCACHE_REDIS_PORT : 6379;
const duration = process.env.MODELCACHE_REDIS_DURATION ? process.env.MODELCACHE_REDIS_DURATION : 24*60*60;

const cacheConfig = {
  enabled: enabled,
  debug: debug,
  duration: duration,

  redisConfig: {
    host: redis_server,
    port: redis_port,

    retry_strategy: function(options) {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: Cache REDIS`);
      if (options.error) {
        logger.error(`Codigo: ${options.error.code ? options.error.code : ''}`);
        logger.error(`Mensagem: ${options.error.syscall} ${options.error.errno} ${options.error.address}:${options.error.port}`, '\n');
      } else {
        logger.error(options);
      }

      // Tenta reconectar ao REDIS 3 vezes
      if (options.attempt > 2) {
        logger.error(`ERRO: Cache REDIS, aplicando modo default para cache`);
        return undefined;
      }

      // Reconecta
      return Math.min(options.attempt * 1000, 3000);
    },
  },
};

class CacheService {
  private cache;

  private method: string;
  private prefix: string;
  private debug: boolean;
  private enabled: boolean;
  private connecting: boolean;
  private connected: boolean;
  private duration: number;
  private keyList: string[];

  // ioredis
  private redisConfig;

  constructor(cacheConfig) {
    this.connected = false;
    this.connecting = false;

    this.enabled = cacheConfig.enabled;
    this.debug = cacheConfig.debug;
    this.duration = cacheConfig.duration;
    this.keyList = [];

    this.redisConfig = cacheConfig.redisConfig;
    this.prefix = 'MC';

    // this.connect();
  }

  public connect() {
    if (this.enabled) {
      if (!this.connected && !this.connecting) {
        this.connecting = true;
        this._criaClienteRedis(this.redisConfig);
      }
    } else {
      if (!this.connected && !this.connecting) {
        this._criaClienteBypass();
      }
    }

    return this.cache;
  }

  private _criaClienteBypass() {
    this.method = 'bypass';
    this.connecting = false;
    this.connected = true;
    this.cache = null;

    logger.info('BYPASS efetuado com sucesso.');
  }

  private _criaClienteRedis(redisConfig) {
    this.method = 'redis';

    let client = new ioredis(redisConfig);

    client.on('error', (err) => {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: Cache REDIS`);
      logger.error(`Codigo: ${err.code ? err.code : ''}`);
      logger.error(`Mensagem: ${err.syscall} ${err.errno} ${err.address}:${err.port}`, '\n');
    });

    client.on('ready', (ready) => {
      this.connected = true;
      this.connecting = false;

      logger.info('Conexao com REDIS efetuada com sucesso.');
      // self.cache = null;
    });

    this.cache = client;

    // Se tentou conectar mas deu algum erro
    if (client.attempts > 0 && !this.connecting && !client.connected) {
      logger.warn('Se tentou conectar mas deu algum erro');
      logger.warn(`Conectando: ${this.connecting}, Conectado: ${this.connected}`);
      logger.warn(`Tentativas: ${client.attempts}`);
    }

    return this.cache;
  }

  public getCache() {
    return (!this.cache) ? null : this.cache;
  }

  public async clear(chave: string = null) {
    if (chave && await !this.has(chave)) { return promisify(`Chave inválida: ${chave}`)};

    return new Promise((resolve, reject) => {
      const redis = this.cache;
      const stream = redis.scanStream({
        match: (!chave) ? this.prefix + '-*' : this.prefix + '-' + chave,
        count: 1000
      });

      stream.on('data', function (resultKeys) {
        if (resultKeys.length) {
          redis.unlink(resultKeys);
        }
      });

      stream.on('end', function () {
        resolve(true)
      })
    });
  }

  private fromInfo(info, key) {
    const regex = new RegExp(`${key}:(.*)`);
    const value = info.match(regex);

    return (value) ? value[1] : null;
  }

  public memUsage() {
    return this.cache.info().then(info => {
      if (this.debug) {
        logger.debug(`memUsage: ${info}`);
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
    const mem = (this.method === 'redis') ? await this.memUsage(): null;

    return promisify({
      connected: this.connected,
      enabled: this.enabled,
      debug: this.debug,
      method: this.method,

      ...(this.method === 'redis' && {
        keysCount: await this.cacheSize(),
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
        },
        duration: this.duration,
      })
    });
  }

  public dbSize() {
    if (this.method !== 'redis') return promisify([]);
    return this.cache.dbsize();
  }

  public async cacheSize() {
    if (this.method !== 'redis') return promisify([]);
    return (await this.list()).length;
  }

  public logVar() {
    logger.info('\n- CacheService\n');

    logger.info('this.connected', this.connected);
    logger.info('this.connecting', this.connecting);
    logger.info('this.enabled', this.enabled);
    logger.info('this.debug', this.debug);
    logger.info('this.method', this.method);
    logger.info('');
  }

  private has(key:string) {
    if (this.method !== 'redis') return promisify(false);
    return this.cache.exists(key).then(res => !!res)
  }

  private list(): Promise<any>{
    if (this.method !== 'redis') return promisify([]);

    return new Promise((resolve, reject) => {
      var stream = this.cache.scanStream({
        match: this.prefix + '-*',
        count: 1000
      });

      var keys = [];
      stream.on('data', function (resultKeys) {
        for (var i = 0; i < resultKeys.length; i++) {
          keys.push(resultKeys[i]);
        }
      });

      stream.on('end', function () {
        resolve(keys)
      });
    })
  }

  private hash(fnome, key) {
    return sha1(`${fnome}-${key}`);
  }

  /**
   * Método que retorna um "Error" contendo o valor salvo na cache se houver um CACHEMATCH.
   * Senão retorna o valor null.
   *
   * O throw é necessário para quebrar o fluxo de
   *
   * @param fnome
   * @param key
   * @param mssql
   */
  public get(fnome: string, key, flags: string[] = []) {
    const _key = Array.from(key).join('-');
    const _hash = this.hash(fnome, _key);

    // Se a Cache estiver desabilitada, retorna sempre null
    if (!this.enabled) {
      return promisify(null);
    } else {
      if (this.debug) {
        logger.debug(`Tentando pegar key ${this.prefix}-${_hash}`);
        logger.debug(`Função: ${fnome} - Argumentos ${_key}`);
      }

      const redisKey = this.prefix + '-' +_hash;
      return this.cache.get(redisKey).then(dado => JSON.parse(dado));
    };
  }

  /**
   * Método que salva o dado na cache e o retorna.
   *
   * @param fnome
   * @param key
   * @param value
   * @param flags
   */
  public set(fnome: string, key, value, flags: string[] = []) {
    const _key = Array.from(key).join('-');
    const _hash = this.hash(fnome, _key);

    // Se a Cache estiver desabilitada, retorna o valor recebido
    if (!this.enabled) {
      return promisify(value);
    } else {
      if (this.debug) {
        logger.debug(`Inserindo key ${this.prefix}-${_hash} `);
      }

      const redisKey = this.prefix + '-' +_hash;
      return this.cache.set(redisKey, JSON.stringify(value), 'EX', this.duration).then(() => value);
    }
  }
}

export let cache = new CacheService(cacheConfig);
