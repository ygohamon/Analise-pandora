import { promisify } from './../../utils';

import { MSSqlService } from './index';
import { PostgresService } from './index';

export class DatabaseService {
  protected _connection;
  protected _config: IDBConfig;

  protected engine: string;
  protected contadorErros: number;
  protected contadorTentativasReconexao: number;
  protected estaConectado: boolean;

  constructor(config) {
    this.contadorErros = 0;
    this.contadorTentativasReconexao = 0;

    this.estaConectado = false;
    this.engine = config.engine;
    this._config = config;
  }

  public connect(): Promise<any> {
    return this._connection;
  }

  public isConnected(): boolean {
    return this.estaConectado;
  }

  public disconnect(): Promise<boolean> {
    return promisify(false) as Promise<boolean>;
  }

  public getInfo() {
    const {user, password, ...safeConfig} = this._config;

    return promisify({
      connected: this.isConnected(),
      engine: this.engine,
      config: safeConfig
    });
  }

  static factory() {
    const _engine = process.env.BD_ENGINE ? process.env.BD_ENGINE : 'mssql';

    if (_engine === 'mssql') {
      return new MSSqlService();
    } else if (_engine === 'pg') {
      return new PostgresService();
    }else {
      return null;
    }
  }
}

export interface IDBConfig {
  readonly user: string;
  readonly password: string;
  readonly server: string;
  readonly database: string;
  readonly port: number;
  readonly requestTimeout?: number;
  readonly connectionTimeout?: number;
  [propName: string]: any;
}

