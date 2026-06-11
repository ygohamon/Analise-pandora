import {
    Request,
    Response
} from 'express';

import {
    criaRespostaAPI,
    print,
    controllerFactory as cf,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
  procuraOrgaoMunicipalEstadual,
  procuraUGestoraMunicipalEstadual
} from './utils.functions';

import { API_CODES, API_MSGS } from './../../config';

export let getOrgaoMunicipalEstadual = function (req: Request, res: Response) {
  const orgao      = req.query.orgao;
  const nomeFuncao = getNomeFuncao(1,1);

  if (orgao && orgao.length > 0) {
    cf(null, procuraOrgaoMunicipalEstadual, orgao)
      .then(orgaos => res.status(200).send(orgaos))
      .catch(error => controllerError(res, error, nomeFuncao));

  } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getUgestoraMunicipalEstadual = function (req: Request, res: Response) {

  const ugestora   = req.query.ugestora;
  const nomeFuncao = getNomeFuncao(1,1);

  if (ugestora && ugestora.length > 0) {
    cf(null, procuraUGestoraMunicipalEstadual, ugestora)
      .then(orgaos => res.status(200).send(orgaos))
      .catch(error => controllerError(res, error, nomeFuncao));

  } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}
