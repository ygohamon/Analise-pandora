import * as boletimocorrenciaModel from '../../models/boletim_ocorrencia';
import { filtraNaoEncontrados, limpaNumero, print } from './../../utils';

export let procuraBoletimOcorrenciaPorCPF = function (cpf: string){
  cpf = limpaNumero(cpf);

  return Promise.all([
    boletimocorrenciaModel.getBoletimOcorrenciaCPF_CODATA(cpf),
  ])
    .then(dados => print(dados, 'procuraboletim'))
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraDadosDelegacia = function (departamento: string){

  return Promise.all([
    boletimocorrenciaModel.getDadosDelegaciaDepartamento_CODATA(departamento)
  ])
    .then(dados => filtraNaoEncontrados(dados))
}
