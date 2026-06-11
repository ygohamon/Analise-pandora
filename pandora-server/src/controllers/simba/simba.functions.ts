

import * as simbaModel from './../../models/_apps/simba';

import {
    filtraNaoEncontrados,
} from './../../utils';

export let procuraTopCPF = function (cpf: string) {
    
    return Promise.all([
        simbaModel.getTopDadosBancariosCPF(cpf)
    ])
        .then(dados => filtraNaoEncontrados(dados))
        
}

export let procuraTopCNPJ = function (cnpj: string) {
    return Promise.all([
        simbaModel.getTopDadosBancariosCNPJ(cnpj)
    ])
        .then(dados => filtraNaoEncontrados(dados))
        
}
