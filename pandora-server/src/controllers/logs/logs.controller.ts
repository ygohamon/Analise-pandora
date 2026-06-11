import {
    Request,
    Response
} from 'express';

import * as logModel from '../../models/log';
import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    desagrupa,
    print,
    controllerFactory as cf,
    filtraNaoEncontrados,
    agrupaEFiltraDuplicados,
    controllerError,
    getNomeFuncao
} from './../../utils';

import {
    API_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA,
    API_MSGS
} from '../../config';

import {
    procuraLogs, procuraRankings, procuraTokensValidos, procuraRegistrosNaoEncontrados, getLogsPorUsuario
} from './logs.functions';

const secao  = LOG_SECOES.SISTEMA.NOME;
const item   = LOG_SECOES.SISTEMA.ITENS.LOGS.NOME;
// const chaves = LOG_SECOES.SISTEMA.ITENS.;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getLogs = function (req : Request, res : Response){

    let quantidade = parseInt(req.query.quantidade as string);
    let offset     = parseInt(req.query.offset as string);

    const nomeFuncao = getNomeFuncao(1,1);

    if (!quantidade) { quantidade = 100; }
    if (!offset) { offset = 0; }

    const mensagem = `${LOG_MSGS.LOG_GET_LOGS} - ${quantidade}`;
    const log = new NovoLog({req, secao, item, valor: offset, mensagem})

    cf(log, procuraLogs, quantidade, offset)
        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getRankings = function (req : Request, res : Response){

    // const log = new NovoLog({req, secao, item, valor: offset, mensagem})
    const nomeFuncao = getNomeFuncao(1,1);

    cf(null, procuraRankings, req)
        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getRecursosMaisUtilizados = function (req : Request, res : Response){
    let duracao = req.query.duracao as string;
    let chave = req.query.chave as string;

    const nomeFuncao = getNomeFuncao(1,1);

    let resposta = (chave) ?
      Promise.all([logModel.getRecursosEChavesMaisPesquisados_Pesquisa(duracao)]) :
      Promise.all([logModel.getRecursosMaisPesquisados_Pesquisa(duracao)]);

    resposta

        .then(logs => filtraNaoEncontrados(logs))
        .then(logs => agrupaEFiltraDuplicados(logs))
        .then(logs => desagrupa(logs))

        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getUsuariosQuePesquisaramValores = function (req : Request, res : Response){
    let duracao = req.query.duracao as string;
    let chave   = req.query.chave as string;
    let valor   = req.query.valor as string;
    const nomeFuncao = getNomeFuncao(1,1);

    let resposta = Promise.all([logModel.getUsuariosQuePesquisaram_Pesquisa(duracao, {chave: chave, valor: valor})]);

    resposta

        .then(logs => filtraNaoEncontrados(logs))
        .then(logs => agrupaEFiltraDuplicados(logs))
        .then(logs => desagrupa(logs))

        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getTokensValidos = function (req : Request, res : Response){

    const nomeFuncao = getNomeFuncao(1,1);

    cf(null, procuraTokensValidos)
        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getEstatisticasUso = function (req : Request, res : Response){
    let categoria = req.query.categoria as string;
    let duracao   = req.query.duracao as string;

    const nomeFuncao = getNomeFuncao(1,1);

    let resposta;
    if (categoria === 'pesquisa') {
        resposta = Promise.all([logModel.getQuantidadePesquisas(duracao)]);
    } else if (categoria === 'login') {
        resposta = Promise.all([logModel.getQuantidadeLogins(duracao)]);
    }

    resposta

        .then(logs => filtraNaoEncontrados(logs))
        .then(logs => agrupaEFiltraDuplicados(logs))
        .then(logs => desagrupa(logs))

        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getRegistrosNaoEncontrados = function (req : Request, res : Response){

    const nomeFuncao = getNomeFuncao(1,1);

    cf(null, procuraRegistrosNaoEncontrados)
        .then(logs => res.status(200).send(logs))
        .catch(error => controllerError(res, error, nomeFuncao));
};

export let getLogsAcessoUsuario = function (req: Request, res: Response) {
  let { usuario } = req.params;
  const nomeFuncao = getNomeFuncao(1, 1);

  cf(null, getLogsPorUsuario, usuario)
    .then(logsUsuario => res.status(200).send(logsUsuario))
    .catch(error => controllerError(res, error, nomeFuncao));
}
