import * as model from '../../models/orcrim';

import { filtraNaoEncontrados } from '../../utils';

export let buscaOrganizacoesCriminosas_HIRI = function () {
  return Promise.all([
    model.getOrganizacaoCriminosas_HIRI(),
  ])
  .then(dados => filtraNaoEncontrados(dados));
}

export let buscaDadosOrganizacaoCriminosa = async function (orcrim: string) {

  return await Promise.all([
      model.getDadosOrganizacaoCriminosa_HIRI(orcrim),
      model.getMembrosOrganizacaoCriminosa(orcrim),
      model.getQuantidadeMembrosFaccaoPorUnidadePrisional(orcrim),
      model.getAdvogadosInternosOrganizacaoCriminosa(orcrim),
      model.getTopAdvogadosFaccionados(orcrim),
      model.getTopVisitasFaccionados(orcrim)
    ])
    .then(dados => filtraNaoEncontrados(dados))
}
