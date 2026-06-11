
import got from 'got';
const SocksProxyAgent = require('socks-proxy-agent');

import { tors } from './tor.service';
import { Logger } from './log.service';
import { limpaUrl } from '../utils';
const logger = Logger.get('GOT');

class GotService {

  isReady: boolean;
  contadorTor: number;
  maxRequisicoesTorIP: number;

  torProxy;
  gotDefaultConfig;

  constructor(maxRequisicoesTorIP = 1000) {
    this.isReady = false;
    this.contadorTor = 0;
    this.maxRequisicoesTorIP = maxRequisicoesTorIP;
    this.torProxy = {
      agent: {
        https: new SocksProxyAgent('socks5://127.0.0.1:9050'),
        http: new SocksProxyAgent('socks5://127.0.0.1:9050'),
      }
    }
    this.gotDefaultConfig = {
      timeout: 10000,
      retry: 0
    }
  }

  async get (url, opts = {}) {
    const _opts = { ...this.gotDefaultConfig, ...opts};
    const _url = limpaUrl(url);

    try {
      logger.debug(`Capturando ${_url}`)
      const r = await got(_url, _opts);
      return r;
    } catch (error) {
      logger.error(`${error?.code} - ${error?.message} - ${_url}`);

      if (error?.response?.statusCode === 500 ||
        error?.response?.statusCode === 403 ||
        error?.response?.statusCode === 429) {
        return this.getTor(_url, _opts);
      } else {
        return null;
      }
    }
  }

  async getTor (url, opts = {}) {
    const _opts = { ...this.gotDefaultConfig, ...this.torProxy, ...opts };
    const _url = limpaUrl(url);

    try {
      logger.debug(`[TOR] Capturando ${_url}`)
      // Reseta o IP do TOR sempre que bater no limite de requisições permitido
      await tors.count();
      const r = await got(limpaUrl(_url), _opts)

      return r;
    } catch (error) {
      logger.error(`[TOR] ${error?.code} - ${error?.message} - ${_url}`);
      return null;
    }
  }

  async post (url, opts = {}) {
    const _opts = { ...this.gotDefaultConfig, ...opts};
    const _url = limpaUrl(url);

    try {
      logger.debug(`Capturando ${_url}`)
      const r = await got.post(_url, _opts);
      return r;
    } catch (error) {
      logger.error(`${error?.code} - ${error?.message} - ${_url}`);

      if (error?.response?.statusCode === 500 ||
        error?.response?.statusCode === 403 ||
        error?.response?.statusCode === 429) {
        return this.postTor(_url, _opts);
      } else {
        return null;
      }
    }
  }

  async postTor (url, opts = {}) {
    const _opts = { ...this.gotDefaultConfig, ...this.torProxy, ...opts };
    const _url = limpaUrl(url);

    try {
      logger.debug(`[TOR] Capturando ${_url}`)
      await tors.count();
      const r = await got.post(_url, _opts)

      return r;
    } catch (error) {
      logger.error(`[TOR] ${error?.code} - ${error?.message} - ${_url}`);
      return null;
    }
  }
}

export const gots = new GotService();
