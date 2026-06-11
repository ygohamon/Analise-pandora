import * as http from 'http';

import { server as api } from './setup';
import { logger } from './services/log.service';

declare const module: any;

/**
 * Cria o servidor HTTP responsável por servir as requisições ao REST.
 */
export let inicializaApp = function() {
  const port = process.env.SERVER_PORT || '3123';
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

inicializaApp();
