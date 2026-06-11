import { Request, Response } from 'express';
import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    agrupaEFiltraDuplicados,
    validaCNPJ,
    logRequisicao,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    getInformacoesEmpresa,
} from './dna.functions';


const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.DNA.NOME;
const chaves = LOG_SECOES.APPS.ITENS.DNA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getEmpresaDetalhadoCNPJ = function (req: Request, res: Response) {
    let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)) {

        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

        logRequisicao(log)
            .then(() => getInformacoesEmpresa(cnpj))
            .then(empresas => agrupaEFiltraDuplicados(empresas))
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
