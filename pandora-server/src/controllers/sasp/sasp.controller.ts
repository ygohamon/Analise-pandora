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
    logRequisicao,
    agrupaEFiltraDuplicados,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraSASCPF, 
    procuraSASPAlcunha, 
    procuraSASPNome, 
    procuraSASPRG
} from './sasp.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.SASP.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.SASP.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getSASPCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        logRequisicao(log)
        .then(() => {return procuraSASCPF(cpf)})
        .then(resultados => agrupaEFiltraDuplicados(resultados, []))
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getSASPNome = function (req: Request, res: Response){
    let nome = req.params.nome;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (!nome) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.DETALHADA, processo})

        logRequisicao(log)
        .then(() => {return procuraSASPNome(nome)})
        .then(resultados => agrupaEFiltraDuplicados(resultados, []))
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getSASPRG = function (req: Request, res: Response){
    let rg = req.params.rg;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(!rg){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));

    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.RG, valor: rg, tipo: tipos_busca.DETALHADA, processo})

        logRequisicao(log)
        .then(() => {return procuraSASPRG(rg)})
        .then(resultados => agrupaEFiltraDuplicados(resultados, []))
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getSASPAlcunha = function (req: Request, res: Response){
    let alcunha = req.params.alcunha;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (!alcunha) {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    } else {
        const log = new NovoLog({req, secao, item, chave: chaves.ALCUNHA, valor: alcunha, tipo: tipos_busca.DETALHADA, processo})

        logRequisicao(log)
        .then(() => {return procuraSASPAlcunha(alcunha)})
        .then(resultados => agrupaEFiltraDuplicados(resultados, []))
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    }
}