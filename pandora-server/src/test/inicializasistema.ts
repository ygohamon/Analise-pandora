import { server as serverExpress } from './../setup';
import * as http from 'http';
import * as moment from 'moment';

import { normalizePort } from '../utils';

import { db } from './../services/db.service';


export let server;

let inicializaApp = function () {
    // Get port from environment and store in Express.
    const port = normalizePort(process.env.SERVER_PORT || '3000');
    serverExpress.set('port', port);

    const server = http.createServer(serverExpress);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function onError(error) {

        if (error.syscall !== 'listen') { throw error;}
        let bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;

        console.log('Listening on ' + bind + ' env - ', serverExpress.get('env'));
    }

    return server;
}

export let inicializaSistema = async function () {

  await db.connect();
  inicializaApp();

    // return db.connect()
    //     .then(conn => {
    //         console.log('Conexao efetuada com sucesso.\n');

    //         server = inicializaApp();
    //     })
    //     .catch(err => {
    //         const hora = moment().format('YYYY-MM-DDTHH:mm:ss');

    //         console.error(`${hora} - Erro: Conexao com o banco falhou`);
    //         console.error(`Codigo: ${err.originalError.code}`);
    //         console.error(`Mensagem: ${err.originalError.message}`, '\n');

    //         setTimeout(() => { inicializaSistema(); }, 5000);
    //     })
}
