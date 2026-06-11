import * as moment from 'moment';

import { Pool } from 'pg';
import { Logger } from '../log.service';
import { DatabaseService, IDBConfig } from './index';

const logger = Logger.get('BD');

const engine = 'pg';
const user = process.env.BD_USER ? process.env.BD_USER : 'siapdev';
const pw = process.env.BD_PW ? process.env.BD_PW : 'siapdev.';
const server = process.env.BD_SERVER ? process.env.BD_SERVER : '10.128.24.10';
const port = process.env.BD_PORT ? parseInt(process.env.BD_PORT) : 1433;
const database = process.env.BD_DATABASE ? process.env.BD_DATABASE : 'BD_PANDORA';

const requestTimeout = process.env.BD_REQUEST_TIMEOUT ? parseInt(process.env.BD_REQUEST_TIMEOUT) : 120000;
const connectionTimeout = process.env.BD_CONNECTION_TIMEOUT ? parseInt(process.env.BD_CONNECTION_TIMEOUT) : 15000;

const config: IDBConfig = {
  user: user,
  password: pw,
  server: server,
  database: database,
  port: port,
  host: server,

  max: 10,
  connectionTimeoutMillis: connectionTimeout,
  query_timeout: requestTimeout,
  statement_timeout: requestTimeout,

  engine: engine,
};

export class PostgresService extends DatabaseService {

  constructor() {
    super(config);

    this._connection = new Pool(config);
    this._connection.on('error', err => {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: Pool`);
      if (err.originalError) {
        logger.error(`Codigo: ${err.originalError.code ? err.originalError.code : ''}`);
        logger.error(`Mensagem: ${err.originalError.message ? err.originalError.message : ''}`, '\n');
      } else {
        logger.error(err);
        logger.error('\n');
      }

      this.contadorErros += 1;
    });
  }

  async connect(): Promise<Pool> {
    logger.info(`Conectando.`);

    if (!this.isConnected() && !this._connection.connecting) {
      try {
        await this._connection.connect();
        this.estaConectado = true;
        this.contadorErros = 0;
        this.contadorTentativasReconexao = 0;

        logger.info(`Conexão com banco de dados efetuada com sucesso.`);
      } catch (e) {
        logger.error(`Conexão com banco de dados falhou.`);
        logger.error(`${e}`);
        this.estaConectado = false;

        this.contadorErros += 1;
        this.contadorTentativasReconexao += 1;

        if(this.contadorTentativasReconexao >= 5) {
          logger.error(`Falha de conexão após ${this.contadorTentativasReconexao} tentativas, abortando tentativas de reconexão.`);
        } else {
          setTimeout(() => {
            this.connect();
          }, Math.min(this.contadorTentativasReconexao * 30000, 180000));
        }
      }
    }

    return this._connection;
  }

  get(): Pool {
    if (!this.isConnected()) {
      return null;
    } else {
      return this._connection;
    }
  }

  isConnected(): boolean {
    return this.estaConectado;
  }

  async disconnect(): Promise<boolean> {
    try {
      await this._connection.close();
      return true;
    } catch (e) {
      logger.error('Erro ao desconectar do banco de dados: ', e);
      return false;
    }
  }

  // query(_inputs: [string, (() => ISqlType) | ISqlType, any][], _query: string) {
  query(_inputs: any[], _query: string) {
    const _request = this.get();

    // Necessário converter a query para o formato do postgres

    // for (let i of _inputs) {
    //   _request.input(_inputs[0], _inputs[1], _inputs[2])
    // }

    return _request.query(_query)
  }
}
