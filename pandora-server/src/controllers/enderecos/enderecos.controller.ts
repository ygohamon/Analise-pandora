import {
    Request,
    Response
} from 'express';

import * as enderecoModel from './../../models/endereco';
import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    validaCNPJ,
    controllerFactory as cf,
    validaCPF,
    limpaNumero,
    logRequisicao,
    agrupaEFiltraDuplicados,
    desagrupa,
    limitaNumeroResultados,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    API_CONFIG,
    API_CODES,
    API_MSGS,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraEnderecoSimplificadoCNPJ,
    procuraEnderecoSimplificadoCPF,
    procuraEnderecoSimplificadoLogradouro
} from './enderecos.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.ENDERECO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.ENDERECO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getEnderecoSimplificadoCNPJ = function (req : Request, res : Response){
    let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    let cpfUsuario = req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEnderecoSimplificadoCNPJ, cnpj, cpfUsuario)
            .then(enderecos => res.status(200).send(enderecos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEnderecoSimplificadoCPF = function (req : Request, res : Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEnderecoSimplificadoCPF, cpf, cpfUsuario)
            .then(enderecos => res.status(200).send(enderecos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEnderecoSimplificadoLogradouro = function (req : Request, res : Response){
    let logradouro = req.params.logradouro;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (logradouro){
        const log = new NovoLog({req, secao, item, chave: chaves.LOGRADOURO, valor: logradouro, tipo: tipos_busca.SIMPLIFICADA, processo})

        // cf(log, procuraEnderecoSimplificadoLogradouro, logradouro)
        logRequisicao(log)
            .then(() => procuraEnderecoSimplificadoLogradouro(logradouro))
            .then(dados => agrupaEFiltraDuplicados(dados))
            .then(dados => desagrupa(dados))
            .then(dados => limitaNumeroResultados(dados))
            .then(enderecos => res.status(200).send(enderecos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let setEnderecoCPFSimplificado = function (req : Request, res : Response){
    let form = req.body;
    let cpf = form.cpf;
    let cep = form.cep;
    const nomeFuncao = getNomeFuncao(1,1);

    cpf = limpaNumero(cpf);
    cep = limpaNumero(cep);

    if (validaCPF(cpf)){
        const fonte = `OP${(new Date()).getFullYear()}`;

        const secao = LOG_SECOES.CADASTRO.NOME;
        const item  = LOG_SECOES.CADASTRO.ITENS.ENDERECO.NOME;
        const chaves = LOG_SECOES.CADASTRO.ITENS.ENDERECO.CHAVES;

        const endereco = {
            cpf: cpf,
            logradouro: form.logradouro,
            numeroLogradouro: form.numeroLogradouro,
            complemento: form.complemento,
            bairro: form.bairro,
            cep: cep,
            municipio: form.municipio,
            uf: form.uf,
            fonte: fonte
        };

        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, mensagem: JSON.stringify(endereco)})

        logRequisicao(log)
            .then(() => enderecoModel.insertEnderecoCPF_Sispesquisa_Enderecos(endereco))

            .then(resultado => res.status(200).send(resultado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
