import { Request, Response } from "express";
import { API_CODES, API_MSGS, LOG_SECOES, LOG_TIPOS_BUSCA } from "../../config";
import { NovoLog } from "../../schemas/log.schema";
import { agrupaEFiltraDuplicados, controllerError, criaRespostaAPI, getNomeFuncao, logRequisicao, validaCPF, validaUF } from "../../utils";

import { getDadosDetalhamentoCPF_SADEP, getMandadosEmAbertoPorUF_SADEP } from './sadep.functions'

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.SADEP.NOME;
const chaves = LOG_SECOES.APPS.ITENS.SADEP.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

/**
 *
 * @param req Request
 * @param res Response
 * @returns
 */
export let getMandadosEmAbertoPorUF = function (req: Request, res: Response) {
  let { uf } = req.params;
  let processo = req.query.processo ?? null;

  const nomeFuncao = getNomeFuncao(1, 1);

  if (validaUF(uf)) {
    const log = new NovoLog({req, secao, item, chave: chaves.UF ,valor: uf, tipo: tipos_busca.SIMPLIFICADA, processo});

    logRequisicao(log)
      .then(() => getMandadosEmAbertoPorUF_SADEP(uf))
      .then(mandados => agrupaEFiltraDuplicados(mandados))
      .then(mandados => res.status(200).send(mandados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }

}

/**
 *
 * @param req Request
 * @param res Response
 */
export let getDadosDetalhamentoCPF = function (req: Request, res: Response) {
  let { cpf } = req.params;
  let processo = req.query.processo ?? null;

  const nomeFuncao = getNomeFuncao(1, 1);

  if (validaCPF(cpf)) {
    const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo});

    logRequisicao(log)
      .then(() => getDadosDetalhamentoCPF_SADEP(cpf))
      .then(dados => agrupaEFiltraDuplicados(dados))
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
