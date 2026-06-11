import {
    Request,
    Response
} from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    validaCNPJ,
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
    procuraEmbarcacaoCNPJ,
    procuraEmbarcacaoCPF,
    procuraEmbarcacaoInscricao,
    procuraEmbarcacaoNome
} from './embarcacoes.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.EMBARCACAO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.EMBARCACAO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getEmbarcacoesCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraEmbarcacaoCPF, cpf, cpfUsuario)
            .then(embarcacoes => res.status(200).send(embarcacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmbarcacoesCNPJ = function (req: Request, res: Response){
    let cnpj = req.params.cnpj;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraEmbarcacaoCNPJ, cnpj, cpfUsuario)
            .then(embarcacoes => res.status(200).send(embarcacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmbarcacaoNome = function (req: Request, res: Response) {
    let embarcacao = req.params.embarcacao;
    let processo = req.query.processo;
    let cpfUsuario = <string>req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (!embarcacao){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.EMBARCACAO, valor: embarcacao, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraEmbarcacaoNome, embarcacao, cpfUsuario)
            .then(embarcacoes => res.status(200).send(embarcacoes))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getEmbarcacaoInscricao = function (req: Request, res: Response){
    let inscricao = req.params.inscricao;
    let processo = req.query.processo;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if(inscricao && inscricao.length > 1){
        const log = new NovoLog({req, secao, item, chave: chaves.INSCRICAO, valor: inscricao, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraEmbarcacaoInscricao, inscricao, cpfUsuario)
            .then(embarcacoes => res.status(200).send(embarcacoes))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
