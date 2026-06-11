import * as condenacaoModel from '../../models/processo';

import {
    filtraNaoEncontrados,
    print,
    limpaNumero
} from './../../utils';

export let procuraCondenacoesCPF = function (cpf: string){
    cpf = limpaNumero(cpf);

    return Promise.all([
        condenacaoModel.getCondenacaoTREPBCPF(cpf),
        condenacaoModel.getCondenacaoTRF5CPF(cpf)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraCondenacoesTRF5CPF = function (cpf: string){
    cpf = limpaNumero(cpf);

    return Promise.all([
        condenacaoModel.getCondenacaoTRF5CPF(cpf)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraCondenacoesTREPBCPF = function (cpf: string){
    cpf = limpaNumero(cpf);

    return Promise.all([
        condenacaoModel.getCondenacaoTREPBCPF(cpf)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}
