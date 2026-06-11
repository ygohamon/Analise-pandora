import * as amadorModel from '../../models/amador';

import {
    filtraNaoEncontrados,
    trataRequisicaNome,
    toTextSearch,
    print,
    limpaNumero
} from './../../utils';

export let procuraAmadorDetalhadoCPF = function (cpf: string){
    cpf = limpaNumero(cpf);

    return Promise.all([
        amadorModel.getAmadorCPF_CORTEX(cpf)
    ])

        .then(amador => filtraNaoEncontrados(amador))
}

// export let procuraObitoSimplificadoNome = function (nome: string){
//     const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

//     return Promise.all([
//         obitoModel.getObitoSimplificadoNome_BD_SISOBI(nomeTextSearch)
//     ])

//         .then(obitos => filtraNaoEncontrados(obitos))
// }
