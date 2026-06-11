import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    controllerFactory as cf,
    validaCNPJ,
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
    procuraTipologiaSimplificadoCPF,
    procuraTipologiaSimplificadoCNPJ
} from './tipologias.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.TIPOLOGIA.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.TIPOLOGIA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTipologiaSimplificadoCPF = function (req : Request, res : Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTipologiaSimplificadoCPF, cpf)
            .then(tipologias => res.status(200).send(tipologias))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getTipologiaSimplificadoCNPJ = function (req : Request, res : Response){
	let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTipologiaSimplificadoCNPJ, cnpj)
            .then(tipologias => res.status(200).send(tipologias))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
