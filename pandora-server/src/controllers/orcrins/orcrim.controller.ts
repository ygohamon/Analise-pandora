import { Request, Response } from 'express';

import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    controllerError,
    getNomeFuncao,
    logRequisicao,
    agrupaEFiltraDuplicados,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
  buscaOrganizacoesCriminosas_HIRI,
  buscaDadosOrganizacaoCriminosa
} from './orcrim.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.ORCRIM.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.ORCRIM.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

/**
 * Busca todas as Organizações Criminosas do HIRI
 * @param req Request
 * @param res Response
 */
export let getOrganizacoesCriminosas_HIRI = function (req: Request, res: Response) {
  let { processo } = req.body;
  const nomeFuncao = getNomeFuncao(1, 1);
  const log = new NovoLog({req, secao, item, tipo: tipos_busca.SIMPLIFICADA, processo});

  logRequisicao(log)
    .then(() => buscaOrganizacoesCriminosas_HIRI())
    .then(orcrins => agrupaEFiltraDuplicados(orcrins))
    .then(orcrins => res.status(200).send(orcrins))
    .catch(error => controllerError(res, error, nomeFuncao));
}

/**
 * Busca Pessoa e Interno simplificado por Nome.
 * @param req Request
 * @param res Response
 */
export let getDadosOrganizacoesCriminosas = function (req: Request, res: Response){
    let { orcrim, processo } = req.params;
    const nomeFuncao = getNomeFuncao(1, 1);

    if (!orcrim) {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }

    const log = new NovoLog({req, secao, item, chave: chaves.ORCRIM, valor: orcrim, tipo: tipos_busca.DETALHADA, processo});

    logRequisicao(log)
      .then( () => { return buscaDadosOrganizacaoCriminosa(orcrim)} )
      .then(resultados => agrupaEFiltraDuplicados(resultados))
      .then(dados => res.status(200).send(dados))
      .catch(error => controllerError(res, error, nomeFuncao));
}
