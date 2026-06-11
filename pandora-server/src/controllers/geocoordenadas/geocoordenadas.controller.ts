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

import { procuraGeoCoordenadasEmpresasCPF } from './geocoordenadas.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.GEOCOORDENADA.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.GEOCOORDENADA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getGeoCoordenadasEmpresasCPF = function (req: Request, res: Response){
    let cpf        = req.query.cpf as string;
    let datainicio = req.query.dtinicio;
    let datafim    = req.query.dtfim;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA})

        cf(log, procuraGeoCoordenadasEmpresasCPF, cpf, datainicio, datafim)
            .then(geo => res.status(200).send(geo))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
