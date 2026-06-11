import { Request, Response } from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    trataRequisicaNome,
    validaCPF,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    API_CONFIG,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraObitoDetalhadoCPF,
    procuraObitoSimplificadoCPF,
    procuraObitoSimplificadoNome
} from './obitos.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.OBITO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.OBITO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getObitoDetalhadoCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraObitoDetalhadoCPF, cpf, cpfUsuario)
            .then(obitos => res.status(200).send(obitos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getObitoSimplificadoCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraObitoSimplificadoCPF, cpf, cpfUsuario)
            .then(obitos => res.status(200).send(obitos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getObitoSimplificadoNome = function (req: Request, res: Response){
    let nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraObitoSimplificadoNome, nome)
            .then(obitos => res.status(200).send(obitos))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}
