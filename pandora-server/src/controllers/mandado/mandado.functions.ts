import * as model from '../../models/mandado';
import mandados from '../../routes/mandado.routes';

import {
  filtraNaoEncontrados,
  limpaNumero,
  toTextSearch
} from './../../utils';

export let procuraMandadosCPF = function (cpf: string, cpfUsuario: string){
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    model.getMandadoDetalhadoCPF_BNMP_CORTEX(cpf, cpfUsuario)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
