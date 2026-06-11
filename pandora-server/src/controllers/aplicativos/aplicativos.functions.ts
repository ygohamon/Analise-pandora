import { Request, Response } from 'express';
import * as jwt from '../../services/auth/jwt.service';

import * as aplicativoModel from '../../models/aplicativoacesso';

import { filtraNaoEncontrados, print, criaRespostaAPI, logRequisicao, getNomeFuncao, controllerError } from './../../utils';
import { generateAppToken, decode } from './../../services/auth/jwt.service'
import { API_CODES, API_MSGS, LOG_CODES, LOG_SECOES } from '../../config';
import { NovoUsuario } from '../../models/schemas';
import { autenticaUsuario } from '../../services/auth/auth.service';
import { NovoLog } from '../../schemas/log.schema';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';

const secao = LOG_SECOES.SISTEMA.NOME;
const item = LOG_SECOES.SISTEMA.ITENS.USUARIO.NOME;

export let criarApp = function(app){
  var token = generateAppToken(app)
  return aplicativoModel.criarNovoAppAutorizado(app.nome, app.dataInicio, app.dataExpiracao, token, app.ativo)
}

export let atualizarApp = function(app){
  return aplicativoModel.atualizarAppAutorizado(app.id, app.dataInicio, app.dataExpiracao, app.ativo);
}

export let validaApp = function(token){
  return aplicativoModel.getAplicativosByToken(token).then(result => {
    try{
      if (result?.resultado?.dados[0]){
        var app = result?.resultado?.dados[0]
        var datahoje = new Date()
        var dtInicio = new Date(app.dataInicio)
        let dtFim = null
        if (app.dataExpiracao)
          dtFim = new Date(app.dataExpiracao)
        var decodedApp = decode(token)['payload']['app'];
        return (decodedApp['nome'] == app.nome && app.ativo && dtInicio <= datahoje && (!dtFim || dtFim >= datahoje))
      }
    }catch(err){
      console.log(err)
    }
    return false
  })
}

export let listarApps = function(){
  return Promise.all([
    aplicativoModel.getAplicativosAutorizados()
  ])
}
