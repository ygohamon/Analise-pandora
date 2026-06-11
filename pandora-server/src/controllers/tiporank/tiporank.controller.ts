import { Request, Response } from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    agrupaEFiltraDuplicados,
    desagrupa,
    logRequisicao,
    getNomeFuncao,
    controllerError,
} from './../../utils';

import {
    API_CONFIG,
    API_CODES,
    API_MSGS,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraTipologiasMunicipioUF,
    procuraMunicioUF,
} from './tiporank.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.APPS.ITENS.TIPORANK.NOME;
const chaves = LOG_SECOES.APPS.ITENS.TIPORANK.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTipologiaSimplificadoUFMunicipio = function (req: Request, res: Response) {
    let uf = req.params.uf;
    let municipio = req.params.municipio;
    const nomeFuncao = getNomeFuncao(1,1);

    let processo = req.query.processo;

    if (uf && municipio) {
        const mensagem = `${uf}`;
        const log = new NovoLog({req, secao, item, chave: chaves.MUNICIPIO, valor: municipio, tipo: tipos_busca.SIMPLIFICADA, mensagem, processo});

        logRequisicao(log)
            .then(() => procuraTipologiasMunicipioUF(uf, municipio))
            .then(tipologias => agrupaEFiltraDuplicados(tipologias))

            .then(tipologias => res.status(200).send(tipologias))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
};

export let getMunicioUF = function (req: Request, res: Response) {
    let uf = req.params.uf;
    let municipio = req.query.municipio as string;
    const nomeFuncao = getNomeFuncao(1,1);

    if (uf && municipio) {
        procuraMunicioUF(uf, municipio)
            .then(municipios => agrupaEFiltraDuplicados(municipios, []))
            .then(municipios => desagrupa(municipios))

            .then(municipios => res.status(200).send(municipios))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
