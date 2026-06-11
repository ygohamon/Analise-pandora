export * from './veiculo.model.sispesquisa.veiculos_19_07_2017';
export * from './veiculo.model.renavam_2020';
export * from './veiculo.model.ipva';
export * from './veiculo.model.detran';
export * from './veiculo.model.cortex';



export let fixVeiculoCPF_CNPJ = function (result){
  return result.map(registro => {
    registro.cpf = registro?.cpf?.trim();

    if (registro.cpf.length === 11){
      return registro;
    } else {
      registro.cnpj = registro.cpf;
      delete registro.cpf;

      return registro;
    }
  });
}


export let fixCpfCnpj = function (dados, chave='cpf_cnpj'){
  return dados.map(dado => {
    const tmp = dado[chave].trim();
    delete dado[chave];

    if (tmp.length === 11) {
      dado['cpf'] = tmp;
    } else if (tmp.length === 14) {
      dado['cnpj'] = tmp;
    } else {
      dado[chave] = tmp;
    }

    return dado;
  })
}
