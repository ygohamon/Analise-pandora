import * as veiculoModel from './../../models/veiculo';

import { filtraNaoEncontrados, trataRequisicaNome, toTextSearch, print, limpaNumero } from './../../utils';

export const procuraVeiculoDetalhadoCNPJ = function(cnpj: string, cpfUsuario: string = '') {
  cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoCNPJ_Renavam_2020(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_Sispesquisa_VeiculosNovo(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_IPVA(cnpj),
    veiculoModel.getVeiculoDetalhadoCNPJ_BD_Detran(cnpj),
    veiculoModel.getVeiculoDetalhadoProprietarioCNPJ_CORTEX(cnpj, cpfUsuario),
  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};

export const procuraVeiculoDetalhadoCPF = function(cpf: string, cpfUsuario: string = '') {
  cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoCPF_Sispesquisa_VeiculosNovo(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_Renavam_2020(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_IPVA(cpf),
    veiculoModel.getVeiculoDetalhadoCPF_BD_Detran(cpf),
    veiculoModel.getVeiculoDetalhadoProprietarioCPF_CORTEX(cpf, cpfUsuario),
  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};

export const procuraVeiculoDetalhadoNome = function(nome: string) {
  const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoNome_Sispesquisa_VeiculosNovo(nomeTextSearch),
    veiculoModel.getVeiculoDetalhadoNome_Renavam_2020(nomeTextSearch),
    veiculoModel.getVeiculoDetalhadoNome_IPVA(nomeTextSearch),
    veiculoModel.getVeiculoDetalhadoNome_BD_Detran(nomeTextSearch),
  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};

export const procuraVeiculoDetalhadoChassi = function(chassi: string) {
  chassi = chassi.replace(/[^0-9a-zA-Z]/g, '');

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoChassi_Sispesquisa_VeiculosNovo(chassi),
    veiculoModel.getVeiculoDetalhadoChassi_Renavam_2020(chassi),
    veiculoModel.getVeiculoDetalhadoChassi_IPVA(chassi),
    veiculoModel.getVeiculoDetalhadoChassi_BD_Detran(chassi),
  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};

export const procuraVeiculoDetalhadoPlaca = function(placa: string, cpfUsuario: string = '') {
  placa = placa.replace(/[^0-9a-zA-Z_%]/g, '');
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoPlaca_LIKE_BD_Detran(placa),
    veiculoModel.getVeiculoDetalhadoPlaca_LIKE_Sispesquisa_VeiculosNovo(placa),
    veiculoModel.getVeiculoDetalhadoPlaca_LIKE_IPVA(placa),
    veiculoModel.getVeiculoDetalhadoPlaca_LIKE_Renavam_2020(placa),
    veiculoModel.getVeiculoDetalhadoPlaca_CORTEX(placa, cpfUsuario),

  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};

export const procuraVeiculoDetalhadoRenavam = function(renavam: string) {
  renavam = renavam.replace(/[^0-9a-zA-Z]/g, '');

  return Promise.all([
    veiculoModel.getVeiculoDetalhadoRenavam_Sispesquisa_VeiculosNovo(renavam),
    veiculoModel.getVeiculoDetalhadoRenavam_Renavam_2020(renavam),
    veiculoModel.getVeiculoDetalhadoRenavam_IPVA(renavam),
    veiculoModel.getVeiculoDetalhadoRenavam_BD_Detran(renavam),
  ]).then(veiculos => filtraNaoEncontrados(veiculos));
};
