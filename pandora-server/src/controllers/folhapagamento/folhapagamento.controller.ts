import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    controllerFactory as cf,
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
    procuraFolhaMunicipalCdOrgaoMesAno,
    procuraFolhaEstadualCdOrgaoMesAno
} from './folhapagamento.functions';


const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.FOLHAPAGAMENTO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.FOLHAPAGAMENTO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getFolhaMunicipalCdOrgaoMesAno = function (req: Request, res: Response){
    const processo = req.query.processo;
    const cdorgao  = req.query.cdorgao;
    const orgao    = req.query.orgao;
    const mes      = req.query.mes;
    const ano      = req.query.ano;

    const nomeFuncao = getNomeFuncao(1,1);

    if (cdorgao && orgao && mes && ano){
        const valor = `${cdorgao} - ${orgao}`;
        const mensagem = `M${ano}${mes}`;
        const log = new NovoLog({req, secao, item, chave: chaves.UGESTORA_MES_ANO, valor, mensagem, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraFolhaMunicipalCdOrgaoMesAno, cdorgao, orgao, mes, ano)
            .then(folha => res.status(200).send(folha))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getFolhaEstadualCdOrgaoMesAno = function (req: Request, res: Response){
    const processo = req.query.processo;
    const cdorgao  = req.query.cdorgao;
    const orgao    = req.query.orgao;
    const mes      = req.query.mes;
    const ano      = req.query.ano;

    const nomeFuncao = getNomeFuncao(1,1);

    if (cdorgao && orgao && mes && ano){
        const valor = `${cdorgao} - ${orgao}`;
        const mensagem = `E${ano}${mes}`;
        const log = new NovoLog({req, secao, item, chave: chaves.UGESTORA_MES_ANO, valor, mensagem, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraFolhaEstadualCdOrgaoMesAno, cdorgao, orgao, mes, ano)
            .then(folha => res.status(200).send(folha))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
