const net = require('net');

import { Logger } from './log.service';
const logger = Logger.get('TOR');


class TorService {

  private host;
  private port;

  resetando: boolean;

  contadorRequisicoes: number;
  maxRequisicoesTorIP: number;

  constructor(host = '127.0.0.1', port = 9051, maxReq = 100) {
    this.host = host;
    this.port = port;
    this.resetando = false;

    this.contadorRequisicoes = 0;
    this.maxRequisicoesTorIP = maxReq;
  }

  async reset() {

    const socket = new net.Socket({ allowHalfOpen: false });

    try {
      await this.connect(socket);
      await this.write(socket, 'AUTHENTICATE');
      await this.write(socket, 'signal NEWNYM');

      socket.destroy();
      return true;
    } catch (error) {
      socket.destroy();
      return false;
    }
  }

  private write(socket, cmd) {
    return new Promise((resolve, reject) => {
      if (!socket.writable) {
        reject(new Error('Socket is not writable'));
      }

      socket.removeAllListeners('error');
      socket.removeAllListeners('data');

      socket.once('data', function(data) {
        const res    = data.toString().replace(/[\r\n]/g, '');
        const tokens = res.split(' ')
        const code   = parseInt(tokens[0]);

        if (code !== 250) {
          reject(new Error(res));
        } else {
          resolve(true);
        }
      });

      socket.once('err', reject);
      socket.write(cmd + '\r\n');
    })
  }

  private connect(sock) {
    return new Promise((resolve, reject) => {
      sock.once('connect', resolve);
      sock.once('error', reject);
      sock.connect(this.port, this.host);
    })
  }

  public async count() {
    this.contadorRequisicoes += 1;

    if(this.contadorRequisicoes >= this.maxRequisicoesTorIP) {
      this.resetando = true;
      const resetou = await this.reset();
      if (resetou) {
        this.contadorRequisicoes = 0;
        logger.info('[TOR] IP resetado')
      }
      this.resetando = false;
    }
  }

}

export const tors = new TorService();
