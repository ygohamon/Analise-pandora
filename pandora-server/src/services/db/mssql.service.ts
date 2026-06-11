import * as moment from 'moment';

import * as mssql from 'mssql';
import { ConnectionPool, ISqlType } from 'mssql';
import { Logger } from '../log.service';
import { DatabaseService, IDBConfig } from './index';

import { DBTypes } from './sql.types';

const logger = Logger.get('BD');

const engine = 'mssql';
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
  requestTimeout: requestTimeout,
  connectionTimeout: connectionTimeout,
  options: {
    encrypt: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 5,
    // acquireTimeoutMillis: 0,
    evictionRunIntervalMillis: 5000,
    idleTimeoutMillis: 10000,
  },
  engine: engine,
};

export class MSSqlService extends DatabaseService {

  constructor() {
    super(config);

    this._connection = new ConnectionPool(config) as ConnectionPool;
    this._connection.on('error', err => {
      const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

      logger.error(`${hora} - Erro: ConnectionPool`);
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

  async connect(): Promise<ConnectionPool> {
    logger.info(`Conectando.`);

    if (!this.isConnected() && !this._connection.connecting) {
      try {
        await this._connection.connect();
        logger.info(`Conexão com banco de dados efetuada com sucesso.`);

        this.contadorTentativasReconexao = 0;
        this.contadorErros = 0;
        this.estaConectado = true;
      } catch (e) {
        logger.error(`Conexão com banco de dados falhou.`);
        logger.error(`${e}`);

        this.contadorErros += 1;
        this.contadorTentativasReconexao += 1;
        this.estaConectado = false;

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

  public get(): ConnectionPool {
    if (!this.isConnected()) {
      return null;
    } else {
      return this._connection;
    }
  }

  public isConnected(): boolean {
    return this._connection.connected;
  }

  public async disconnect(): Promise<boolean> {
    try {
      await this._connection.close();
      return true;
    } catch (e) {
      logger.error('Erro ao desconectar do banco de dados: ', e);
      return false;
    }
  }

  /**
   * Método faz a requisição da query ao driver do BD e retorna o resultado para o model
   *
   * @param _inputs Lista de parâmetros de entrada
   * @param _query Query SQL a ser enviada para o driver do BD
   * @param rawResult Flag para retornar o resultado bruto do driver
   * @param debug Flag para apresentar os parâmetros da query e seus resultados
  */
  public query(_inputs: any[], _query: string, rawResult: boolean = false, debug: boolean = false) : any {
    const _request = this.get().request();

    for (let i of _inputs) {
      _request.input(i[0], this._map(i[1]), i[2])
    }

    return _request.query(_query).then(r => {
      if (debug) {
        logger.debug(`QUERY: ${_query}`);
        logger.debug(`INPUTS: ${_inputs}`);
        logger.debug(`RESULT: ${JSON.stringify(r)}`);
        logger.debug(`RETURN: ${r?.recordset}`);
      }

      return (rawResult === true) ? r : r.recordset;
    })
  }

  private _map(data) {

    if (typeof data === 'function') {
      switch (data) {
        case (DBTypes.VarChar): return mssql.VarChar;
        case (DBTypes.NVarChar): return mssql.NVarChar;
        case (DBTypes.Text): return mssql.Text;
        case (DBTypes.Int): return mssql.Int;
        case (DBTypes.BigInt): return mssql.BigInt;
        case (DBTypes.TinyInt): return mssql.TinyInt;
        case (DBTypes.SmallInt): return mssql.SmallInt;
        case (DBTypes.Bit): return mssql.Bit;
        case (DBTypes.Float): return mssql.Float;
        case (DBTypes.Numeric): return mssql.Numeric;
        case (DBTypes.Decimal): return mssql.Decimal;
        case (DBTypes.Real): return mssql.Real;
        case (DBTypes.Date): return mssql.Date;
        case (DBTypes.DateTime): return mssql.DateTime;
        case (DBTypes.DateTime2): return mssql.DateTime2;
        case (DBTypes.DateTimeOffset): return mssql.DateTimeOffset;
        case (DBTypes.SmallDateTime): return mssql.SmallDateTime;
        case (DBTypes.Time): return mssql.Time;
        case (DBTypes.UniqueIdentifier): return mssql.UniqueIdentifier;
        case (DBTypes.SmallMoney): return mssql.SmallMoney;
        case (DBTypes.Money): return mssql.Money;
        case (DBTypes.Binary): return mssql.Binary;
        case (DBTypes.VarBinary): return mssql.VarBinary;
        case (DBTypes.Image): return mssql.Image;
        case (DBTypes.Xml): return mssql.Xml;
        case (DBTypes.Char): return mssql.Char;
        case (DBTypes.NChar): return mssql.NChar;
        case (DBTypes.NText): return mssql.NText;
        // case (DBTypes.TVP): return mssql.TVP;
        case (DBTypes.UDT): return mssql.UDT;
        case (DBTypes.Geography): return mssql.Geography;
        case (DBTypes.Geometry): return mssql.Geometry;
        case (DBTypes.Variant): return mssql.Variant;
        default:
          return null;
      }
    } else if (typeof data === 'object') {
        switch (data.type) {
          case (DBTypes.VarChar): return mssql.VarChar(data.length);
          case (DBTypes.NVarChar): return mssql.NVarChar(data.length);
          case (DBTypes.Char): return mssql.Char(data.length);
          case (DBTypes.Char): return mssql.Char(data.length);
          case (DBTypes.Numeric): return mssql.Numeric(data.precision, data.scale);
          case (DBTypes.Decimal): return mssql.Decimal(data.precision, data.scale);
          case (DBTypes.DateTime2): return mssql.DateTime2(data.scale);
          case (DBTypes.DateTimeOffset): return mssql.DateTimeOffset(data.scale);
          case (DBTypes.VarBinary): return mssql.VarBinary(data.length);
     }
    } else {
      return null;
    }
  }
}
