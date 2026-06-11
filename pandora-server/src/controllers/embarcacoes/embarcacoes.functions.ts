import * as model from '../../models/embarcacao';
import embarcacoes from '../../routes/embarcacoes.routes';

import {
  filtraNaoEncontrados,
  limpaNumero,
  toTextSearch
} from './../../utils';

export let procuraEmbarcacaoCPF = function (cpf: string, cpfUsuario: string){
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    model.getEmbarcacaoCPF_BD_Embarcacao_RE(cpf),
    model.getEmbarcacaoDetalhadoCPF_BD_Embarcacao_Embarcacao(cpf),
    model.getEmbarcacaoCPF_CORTEX(cpf, cpfUsuario),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraEmbarcacaoCNPJ = function (cnpj: string, cpfUsuario: string){
  cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    model.getEmbarcacaoCNPJ_BD_Embarcacao_RE(cnpj),
    model.getEmbarcacaoDetalhadoCNPJ_BD_Embarcacao_Embarcacao(cnpj),
    model.getEmbarcacaoCNPJ_CORTEX(cnpj, cpfUsuario),
  ])
    .then(dados => filtraNaoEncontrados(dados))
}

export let procuraEmbarcacaoNome = function (embarcacao: string, cpfUsuario: string){
  embarcacao = embarcacao.replace(/[^\w\s]/gi, '');
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    model.getEmbarcacaoDetalhadoNome(embarcacao),
    model.getEmbarcacaoNome_CORTEX(embarcacao, cpfUsuario),
  ]).then(dados => filtraNaoEncontrados(dados));

}

export let procuraEmbarcacaoInscricao = function (inscricao: string, cpfUsuario: string){
  inscricao = inscricao.replace(/[^0-9a-zA-Z]/g, '');
  cpfUsuario = limpaNumero(cpfUsuario);

  return  Promise.all([
    model.getEmbarcacaoNumero_CORTEX(inscricao, cpfUsuario),
    model.getEmbarcacaoDetalhadoNumeroInscricao(inscricao)
  ]).then(dados => filtraNaoEncontrados(dados));
}

