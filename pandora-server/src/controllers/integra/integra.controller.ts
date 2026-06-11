import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';
import * as logModel from '../../models/log';
import * as integraModel from '../../models/_apps/integra';
import * as utilsModel from '../../models/utils/utils.model';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    logRequisicao,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_MSGS,
    LOG_SECOES,
} from '../../config';
import { procuraRequisicoesIntegra, procuraPromotoriasMPPB } from './integra.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.INTEGRA.NOME;
// const chaves = LOG_SECOES.APPS.ITENS.INTEGRA.CHAVES;
// const tipos_busca = LOG_TIPOS_BUSCA;

export let cadastraRequisicaoIntegra = function (req: any, res: Response){
    let requisicao  = req.body;
    let listaAnexos = req.files;
    const nomeFuncao = getNomeFuncao(1,1);

    if (requisicao){
        const mensagem = LOG_MSGS.INTEGRA_LISTA_REQUISICOES;
        const log      = new NovoLog({req, secao, item, mensagem});

        logRequisicao(log)
            .then(() => Promise.all([integraModel.insereRequisicao(requisicao)]))
            .then(idRequisicao => {
                JSON.parse(requisicao.listaImovel).forEach(imovel => integraModel.insereImovel(imovel, idRequisicao));
                return idRequisicao;
            })
            .then(idRequisicao => {
                JSON.parse(requisicao.listaVeiculo).forEach(veiculo => integraModel.insereVeiculo(veiculo, idRequisicao));
                return idRequisicao;
            })
            .then(idRequisicao => {
                JSON.parse(requisicao.listaPF).forEach(pf => integraModel.inserePF(pf, idRequisicao));
                return idRequisicao;
            })
            .then(idRequisicao => {
                JSON.parse(requisicao.listaPJ).forEach(pj => integraModel.inserePJ(pj, idRequisicao));
                return idRequisicao;
            })
            .then(idRequisicao => {
                listaAnexos.forEach(anexo => integraModel.insereAnexo(anexo, idRequisicao));
                return idRequisicao;
            })
            // .then(() => mailer.send({
            //     template: 'services/mail',
            //     message: {
            //         to: 'augustovanucci@gmail.com'
            //     },
            //     locals: requisicao
            // }))
            // .then()
            .then(() => res.status(200).send({status: API_CODES.CODE_SUCESSO,  msg: 'Requisição cadastrada com sucesso.'}))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let listaRequisicoesIntegra = function (req: Request, res: Response){
    const mensagem = LOG_MSGS.INTEGRA_LISTA_REQUISICOES;
    const log      = new NovoLog({req, secao, item, mensagem});
    const nomeFuncao = getNomeFuncao(1,1);

    cf(log, procuraRequisicoesIntegra)
        .then(requisicoes => res.status(200).send(requisicoes))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let finalizaRequisicoesIntegra = function (req: Request, res: Response){
    let id = req.params.id;
    const nomeFuncao = getNomeFuncao(1,1);

    if (id) {
        const mensagem = LOG_MSGS.INTEGRA_FINALIZA_REQUISICAO;
        const log = new NovoLog({req, secao, item, valor: id, mensagem});

        logRequisicao(log)
            .then(() => integraModel.finalizaRequisicao(id))
            .then(resultado => res.status(200).send(resultado))
            .catch(error => controllerError(res, error, nomeFuncao));

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let downloadAnexoRequisicoesIntegra = function (req: Request, res: Response){
    let idAnexo = req.params.id;
    const nomeFuncao = getNomeFuncao(1,1);

    if (idAnexo) {
        const mensagem = LOG_MSGS.INTEGRA_DOWNLOAD_REQUISICAO;
        const log      = new NovoLog({req, secao, item, mensagem, valor: idAnexo});

        logRequisicao(log)
            .then(() => integraModel.getAnexo(idAnexo))
            .then(anexo => {
                res.setHeader('Content-Length', anexo.tamanho);
                res.setHeader('Content-Type',   anexo.mime);
                res.setHeader('Content-Disposition', `'attachment; filename=${anexo.nomeArquivo}`);
                res.write(anexo.arquivo, 'binary');
                res.end();
            })
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPromotoriasMPPB = function (req: Request, res: Response){
    let promotoria = req.params.promotoria;
    const nomeFuncao = getNomeFuncao(1,1);

    if (promotoria) {
        cf(null, procuraPromotoriasMPPB, promotoria)
            .then(promotorias => res.status(200).send(promotorias))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
