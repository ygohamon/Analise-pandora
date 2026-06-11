import { Request, Response } from 'express';
import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    agrupaEFiltraDuplicados,
    validaCNPJ,
    logRequisicao,
    controllerError,
    getNomeFuncao,
    validaUF,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    procuraTabelaGeralPainelCovid,
} from './painelcovid.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.PAINELCOVID.NOME;
const chaves = LOG_SECOES.APPS.ITENS.PAINELCOVID.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTabelaGeralPainelCovidUF = function (req: Request, res: Response) {
  const uf = req.params.uf;
  const nomeFuncao = getNomeFuncao(1,1);

  if (validaUF(uf)) {
    const log = new NovoLog({req, secao, item, chave: chaves.UF, valor: uf, tipo: tipos_busca.DETALHADA})

    logRequisicao(log)
      .then(() => procuraTabelaGeralPainelCovid(uf))
      .then(dados => agrupaEFiltraDuplicados(dados))

      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
