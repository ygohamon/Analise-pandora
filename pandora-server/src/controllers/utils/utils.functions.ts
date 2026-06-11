import * as utilsModel from './../../models/utils/utils.model';

import { filtraNaoEncontrados } from './../../utils';

export let procuraOrgaoMunicipalEstadual = function (orgao: string) {
  return Promise.all([
    utilsModel.getOrgaoSagresMunicipalEstadual(orgao),
  ])

    .then(tipologias => filtraNaoEncontrados(tipologias))
}

export let procuraUGestoraMunicipalEstadual = function (orgao: string) {
  return Promise.all([
    utilsModel.getUGestoraSagresMunicipalEstadual(orgao),
  ])

    .then(tipologias => filtraNaoEncontrados(tipologias))
}
