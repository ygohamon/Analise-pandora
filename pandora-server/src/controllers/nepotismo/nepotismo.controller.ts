import {
    Request,
    Response
} from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    controllerFactory as cf,
    validaCPF,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    procuraNepotismoCPF,
    procuraNepotismoUgestora,
} from './nepotismo.functions';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.INP.NOME;
const chaves = LOG_SECOES.APPS.ITENS.INP.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getNepotismoUgestora = function (req: Request, res: Response){
    let lotacao    = req.query.lotacao;
    let cdugestora = req.query.cdugestora;
    let ano        = req.query.ano;
    let esfera     = req.query.esfera;

    const nomeFuncao = getNomeFuncao(1,1);

    if (lotacao) {
        const mensagem = `${esfera}${ano}`;
        const log = new NovoLog({req, secao, item, chave: chaves.LOTACAO, valor: lotacao, tipo: tipos_busca.DETALHADA, mensagem});

        cf(log, procuraNepotismoUgestora, lotacao, cdugestora, esfera, ano)
            .then(orgaos => res.status(200).send(orgaos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getNepotismoCPF = function (req: Request, res: Response){
    let ano     = req.query.ano as string;
    let cpf     = req.query.cpf as string;

    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf) && ano) {
        const mensagem = `${ano}`;
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, mensagem})

        cf(log, procuraNepotismoCPF, cpf, ano)
            .then(orgaos => res.status(200).send(orgaos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
