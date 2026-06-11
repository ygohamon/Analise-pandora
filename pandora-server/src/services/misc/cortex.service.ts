const got = require('got');

import { Logger } from '../log.service';
import * as jwt from '../auth/jwt.service';
import { getModelConfig } from '../../config.models';

const logger = Logger.get('CORTEX');
const config = getModelConfig('WEBSERVICE_CORTEX');

class CortexService {

  private enabled: boolean;
  private token: string;

  constructor() {
    if (config.ativado) {
      this.enabled = true;
      this.login();

    } else {
      this.enabled = false;
    }
  }

  private async login() {
    if (!this.enabled) return null;

    try {
      const response = await got.post(`${config.get('CORTEX_URL_PESSOAS')}/login`, {
        json: {
          'email': config.get('CORTEX_LOGIN'),
          'senha': config.get('CORTEX_SENHA')
        },
        responseType: 'json'
      })

      this.token = response?.headers?.token;

      logger.info(`Cortex conectado com sucesso`);
      if (!this.isTokenValid()) {
        logger.error(`Token inválido`);
      }
    } catch (error) {
      logger.error(`Login falhou`);
      logger.error(`${error?.name} - ${error?.message}`);
      return null;
    }
  }

  private isTokenValid() {
    const _token = jwt.getTokenFromHeader(this.token);
    const decoded = jwt.decode(_token);

    if (!decoded) return null;

    const exp = decoded['payload']?.exp;
    const now = new Date().getTime() / 1000;

    return (now < exp) ? true : false;
  }

  async get(query, cpfUsuario: string) {
    if (!this.enabled) return null;

    if (this.isTokenValid()) {
      try {
        const resultado =  await got.get(`${query}`, {
          headers: {
            'Authorization': this.token,
            'usuario': cpfUsuario
          },
          responseType: 'json'
        })

        return resultado?.body;

      } catch(error) {
        logger.error(`${error?.name} - ${error?.message} - ${query}`);
        return null;
      }
    } else {
      await this.login();
      return this.get(query, cpfUsuario);
    }
  }
}

export const cortex = new CortexService();
