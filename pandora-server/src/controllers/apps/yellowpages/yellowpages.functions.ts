import {
  getDadosYellowPagesCNPJ,
  getDadosYellowPagesRazaoSocial
} from '../../../models/_apps/yellowpages/yellowpages.model';

import {
  filtraNaoEncontrados,
  limpaNumero
} from '../../../utils';

export let procuraDadosYellowPagesRazaoSocial = function (razaoSocial: string) {

  return Promise.all([
    getDadosYellowPagesRazaoSocial(razaoSocial),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosYellowPagesCNPJ = function (cnpj: string) {
  const _cnpj = limpaNumero(cnpj);

  return Promise.all([
    getDadosYellowPagesCNPJ(_cnpj),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
