import {
    Request,
    Response
} from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    trataRequisicaNome,
    controllerFactory as cf,
    validaCNPJ,
    validaCPF,
    limpaNumero,
    getNomeFuncao,
    controllerError,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraVeiculoDetalhadoCNPJ,
    procuraVeiculoDetalhadoCPF,
    procuraVeiculoDetalhadoNome,
    procuraVeiculoDetalhadoChassi,
    procuraVeiculoDetalhadoPlaca,
    procuraVeiculoDetalhadoRenavam,

} from './veiculos.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.VEICULO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.VEICULO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getVeiculoDetalhadoCNPJ = function (req: Request, res: Response){
    let cnpj = req.params.cnpj;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoCNPJ, cnpj, cpfUsuario)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getVeiculoDetalhadoCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoCPF, cpf, cpfUsuario)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getVeiculoDetalhadoNome = function (req: Request, res: Response){
    let nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoNome, nome)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getVeiculoDetalhadoChassi = function (req: Request, res: Response){
    let chassi = req.params.chassi;
    chassi = chassi.replace(/[^0-9a-zA-Z]/g,'');
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(chassi && chassi.length > 1){
        const log = new NovoLog({req, secao, item, chave: chaves.CHASSI, valor: chassi, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoChassi, chassi)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getVeiculoDetalhadoPlaca = function (req: Request, res: Response){
    let placa = req.params.placa;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    placa = placa.replace(/[^0-9a-zA-Z_%]/g,'');
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(placa && placa.length > 1){
        const log = new NovoLog({req, secao, item, chave: chaves.PLACA, valor: placa, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoPlaca, placa, cpfUsuario)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getVeiculoDetalhadoRenavam = function (req: Request, res: Response){
    let renavam = limpaNumero(req.params.renavam);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(renavam && renavam.length === 11){
        const log = new NovoLog({req, secao, item, chave: chaves.RENAVAM, valor: renavam, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraVeiculoDetalhadoRenavam, renavam)
            .then(veiculos => res.status(200).send(veiculos))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
