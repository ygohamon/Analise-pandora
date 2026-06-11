import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
  procuraDadosLicitacoesCNPJ,
  procuraDadosLicitacoesCPF,
  procuraDadosLicitacoesDados,
} from './licitacoes.functions';

import {
    criaRespostaAPI,
    print,
    validaCNPJ,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
    validaCPF,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';


const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.LICITACAO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.LICITACAO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getLicitacoesCNPJ = function (req: Request, res: Response){
    let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraDadosLicitacoesCNPJ, cnpj)
            .then(licitacoes => res.status(200).send(licitacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getLicitacoesCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraDadosLicitacoesCPF, cpf)
            .then(licitacoes => res.status(200).send(licitacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getLicitacoesDadosLicitacao = function (req: Request, res: Response){

    const cdUgestora = req.query.cdugestora;
    const nuLicitacao = req.query.nulicitacao;
    const cdMdLicitacao = req.query.cdmdlicitacao;
    const processo = req.query.processo;

    const nomeFuncao = getNomeFuncao(1,1);

    if(cdUgestora && nuLicitacao && cdMdLicitacao){
        const valor = `${cdUgestora} - ${nuLicitacao} - ${cdMdLicitacao}`;
        const log = new NovoLog({req, secao, item, chave: chaves.DADOSLICITACAO, valor, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraDadosLicitacoesDados, cdUgestora, nuLicitacao, cdMdLicitacao)
            .then(licitacoes => res.status(200).send(licitacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
