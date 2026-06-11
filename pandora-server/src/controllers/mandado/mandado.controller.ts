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
    procuraMandadosCPF
} from './mandado.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.MANDADO.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.MANDADO.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getMandadosCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if(validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraMandadosCPF, cpf, cpfUsuario)
            .then(mandados => res.status(200).send(mandados))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
