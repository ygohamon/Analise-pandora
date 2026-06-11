import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    trataRequisicaNome,
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
    procuraProntuarioAlcunha,
    procuraProntuarioCPF,
    procuraProntuarioNome,
    procuraProntuarioRG,
} from './prontuarios.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.PRONTUARIO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.PRONTUARIO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getProntuariosCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraProntuarioCPF, cpf)
            .then(cpf => res.status(200).send(cpf))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getProntuariosNome = function (req: Request, res: Response){
    let nome = req.params.nome;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nome.length < 2) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraProntuarioNome, nome)
            .then(nome => res.status(200).send(nome))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getProntuariosAlcunha = function (req: Request, res: Response){
    let alcunha = req.params.alcunha;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (!alcunha) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.ALCUNHA, valor: alcunha, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraProntuarioAlcunha, alcunha)
            .then(nome => res.status(200).send(nome))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getPronturarioRG = function (req: Request, res: Response){
    let rg = req.params.rg;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(!rg){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));

    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.RG, valor: rg, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraProntuarioRG, rg)
            .then(rg => res.status(200).send(rg))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

