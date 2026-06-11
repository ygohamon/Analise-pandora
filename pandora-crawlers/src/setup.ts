import express = require('express');
const morgan = require('morgan')


/**
 * ROTAS
 */
import indexRoutes from './routes/index.routes';
import { morganStream, logger } from './services/log.service';
// import benchmarkRoutes from './routes/benchmark.routes';


process.on('warning', function (error) {
  logger.error(`warning - Error Handler: ${error}\n`);
  logger.error(`${error.stack}`);
});

process.on('uncaughtException', function (error) {
  logger.error(`uncaughtException - Error Handler: ${error}\n`);
});

process.on("unhandledRejection", function (error) {
  logger.error(`unhandledRejection - Error Handler: ${error}\n`);
});


// Cria uma instância do servidor Express
export const server = express();

// Gera o log das requisições
server.use(morgan(
  ':req[x-real-ip] - :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  { stream: morganStream }
));

// Middleware que define as requisições permitidas ao sistema
server.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, hs');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

/**
 *
 * ROTAS DA API
 *
 */
server.use('/', indexRoutes);
// server.use('/benchmark', benchmarkRoutes);

/**
 * RECURSOS
 */
// server.use('/benchmark', benchmarkRoutes);


// Tratamento de erros
server.use((error: any, req, res, next) => {
  logger.error(`Error Handler: ${error}\n`);
  console.trace(error);
});
