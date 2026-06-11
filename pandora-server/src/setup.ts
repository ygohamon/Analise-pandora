import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';

/**
 * ROTAS
 */
import indexRoutes from './routes/index.routes';
import benchmarkRoutes from './routes/benchmark.routes';
import sistemaRoutes from './routes/sistema.routes';

/**
 * RECURSOS
 */
import preUsuariosRoutes from './routes/preusuarios.routes';
import usuariosRoutes from './routes/usuarios.routes';
import pessoasRoutes from './routes/pessoas.routes';
import empresasRoutes from './routes/empresas.routes';
import presosRoutes from './routes/presos.routes';
import logsRoutes from './routes/logs.routes';
import telefonesRoutes from './routes/telefones.routes';
import veiculosRoutes from './routes/veiculos.routes';
import enderecosRoutes from './routes/enderecos.routes';
import obitosRoutes from './routes/obitos.routes';
import tipologiasRoutes from './routes/tipologias.routes';
import folhapagamentoRoutes from './routes/folhapagamento.routes';
import empenhosRoutes from './routes/empenhos.routes';
import licitacoesRoutes from './routes/licitacoes.routes';
import aditivosRoutes from './routes/aditivos.routes';
import contratosRoutes from './routes/contratos.routes';
import geocoordenadasRoutes from './routes/geocoordenadas.routes';
import condenacoesRoutes from './routes/condenacoes.routes';
import boletimOcorrenciaRoutes from './routes/boletimocorrencia.routes';
import imoveisRoutes from './routes/imoveis.routes';
import embarcacoesRoutes from './routes/embarcacoes.routes';
import prontuariosRoutes from './routes/prontuarios.routes';
import investigadosRoutes from './routes/investigados.routes';
import orcrimRoutes from './routes/orcrins.routes';
import tceRoutes from './routes/tce.routes';
import saspRoutes from './routes/sasp.routes';
import aplicativosRoutes from './routes/aplicativos.routes';

import utilsRoutes from './routes/utils.routes';

/**
 *  APPS
 */
import integraRoutes from './routes/apps/integra.routes';
import mapaconsumoRoutes from './routes/apps/mapaconsumo.routes';
import cacafantasmasRoutes from './routes/apps/cacafantasmas.routes';
import tiporankRoutes from './routes/apps/tiporank.routes';
import dnaRoutes from './routes/apps/dna.routes';
import painelcovidRoutes from './routes/apps/painelcovid.routes';
import nepotismoRoutes from './routes/apps/nepotismo.routes';
import relacionamentosRoutes from './routes/apps/relacionamentos.routes';
import arielRoutes from './routes/apps/ariel.routes';
import simbaRoutes from './routes/apps/simba.routes';
import yellowpagesRoutes from './routes/apps/yellowpages.routes';
import ondeandeiRoutes from './routes/apps/ondeandei.routes';
import sefazMLRoutes from './routes/apps/sefazML.routes';
import sadepRoutes from './routes/apps/sadep.routes';

import { criaRespostaAPI, controllerError } from './utils';
import { API_CONFIG, API_CODES, API_MSGS } from './config';
import { logger, morganStream } from './services/log.service';
import { GuardBot, GuardOptions } from './services/auth/authguard.service';
import { GuardLimiteDiarioPorIP } from './services/auth/limiters.service';
import { sessionMiddleware } from './services/session.service';

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
export const server: express.Express = express();

// Gera o log das requisições
server.use(
  morgan(
    ':req[x-real-ip] - :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
    { stream: morganStream }
  )
);

// Middleware que adiciona camadas de segurança ao sistema
server.use(helmet());

// Middleware pra barrar bots
server.use(GuardBot);
server.use(GuardLimiteDiarioPorIP);

// Extende a capacidade de dados do sistema
server.use(bodyParser.json({ limit: '5mb' }));
server.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));

// Middleware que define as requisições permitidas ao sistema
server.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, hs');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

// Middleware para responder as chamadas http OPTIONS
server.use(GuardOptions);

// Middleware pra criar secoes
server.use(sessionMiddleware);

/**
 *
 * ROTAS DA API
 *
 */
server.use('/', indexRoutes);

server.use('/sistema', sistemaRoutes);
server.use('/preusuarios', preUsuariosRoutes);
server.use('/usuarios', usuariosRoutes);
server.use('/benchmark', benchmarkRoutes);
server.use('/utils', utilsRoutes);

/**
 * RECURSOS
 */
server.use('/pessoas', pessoasRoutes);
server.use('/empresas', empresasRoutes);
server.use('/logs', logsRoutes);
server.use('/presos', presosRoutes);
server.use('/telefones', telefonesRoutes);
server.use('/veiculos', veiculosRoutes);
server.use('/obitos', obitosRoutes);
server.use('/enderecos', enderecosRoutes);
server.use('/tipologias', tipologiasRoutes);
server.use('/folhapagamento', folhapagamentoRoutes);
server.use('/empenhos', empenhosRoutes);
server.use('/licitacoes', licitacoesRoutes);
server.use('/contratos', contratosRoutes);
server.use('/aditivos', aditivosRoutes);
server.use('/geocoordenadas', geocoordenadasRoutes);
server.use('/condenacoes', condenacoesRoutes);
server.use('/boletimocorrencia', boletimOcorrenciaRoutes);
server.use('/imoveis', imoveisRoutes);
server.use('/embarcacoes', embarcacoesRoutes);
server.use('/investigados', investigadosRoutes);
server.use('/prontuarios', prontuariosRoutes);
server.use('/orcrins', orcrimRoutes);
server.use('/tce', tceRoutes);
server.use('/sasp', saspRoutes);
server.use('/aplicativos', aplicativosRoutes);

/**
 * APPS
 */
server.use('/dna', dnaRoutes);
server.use('/painelcovid', painelcovidRoutes);
server.use('/tiporank', tiporankRoutes);
server.use('/mapaconsumo', mapaconsumoRoutes);
server.use('/nepotismo', nepotismoRoutes);
server.use('/cacafantasmas', cacafantasmasRoutes);
server.use('/relacionamentos', relacionamentosRoutes);
server.use('/integra', integraRoutes);
server.use('/ariel', arielRoutes);
server.use('/simba', simbaRoutes);
server.use('/yellowpages', yellowpagesRoutes);
server.use('/ondeandei', ondeandeiRoutes);
server.use('/sefazml', sefazMLRoutes);
server.use('/sadep', sadepRoutes);

API_CONFIG.CFG_ENV = server.get('env');

// Tratamento de erros
server.use((error: any, req, res, next) => {
  logger.error(`Error Handler: ${error}\n`);
  console.trace(error);

  controllerError(res, error, 'setup.ts');
  // return null;
});
