import * as enderecoModel from '../../models/endereco';

import {
    filtraNaoEncontrados,
    toTextSearch,
    limpaNumero,
    filtraLogradouro
} from './../../utils';

export let procuraEnderecoSimplificadoCNPJ = function (cnpj: string, cpfUsuario: string){
  const _cnpj = limpaNumero(cnpj);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    enderecoModel.getEnderecoCNPJ_BD_Receita(_cnpj),
    enderecoModel.getEnderecoCNPJ_CORTEX(_cnpj, cpfUsuario),
    enderecoModel.getEnderecoCNPJ_ReceitaFull_PJ(_cnpj),
    enderecoModel.getEnderecoCNPJ_ReceitaNovo_PessoaJuridica(_cnpj),
    enderecoModel.getEnderecoCNPJ_Sispesquisa_Enderecos(_cnpj),
    enderecoModel.getEnderecoCNPJ_CREDILINK(_cnpj)
  ])
    .then(enderecos => filtraNaoEncontrados(enderecos))
}

export let procuraEnderecoSimplificadoCPF = function (cpf: string, cpfUsuario: string){
  const _cpf = limpaNumero(cpf);
  cpfUsuario = limpaNumero(cpfUsuario);

  return Promise.all([
    enderecoModel.getEnderecoCPF_CORTEX(_cpf, cpfUsuario),
    enderecoModel.getEnderecoCPF_BD_Receita(_cpf),
    enderecoModel.getEnderecoCPF_ReceitaFull_PF(_cpf),
    enderecoModel.getEnderecoCPF_ReceitaNovo_PessoaFisica(_cpf),
    enderecoModel.getEnderecoCPF_Sispesquisa_Enderecos(_cpf),
    enderecoModel.getEnderecoCPF_CREDILINK_PF(cpf)
  ])
    .then(enderecos => filtraNaoEncontrados(enderecos))
}

export let procuraEnderecoSimplificadoLogradouro = function (logradouro: string){
  const partes = logradouro.split('|');

  let _logradouro = (partes[0]) ? partes[0].trim() : null;
  let _numero     = (partes[1]) ? partes[1].trim() : null;
  let _municipio  = (partes[2]) ? partes[2].trim() : null;
  let _uf = (partes[3]) ? partes[3].trim().toUpperCase() : null;

  _logradouro = toTextSearch(filtraLogradouro(_logradouro));

  return Promise.all([
    enderecoModel.getEnderecoLogradouro_ReceitaNovo_PessoaFisica(_logradouro, _numero, _municipio),
    enderecoModel.getEnderecoLogradouro_ReceitaNovo_PessoaJuridica(_logradouro, _numero, _municipio),

    enderecoModel.getEnderecoLogradouro_BD_Receita_Pessoa_Fisica(_logradouro, _numero, _municipio),
    enderecoModel.getEnderecoLogradouro_BD_Receita_Pessoa_Juridica(_logradouro, _numero, _municipio),

    enderecoModel.getEnderecoPorEndereco_CREDILINK(_logradouro, _numero, _municipio, _uf)
  ])
    .then(enderecos => filtraNaoEncontrados(enderecos))
}
