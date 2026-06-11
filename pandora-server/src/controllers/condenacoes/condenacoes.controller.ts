import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    validaCPF,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraCondenacoesCPF,
    procuraCondenacoesTRF5CPF,
    procuraCondenacoesTREPBCPF
} from './condenacoes.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.CONDENACAO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.CONDENACAO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getCondenacoesCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const mensagem = `GERAL`;
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, mensagem,  processo})

        cf(log, procuraCondenacoesCPF, cpf)
            .then(condenacoes => res.status(200).send(condenacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getCondenacoesTRF5CPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const mensagem = `TRF5`;
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, mensagem, processo})

        cf(log, procuraCondenacoesTRF5CPF, cpf)
            .then(condenacoes => res.status(200).send(condenacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getCondenacoesTREPBCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const mensagem = `TREPB`;
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, mensagem, processo})

        cf(log, procuraCondenacoesTREPBCPF, cpf)
            .then(condenacoes => res.status(200).send(condenacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
