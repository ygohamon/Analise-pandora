const vanillaPuppeteer = require('puppeteer')
const { Cluster } = require('puppeteer-cluster');
const { addExtra } = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')

import { Logger } from './log.service';
import { tors } from './tor.service';
const logger = Logger.get('PUPPETEER');

class PuppeteerService {

  private chrome;
  isReady: boolean;

  private tor;
  isReadyTor: boolean;

  constructor(maxConcurrency = 50) {
    this.isReady = false;

    const puppeteer = addExtra(vanillaPuppeteer);
    puppeteer.use(StealthPlugin());
    puppeteer.use(require('puppeteer-extra-plugin-block-resources')({
      blockedTypes: new Set(['image', 'stylesheet', 'other', 'font', 'x-icon', 'svg+xml'])
    }))

    // puppeteer.use(AdblockerPlugin({
    //   blockTrackers: true // default: false
    // }));

    Cluster.launch({
      puppeteer,
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency,
      puppeteerOptions: {
        args: ['--no-sandbox', '--ignore-certificate-errors'],

      }
    }).then(cluster => {
      this.chrome = cluster;
      this.isReady = true;
    })
    .catch(error => {
      logger.error('Erro na inicialização do Puppeteer.')
      logger.error(error.stack)
    });

    Cluster.launch({
      puppeteer,
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency,
      puppeteerOptions: {
        args: ['--proxy-server=socks5://127.0.0.1:9050', '--no-sandbox', '--ignore-certificate-errors']
      }
    }).then(cluster => {
      this.tor = cluster;
      this.isReadyTor = true;
    })
    .catch(error => {
      logger.error('[TOR] Erro na inicialização do Puppeteer.')
      logger.error('[TOR] ' + error.stack)
    });
  }

  async get(data, parser) {
    logger.debug(`Capturando ${data?.url}`);
    try {
      const resultado = await this.chrome.execute(data, parser);
      return (resultado?.length) ? resultado : this.getTor(data, parser);
    } catch (error) {
      logger.error(`${error?.name} - ${error?.message} - ${data?.url}`);
      return null;
    }
  }

  async getTor(data, parser) {
    logger.debug(`[TOR] Capturando ${data?.url}`);
    try {
      await tors.count();
      const resultado = await this.tor.execute(data, parser);

      return resultado;
    } catch (error) {
      logger.error(`[TOR] ${error?.name} - ${error?.message} - ${data?.url}`);
      return null;
    }
  }
}

export const puppeteers = new PuppeteerService();
