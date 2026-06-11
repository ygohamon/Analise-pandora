import * as _ from 'underscore';

import * as nepotismoModel from './../../models/_apps/nepotismo';

import {
  filtraNaoEncontrados,
  limpaNumero,
} from './../../utils';

export let procuraNepotismoUgestora = function (ugestora: string, cdugestora: string, esfera: string, ano: string) {
  return Promise.all([
    nepotismoModel.getNepotismoUgestoraEsferaAno(ugestora, cdugestora, esfera, ano),
  ])
    .then(tipologias => filtraNaoEncontrados(tipologias))
}

export let procuraNepotismoCPF = function (cpf: string, ano: string) {
  const _cpf = limpaNumero(cpf);

  return Promise.all([
    nepotismoModel.getNepotismoCPFAno(_cpf, ano)
  ])
    .then(tipologias => filtraNaoEncontrados(tipologias))
}
