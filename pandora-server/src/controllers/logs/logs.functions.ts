import * as logModel from '../../models/log';

import {
    filtraNaoEncontrados,
    print
} from './../../utils';

export let procuraLogs = function (quantidade: number, offset: number){

    return Promise.all([
        logModel.getLogs(quantidade, offset),
    ])
        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTokensValidos = function (){

    return Promise.all([
        logModel.getTokensValidos(),
    ])
        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraRegistrosNaoEncontrados = function (){

    return Promise.all([
        logModel.getCNPJsNaoEncontrados(),
        logModel.getCPFsNaoEncontrados()
    ])
        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraRankings = function (req){

  let tipoRanking   = req.query.ranking;
  let parametroBusca = req.query.parametro;
  let duracao   = req.query.duracao;
  let top       = req.query.top;

  let quantidade = req.query.quantidade;
  let offset     = req.query.offset;

  if (!quantidade) { quantidade = 100; }
  if (!offset) { offset = 0; }

  let resposta;
  if (tipoRanking === 'pesquisa'){
    if(parametroBusca === 'cpf') {
      resposta = Promise.all([logModel.getCPFsMaisPesquisados_Pesquisa(duracao, top)]);
    } else if (parametroBusca === 'cnpj') {
      resposta = Promise.all([logModel.getCNPJsMaisPesquisados_Pesquisa(duracao, top)]);
    } else if (parametroBusca === 'geral') {
      resposta = Promise.all([logModel.getValoresMaisPesquisados_Pesquisa(duracao, top)]);
    }
  } else if (tipoRanking === 'relacionamentos') {
    resposta = Promise.all([logModel.getLogs(quantidade, offset)]);
  } else if (tipoRanking === 'uso'){
    resposta = Promise.all([logModel.getRankingUso(duracao, top)]);
  }

  return resposta
    .then(dados => filtraNaoEncontrados(dados))
}

export let getLogsPorUsuario = function (usuario: string) {
  return Promise.all(
    [
      logModel.getLogsPorUsuario(usuario)
    ])
    .then(logs => filtraNaoEncontrados(logs));
}
