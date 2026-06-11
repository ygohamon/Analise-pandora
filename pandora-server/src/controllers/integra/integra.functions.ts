import * as integraModel from '../../models/_apps/integra';

import {
    filtraNaoEncontrados,
} from './../../utils';

export let procuraRequisicoesIntegra = function (){

  return Promise.all([
    integraModel.getRequisicoes()
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraPromotoriasMPPB = function (promotoria: string){

  return Promise.all([
    integraModel.getPromotoriasMPPB_Integra_Promotorias(promotoria)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
