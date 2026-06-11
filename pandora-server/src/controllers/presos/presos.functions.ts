import * as presoModel from '../../models/preso';

import {
    trataRequisicaNome,
    toTextSearch,
    filtraNaoEncontrados,
    limpaNumero,
} from '../../utils';

import {
    API_CODES,
    API_CONFIG,
    LOG_CODES,
    LOG_MSGS
} from '../../config';

export let procuraPresoDetalhadoCPF = function (cpf) {
    cpf = limpaNumero(cpf);

    return Promise.all([
        presoModel.getPresoDetalhadoCPF_Sispesquisa_Prisional(cpf),
        presoModel.getPresoDetalhadoCPF_SDS_Prisional(cpf),
        presoModel.getPresoDetalhadoCPF_SISDEPEN(cpf),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoSimplificadoCPF = function (cpf) {
    cpf = limpaNumero(cpf);

    return Promise.all([
        presoModel.getPresoSimplificadoCPF_Sispesquisa_Prisional(cpf),
        presoModel.getPresoSimplificadoCPF_SDS_Prisional(cpf),
        presoModel.getPresoSimplificadoCPF_SISDEPEN(cpf),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoSimplificadoCNC = function (cnc) {
    cnc = limpaNumero(cnc);

    return Promise.all([
        presoModel.getPresoSimplificadoCNC_SISDEPEN(cnc),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoDetalhadoCNC = function (cnc) {
    cnc = limpaNumero(cnc);

    return Promise.all([
        presoModel.getPresoDetalhadoCNC_SISDEPEN(cnc),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoSimplificadoVulgo = function (vulgo) {

    return Promise.all([
        presoModel.getPresoSimplificadoVulgo_Sispesquisa_Prisional(vulgo),
        presoModel.getPresoSimplificadoVulgo_SDS_Prisional(vulgo),
        presoModel.getPresoSimplificadoVulgo_SISDEPEN(vulgo),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoSimplificadoNome = function (nome) {
    const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

    return Promise.all([
        presoModel.getPresoSimplificadoNome_Sispesquisa_Prisional(nomeTextSearch),
        presoModel.getPresoSimplificadoNome_SDS_Prisional(nomeTextSearch),
        presoModel.getPresoSimplificadoNome_SISDEPEN(nomeTextSearch),
    ])
        .then(presos => filtraNaoEncontrados(presos))
}

export let procuraPresoSimplificadoNomeMae = function (nome) {
    const nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

    return Promise.all([
        presoModel.getPresoSimplificadoNomeMae_Sispesquisa_Prisional(nomeTextSearch),
        //presoModel.getPresoSimplificadoNomeMae_SDS_Prisional(nomeTextSearch)
    ])
        .then(presos => filtraNaoEncontrados(presos))
}