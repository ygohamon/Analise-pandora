import {
  getRegistrosPeriodoPlaca_CORTEX,
  getUltimosRegistrosPlaca_CORTEX
} from '../../../models/_apps/ondeandei';

import {
  filtraNaoEncontrados,
  getTime,
  limpaNumero
} from '../../../utils';

export let procuraUltimosRegistrosPlaca = function (placa: string, cpfUsuario: string) {

  return Promise.all([
    getUltimosRegistrosPlaca_CORTEX(placa, cpfUsuario),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraRegistrosPeriodoPlaca = function (placa: string, dataInicial: string, dataFinal: string, cpfUsuario: string) {
  cpfUsuario = limpaNumero(cpfUsuario);

  if (!dataFinal) {
    dataFinal = getTime();
  }

  return Promise.all([
    getRegistrosPeriodoPlaca_CORTEX(placa, dataInicial, dataFinal, cpfUsuario),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
