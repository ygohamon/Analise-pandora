import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    LOG_SECOES,
    LOG_TIPOS_BUSCA,
    API_MSGS
} from '../../config';

import { 
    procuraTCE_ContaBancaria,
    procuraTCE_Empenho,
    procuraTCE_EmpenhoAnulacao,
    procuraTCE_EmpenhoSuplementacao,
    procuraTCE_Licitacao,
    procuraTCE_Pagamento,
    procuraTCE_PagamentoAnulado,
    procuraTCE_PagamentoExtraOcamentario,
    procuraTCE_PagamentoOrcamentario,
    procuraTCE_PagamentoOrcamentarioAnulado,
    procuraTCE_PagamentoRestituicaoReceita,
    procuraTCE_PagamentoRestosPagar,
    procuraTCE_PagamentoRetencao 

} from './tce.functions';

const secao  = LOG_SECOES.ANALISE.NOME;
const item   = LOG_SECOES.ANALISE.ITENS.TCE.NOME;
const chaves = LOG_SECOES.ANALISE.ITENS.TCE.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

/**
 *
 * @param req
 * @param res
 */
export let getTCE_ContaBancaria = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_ContaBancaria, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_Empenho = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_Empenho, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_EmpenhoAnulacao = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_EmpenhoAnulacao, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_EmpenhoSuplementacao = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_EmpenhoSuplementacao, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_Licitacao = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_Licitacao, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_Pagamento = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_Pagamento, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoAnulado = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoAnulado, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoExtraOrcamentario = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoExtraOcamentario, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoOrcamentario = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoOrcamentario, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoOrcamentarioAnulado = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoOrcamentarioAnulado, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoRestituicaoReceita = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoRestituicaoReceita, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoRestosPagar = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoRestosPagar, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 *
 * @param req
 * @param res
 */
 export let getTCE_PagamentoRetencao = function(req: Request, res: Response) {
    let data = req.params.data;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data){
        const log = new NovoLog({req, secao, item, chave: chaves.DATA, valor: data, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraTCE_PagamentoRetencao, data)
            .then(bos => res.status(200).send(bos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}