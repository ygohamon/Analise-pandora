import * as folhapagamentoModel from '../../models/folhapagamento';
import { filtraNaoEncontrados } from './../../utils';

export let procuraFolhaMunicipalCdOrgaoMesAno = function (cdorgao, orgao, mes, ano){

  return Promise.all([
    folhapagamentoModel.getFolhaMunicipalMesAnoCdOrgao(cdorgao, orgao, mes, ano)
  ])

    .then(folha => filtraNaoEncontrados(folha))
}

export let procuraFolhaEstadualCdOrgaoMesAno = function (cdorgao, orgao, mes, ano){

  return Promise.all([
    folhapagamentoModel.getFolhaEstadualMesAnoCdOrgao(cdorgao, orgao, mes, ano)
  ])

    .then(folha => filtraNaoEncontrados(folha))
}
