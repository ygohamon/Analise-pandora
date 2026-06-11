import { server as api } from './setup';
import * as http from 'http';
import * as moment from 'moment';

import { normalizePort } from './utils';
import { db } from './services/db.service';
import { logger } from './services/log.service';
import { cache as modelcache } from './services/cache.service';
import { mailer } from './services/mail.service';

declare const module: any;

let tentativaReconexaoBD = 0;

/**
 * Cria o servidor HTTP responsável por servir as requisições ao REST.
 */
export let inicializaApp = function() {
  const port = normalizePort(process.env.SERVER_PORT || '3000');
  api.set('port', port);

  const server = http.createServer(api);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }

  function onError(error) {
    if (error.syscall !== 'listen') { throw error;}
    let bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case 'EACCES':
        logger.error(bind + ' necessita de permissao, falta de privilegios.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(bind + ' ja esta em uso.');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'porta ' + addr.port;

    logger.info(`Sistema inicializado`);
    logger.info(`Servindo na ${bind}`);
    logger.info(`Ambiente - ${api.get('env')}`);
  }

  return server;
};

/**
 * Função responsável por inicializar uma instância do PANDORA.
 * O sistema só é inicializado quando a conexão ao banco de dados for bem sucedida.
 */
export let inicializaSistema = async function() {

  try {
    await db.connect();
  } catch (error) {
    logger.error('Erro na inicialização do BD')
    logger.error('STACK', {error})
  }

  try {
    await modelcache.connect();
  } catch (error) {
    logger.error('Erro na inicialização do ModelCache')
    logger.error('STACK', {error})
  }

  try {
    await mailer.connect();
  } catch (error) {
    logger.error('Erro na inicialização do Mailer')
    logger.error('STACK', {error})
  }

  inicializaApp();

  // db
  //   .connect()
  //   .then(() => {
  //     tentativaReconexaoBD = 0;
  //     logger.info('BD: Conexao com BD efetuada com sucesso.\n');
  //   })
  //   .then(() => {
  //     logger.info(`Inicializando sistema.`);
  //     inicializaApp();
  //   })
  //   .catch(err => {
  //     // Se a conexão com o banco não for bem sucedida, o sistema apresenta
  //     // uma mensagem de erro e aguarda 5s para tentar novamente.

  //     const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

  //     logger.error(`${hora} - Erro: Conexao com o banco falhou`);
  //     if (err.originalError) {
  //       logger.error(`Codigo: ${err.originalError.code ? err.originalError.code : ''}`);
  //       logger.error(`Mensagem: ${err.originalError.message ? err.originalError.message : ''}`, '\n');
  //     } else {
  //       logger.error(err);
  //       logger.error('\n');
  //     }

  //     tentativaReconexaoBD += 1;
  //     setTimeout(() => {
  //       inicializaSistema();
  //     }, Math.min(tentativaReconexaoBD * 5000, 180000));
  //   });
};

/**
 *
 * SCRIPT PARA INICIALIZACAO DO PANDORA
 *
 */

inicializaSistema();
