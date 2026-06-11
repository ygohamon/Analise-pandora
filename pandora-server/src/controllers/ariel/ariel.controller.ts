import { Request, Response } from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraPessoaFotoCapturada
} from './ariel.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.ARIEL.NOME;
const chaves = LOG_SECOES.APPS.ITENS.ARIEL.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let identificaPessoaFotoCapturada = function (req : Request, res : Response){
    const data = req.body;
    const nomeFuncao = getNomeFuncao(1,1);

    if (data && data.img) {
        const limiar = data.tolerance;
        const log    = new NovoLog({req, secao, item, chave: chaves.FOTO, tipo: tipos_busca.SIMPLIFICADA})

        cf(log, procuraPessoaFotoCapturada, data.img, limiar)
            .then(tipologias => res.status(200).send(tipologias))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
