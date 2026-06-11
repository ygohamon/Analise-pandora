import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    trataRequisicaNome,
    controllerFactory as cf,
    limpaNumero,
    validaCPF,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CONFIG,
    API_CODES,
    API_MSGS,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraPresoDetalhadoCPF,
    procuraPresoSimplificadoCPF,
    procuraPresoSimplificadoVulgo,
    procuraPresoSimplificadoNome,
    procuraPresoSimplificadoNomeMae,
    procuraPresoSimplificadoCNC,
    procuraPresoDetalhadoCNC,
} from './presos.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.PRESO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.PRESO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getPrisionalDetalhadoCPF = function (req: Request, res: Response) {
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraPresoDetalhadoCPF, cpf)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPrisionalDetalhadoCNC = function (req: Request, res: Response) {
    let cnc = limpaNumero(req.params.cnc);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (cnc && (cnc.length === 13 || cnc.length === 14)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CNC, valor: cnc, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraPresoDetalhadoCNC, cnc)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPrisionalSimplificadoCPF = function (req: Request, res: Response) {
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPresoSimplificadoCPF, cpf)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPrisionalSimplificadoCNC = function (req: Request, res: Response) {
    let cnc = limpaNumero(req.params.cnc);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (cnc && (cnc.length === 13 || cnc.length === 14)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CNC, valor: cnc, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPresoSimplificadoCNC, cnc)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPrisionalSimplificadoVulgo = function (req: Request, res: Response) {
    let vulgo = req.params.vulgo;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (vulgo && vulgo.length >= 1) {
        const log = new NovoLog({req, secao, item, chave: chaves.VULGO, valor: vulgo, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPresoSimplificadoVulgo, vulgo)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPrisionalSimplificadoNome = function (req: Request, res: Response) {
    const nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPresoSimplificadoNome, nome)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getPrisionalSimplificadoNomeMae = function (req: Request, res: Response) {
    const nomeMae = req.params.nomemae;
    let nomeArray = trataRequisicaNome(nomeMae);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.NOMEMAE, valor: nomeMae, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPresoSimplificadoNomeMae, nomeMae)
            .then(presos => res.status(200).send(presos))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}
