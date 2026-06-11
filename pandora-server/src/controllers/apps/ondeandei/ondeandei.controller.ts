import { Request, Response } from 'express';
import { NovoLog } from '../../../schemas/log.schema';

import {
  criaRespostaAPI,
  controllerFactory as cf,
  controllerError,
  getNomeFuncao,
  validaCNPJ,
} from '../../../utils';

import {
  API_CODES,
  API_MSGS,
  LOG_SECOES,
  LOG_TIPOS_BUSCA
} from '../../../config';

import {
  procuraRegistrosPeriodoPlaca,
  procuraUltimosRegistrosPlaca
} from './ondeandei.functions';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.ONDEANDEI.NOME;
const chaves = LOG_SECOES.APPS.ITENS.ONDEANDEI.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let controllerRegistrosPeriodoVeiculo = function (req : Request, res : Response){
  const placa = req.params.placa;
  const dataInicial = req.query.dataInicial;
  const dataFinal   = req.query.dataFinal;
  const cpfUsuario  = req.headers['cpf-usuario'];
  const nomeFuncao = getNomeFuncao(1,1);

  if (!!placa) {

    if (!!dataInicial || !!dataFinal) {
      const log = new NovoLog({req, secao, item, chave: chaves.PLACA, valor: placa, mensagem: `REGISTROS PERIODO: ${dataInicial} - ${dataFinal}`})

      cf(log, procuraRegistrosPeriodoPlaca, placa, dataInicial, dataFinal, cpfUsuario)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    } else {
      const log = new NovoLog({req, secao, item, chave: chaves.PLACA, valor: placa, mensagem: 'ULTIMOS REGISTROS'})

      cf(log, procuraUltimosRegistrosPlaca, placa)
        .then(dados => res.status(200).send(dados))
        .catch(error => controllerError(res, error, nomeFuncao));
    }
  } else {
    res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
