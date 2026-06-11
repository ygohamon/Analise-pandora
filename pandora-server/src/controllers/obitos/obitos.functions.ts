import * as obitoModel from '../../models/obito';

import {
    filtraNaoEncontrados,
    trataRequisicaNome,
    toTextSearch,
    print,
    limpaNumero
} from './../../utils';

export let procuraObitoDetalhadoCPF = function (cpf: string, cpfUsuario: string){
    cpf = limpaNumero(cpf);
    cpfUsuario = limpaNumero(cpfUsuario);

    return Promise.all([
        obitoModel.getObitoDetalhadoCPF_BD_SISOBI(cpf),
        obitoModel.getObitosCPF_CORTEX(cpf, cpfUsuario)
    ])
    .then(obitos => filtraNaoEncontrados(obitos))
}

export let procuraObitoSimplificadoCPF = function (cpf: string, cpfUsuario: string){
    cpf = limpaNumero(cpf);
    cpfUsuario = limpaNumero(cpfUsuario);

    return Promise.all([
        obitoModel.getObitoSimplificadoCPF_BD_SISOBI(cpf),
        obitoModel.getObitosCPF_CORTEX(cpf, cpfUsuario),
        obitoModel.getObitoCPF_CREDILINK(cpf)
    ])
    .then(obitos => filtraNaoEncontrados(obitos))
}

export let procuraObitoSimplificadoNome = function (nome: string){
    const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

    return Promise.all([
        obitoModel.getObitoSimplificadoNome_BD_SISOBI(nomeTextSearch)
    ])
    .then(obitos => filtraNaoEncontrados(obitos))
}
