import * as tipologiaModel from '../../models/tipologia';

import {
    filtraNaoEncontrados,
    print,
    limpaNumero
} from './../../utils';

export let procuraTipologiaSimplificadoCPF = function (cpf: string){
    cpf = limpaNumero(cpf);
 
    return Promise.all([
        tipologiaModel.getTipologiaSimplificadoCPF_Tipologias(cpf)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraTipologiaSimplificadoCNPJ = function (cnpj: string){
    cnpj = limpaNumero(cnpj);
 
    return Promise.all([
        tipologiaModel.getTipologiaSimplificadoCNPJ_Tipologias(cnpj)
    ])

        .then(dados => filtraNaoEncontrados(dados))
}