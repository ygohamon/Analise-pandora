import * as tipologiaModel from './../../models/tipologia';
import * as utilsModel from './../../models/utils/utils.model';

import {
    filtraNaoEncontrados,
} from './../../utils';

export let procuraTipologiasMunicipioUF = function (uf: string, municipio: string) {

  return Promise.all([
    tipologiaModel.getTipologiaPJSimplificadoUFMunicipio_Tipologias(uf, municipio),
  ])
    .then(tipologias => filtraNaoEncontrados(tipologias))
}

export let procuraMunicioUF = function (uf: string, municipioParcial: string) {

  return Promise.all([
      utilsModel.getMunicipioUF_ReceitaNovo_UFMunicipio(uf, municipioParcial),
  ])
      .then(tipologias => filtraNaoEncontrados(tipologias))
}
