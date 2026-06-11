import * as empenhoModel from '../../models/empenho';
import { filtraNaoEncontrados, limpaNumero } from './../../utils';

export let procuraEmpenhosCNPJ = function (cnpj: string){
  cnpj = limpaNumero(cnpj);

  return Promise.all([
    empenhoModel.getEmpenhosDetalhadoCNPJ_BD_SAGRES_SE(cnpj),
    empenhoModel.getEmpenhoPagoDetalhadoCNPJ_BD_SAGRES_SE(cnpj),

    empenhoModel.getEmpenhosDetalhadoCNPJ_BD_SAGRES_SM(cnpj),
    empenhoModel.getEmpenhoPagoDetalhadoCNPJ_BD_SAGRES_SM(cnpj),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraEmpenhosCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    empenhoModel.getEmpenhosDetalhadoCPF_BD_SAGRES_SE(cpf),
    empenhoModel.getEmpenhoPagoDetalhadoCPF_BD_SAGRES_SE(cpf),

    empenhoModel.getEmpenhosDetalhadoCPF_BD_SAGRES_SM(cpf),
    empenhoModel.getEmpenhoPagoDetalhadoCPF_BD_SAGRES_SM(cpf),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
