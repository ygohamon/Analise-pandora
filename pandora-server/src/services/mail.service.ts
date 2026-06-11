import * as mail from 'nodemailer';
import { Email } from '../schemas/email.schema';
import { Logger } from './log.service';
import { promisify } from '../utils';

const logger = Logger.get('MAILER');

const ENV_SERVICE = process.env.MAIL_SERVICE ? process.env.MAIL_SERVICE : '';
const ENV_HOST = process.env.MAIL_HOST ? process.env.MAIL_HOST : '';
const ENV_PORT = process.env.MAIL_PORT ? process.env.MAIL_PORT : 25;

const ENV_USER = process.env.MAIL_USER ? process.env.MAIL_USER : '';
const ENV_PW = process.env.MAIL_PW ? process.env.MAIL_PW : '';
const ENV_DEBUG = process.env.MAIL_DEBUG ? JSON.parse(process.env.MAIL_DEBUG) : false;
const ENV_ENABLED = process.env.MAIL_ENABLED ? JSON.parse(process.env.MAIL_ENABLED) : false;

class MailService {
  private _transporter : mail.Transporter;
  private _configuracoes;

  private enabled;
  private debug;
  private service;

  constructor() {
    this.enabled = ENV_ENABLED;
    if (!this.enabled) { return; }

    this._configuracoes = {
      host: ENV_HOST,
      service: ENV_SERVICE,
      port: ENV_PORT,
      secure: false,
      auth:{
        user: ENV_USER,
        pass: ENV_PW
      },
      tls: { rejectUnauthorized: false }
    };

    this.debug = ENV_DEBUG;
    this.service = ENV_HOST;
  }

  private async build() {
    this._transporter = mail.createTransport(this._configuracoes);
    logger.info(`Mailer ${this.service} criado com sucesso`);

    if (this.debug) {
      const {auth, ...configSemAuth} = this._configuracoes;
      const {pass, ...restoAuth} = auth;
      const config = Object.assign(configSemAuth, {auth: restoAuth});
      logger.debug(`Configurações: ${JSON.stringify(config, null, 2)}`);
    }
  }

  public async getInfo() {
    return promisify({
      connected: await this.verify(),
      enabled: this.enabled,
      debug: this.debug,
      method: this.service,
      config: {
        user: ENV_USER,
        host: ENV_HOST,
        port: ENV_PORT
      }
    });
  }

  public verify() {
    if(!this._transporter) {
      logger.warn(`Mailer ainda não foi conectado, primeiro utilize o método 'connect'`);
      return;
    }
    return this._transporter.verify();
  }

  public connect() {
    return (!this._transporter) ? this.build() : this._transporter;
  }

  public send(dados: Email) {
    const options: mail.SendMailOptions = {
      from: ENV_USER,
      // to: ENV_USER,
      bcc: dados.to,
      subject: dados.subject,
      html: dados.content
    };

    if (this.debug) {
      logger.debug(`Enviando email de ${options.from} para ${dados.to}`)
      logger.debug(`Assunto: ${options.subject}`)
    }

    return this._transporter.sendMail(options);
  }
}

export const mailer = new MailService();
