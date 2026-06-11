import * as imovelModel from '../../models/imovel';

import {
    filtraNaoEncontrados,
    print,
    limpaNumero
} from './../../utils';

export let procuraImoveisCPF = function (cpf: string){
    cpf = limpaNumero(cpf);

    return Promise.all([
        imovelModel.getMovelDetalhadoCPF_BD_ITBI(cpf),
        imovelModel.getImovelCPFAdquirente_BD_DOI(cpf),
        imovelModel.getImovelCPFAlienante_BD_DOI(cpf),
    ])

        .then(dados => filtraNaoEncontrados(dados))
}

export let procuraImoveisCNPJ = function (cnpj: string){
    cnpj = limpaNumero(cnpj);

    return Promise.all([
        imovelModel.getMovelDetalhadoCNPJ_BD_ITBI(cnpj),
        imovelModel.getImovelCNPJAdquirente_BD_DOI(cnpj),
        imovelModel.getImovelCNPJAlienante_BD_DOI(cnpj),
    ])

        .then(dados => filtraNaoEncontrados(dados))
}
