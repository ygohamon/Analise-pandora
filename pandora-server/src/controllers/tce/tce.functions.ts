import * as tceModel from '../../models/tce';
import { filtraNaoEncontrados, limpaNumero, print } from './../../utils';

export let procuraTCE_ContaBancaria = function (data: Date){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = String(data.getFullYear());

  return Promise.all([
    tceModel.getTCE_ContaBancaria(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_Empenho = function (data){

  data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_Empenho(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_EmpenhoAnulacao = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_EmpenhoAnulacao(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_EmpenhoSuplementacao = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_EmpenhoSuplementacao(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_Licitacao = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_Licitacao(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_Pagamento = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_Pagamento(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoAnulado = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoAnulado(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoExtraOcamentario = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoExtraOrcamentario(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoOrcamentario = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoOrcamentario(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoOrcamentarioAnulado = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoOrcamentarioAnulado(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoRestituicaoReceita = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoRestituicaoReceita(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoRestosPagar = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoRestosPagar(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTCE_PagamentoRetencao = function (data){

    data = new Date(data);
    var dia = String(data.getDate()).padStart(2, '0');
    var mes = String(data.getMonth() + 1).padStart(2, '0');
    var exercicio = data.getFullYear();

  return Promise.all([
    tceModel.getTCE_PagamentoRetencao(exercicio, mes, dia),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}