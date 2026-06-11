const cheerio = require('cheerio');

import { gots } from "./got.service";
import { Logger } from './log.service';
const logger = Logger.get('CHEERIO');

class CheerioService {

  isReady: boolean;

  constructor() {
    this.isReady = false;
  }

  async get (url, opts = {}) {
    try {
      const r = await gots.get(url, opts);
      if (r !== null) {
        return cheerio.load(r.body);
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`${error?.code} - ${error?.message} - ${url}`);
      return null;
    }
  }

  async getTor (url, opts = {}) {
    try {
      const r = await gots.getTor(url, opts);
      if (r !== null) {
        return cheerio.load(r.body);
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`[TOR] ${error?.code} - ${error?.message} - ${url}`);
      return null;
    }
  }

  async post (url, opts = {}) {
    try {
      const r = await gots.post(url, opts);
      if (r !== null) {
        return cheerio.load(r.body);
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`${error?.code} - ${error?.message} - ${url}`);
      return null;
    }
  }

  async postTor (url, opts = {}) {
    try {
      const r = await gots.postTor(url, opts);
      if (r !== null) {
        return cheerio.load(r.body);
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`[TOR] ${error?.code} - ${error?.message} - ${url}`);
      return null;
    }
  }
}

export const cheerios = new CheerioService();
