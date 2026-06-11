import { NextFunction, Request, Response } from "express"
import { API_CONFIG, API_CODES, API_MSGS, LOG_CODES, LOG_MSGS, LOG_SECOES, LOG_TIPOS  } from "../../config";
import { getModelConfig } from "../../config.models";
import { getCPFUsuario_BD_Pandora } from "../../models/usuario";
import { criaRespostaAPI, getId_Token, logRequisicao } from "../../utils";
import { NovoLog } from '../../schemas/log.schema';

const config = getModelConfig('WEBSERVICE_CORTEX');

export let getUserData = (req: Request, res: Response, next: NextFunction) => {
  let token = req.body?.token || req.headers['token'] || req.headers['Authorization'] || req.headers['authorization'];
  let isTest = API_CONFIG.CFG_ENV === 'test' && req.query.test === 's' ? true : false;
  let userId = getId_Token(token);


  if (isTest) {
    req.headers['cpf-usuario'] = config.get('CORTEX_CPF_USUARIO');
    next();
  } else if (userId) {
    getCPFUsuario_BD_Pandora(userId).then(function(result) {
      let { dados } = result.resultado;
      req.headers['cpf-usuario'] = dados[0].cpf ?? config.get('CORTEX_CPF_USUARIO');
      next();
    });
  } else {
    // Usuário com cadastro incompleto
    const log = new NovoLog({
      req,
      secao: LOG_SECOES.SISTEMA.NOME,
      code: API_CODES.CODE_CADASTRO_INCOMPLETO,
      mensagem: API_MSGS.MSG_USUARIO_CADASTRO_INCOMPLETO,
    });

    logRequisicao(log, true).then(() =>
      res.status(401).send(criaRespostaAPI(API_CODES.CODE_CADASTRO_INCOMPLETO, API_MSGS.MSG_USUARIO_CADASTRO_INCOMPLETO))
    );
  }
}
