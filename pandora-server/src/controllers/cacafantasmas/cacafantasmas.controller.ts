import {
    Request,
    Response
} from 'express';

import * as moment from 'moment';

import {
    NovoLog
} from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    print,
    limpaNumero,
    getNomeFuncao,
    controllerError
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraTipologiasAnalise,
    procuraOrgaoSagresMunicipal,
    tipoValido,
} from './cacafantasmas.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.CACAFANTASMAS.NOME;
const chaves = LOG_SECOES.APPS.ITENS.CACAFANTASMAS.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTipologiasCacafantasmasUgestora = function (req : Request, res : Response){
    let cdugestora = limpaNumero(req.params.cdugestora);
    const nomeFuncao = getNomeFuncao(1,1);

    let tipoAnalise = req.query.tipoanalise as string;
    let processo    = req.query.processo;
    let dtinicio    = req.query.dtinicio;
    let dtfim       = req.query.dtfim;

    if (cdugestora && cdugestora.length === 6 && tipoValido(tipoAnalise)) {
        if (!dtinicio) { dtinicio = '201601'; }
        if (!dtfim) { dtfim = moment().format('YYYYMM'); }

        const mensagem = `${dtinicio}-${dtfim}`;
        const log = new NovoLog({req, secao, item, chave: chaves.UGESTORA, valor: cdugestora, tipo: tipoAnalise, mensagem, processo});

        cf(log, procuraTipologiasAnalise, cdugestora, dtinicio, dtfim, tipoAnalise)
            .then(tipologias => res.status(200).send(tipologias))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getOrgaoSagresMunicipal = function (req : Request, res : Response){
    let orgao = req.params.orgao;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (orgao && orgao.length > 0) {
        cf(null, procuraOrgaoSagresMunicipal, orgao)
            .then(orgaos => res.status(200).send(orgaos))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
