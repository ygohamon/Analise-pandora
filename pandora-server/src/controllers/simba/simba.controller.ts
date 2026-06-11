import { Request, Response } from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    checaCPF,
    validaCPF,
    validaCNPJ,
    getNomeFuncao,
    controllerError,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraTopCNPJ,
    procuraTopCPF
} from './simba.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.SIMBA.NOME;
const chaves = LOG_SECOES.APPS.ITENS.SIMBA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTopPessoaCPF = function (req : Request, res : Response){
    const cpf = req.params.cpf;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, tipo: tipos_busca.SIMPLIFICADA})

        cf(log, procuraTopCPF, cpf)

            .then(dados => res.status(200).send(dados))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getTopPessoaCNPJ = function (req : Request, res : Response){
    const cnpj = req.params.cnpj;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, tipo: tipos_busca.SIMPLIFICADA})

        cf(log, procuraTopCNPJ, cnpj)

            .then(dados => res.status(200).send(dados))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
