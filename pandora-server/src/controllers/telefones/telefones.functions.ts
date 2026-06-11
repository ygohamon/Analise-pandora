import * as telefoneModel from './../../models/telefone';

import {
    filtraNaoEncontrados,
    trataRequisicaNome,
    toTextSearch,
    print,
    limpaNumero
} from './../../utils';

export let procuraTelefoneSimplificadoCPF = function (cpf: string, cpfUsuario: string) {
    cpf = limpaNumero(cpf);
    cpfUsuario = limpaNumero(cpfUsuario);

    return Promise.all([
        telefoneModel.getTelefoneCPF_ReceitaFull_PF(cpf),
        telefoneModel.getTelefoneCPF_BD_Receita_PF(cpf),
        telefoneModel.getTelefoneSimplificadoCPF_IPC(cpf),
        telefoneModel.getTelefoneCPF_CORTEX(cpf, cpfUsuario),
        telefoneModel.getTelefoneCPF_BD_Receita_Socio(cpf),
        telefoneModel.getTelefoneCPF_Sispesquisa_Telefones(cpf),
        telefoneModel.getTelefoneCPF_CREDILINK_PF(cpf)
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}

export let procuraTelefoneSimplificadoCNPJ = function (cnpj: string, cpfUsuario: string) {
    cnpj = limpaNumero(cnpj);
    cpfUsuario = limpaNumero(cpfUsuario);

    return Promise.all([
        telefoneModel.getTelefoneCNPJ_ReceitaFull_PJ(cnpj),
        telefoneModel.getTelefoneCNPJ_BD_Receita(cnpj),
        telefoneModel.getTelefoneCNPJ_CORTEX(cnpj, cpfUsuario),
        telefoneModel.getTelefoneCNPJ_BD_Receita_Socio(cnpj),
        telefoneModel.getTelefoneCNPJ_CREDILINK(cnpj)
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}

export let procuraTelefoneSimplificadoTelefone = function (telefone) {
    telefone = limpaNumero(telefone);

    return Promise.all([
        telefoneModel.getTelefonePFTelefone_Sispesquisa_Telefones(telefone),
        telefoneModel.getTelefoneTelefone_ReceitaFull_PF(telefone),
        telefoneModel.getTelefoneTelefone_BD_Receita(telefone),
        telefoneModel.getTelefonePorTelefone_CREDILINK(telefone)
        //telefoneModel.getTelefoneTelefone_ReceitaFull_PJ(telefone),
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}

export let procuraTelefoneBuscaProfundaTelefone = function (telefone) {
    telefone = limpaNumero(telefone);

    return Promise.all([
        telefoneModel.getTelefoneBuscaProfundaTelefone_Sispesquisa_Telefones(telefone),
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}

export let procuraTelefoneSimplificadoNome = function (nome) {
    let nomeTextSearch = toTextSearch(trataRequisicaNome(nome));

    return Promise.all([
        telefoneModel.getTelefoneNome_Sispesquisa_Telefones(nomeTextSearch),
        telefoneModel.getTelefoneNome_ReceitaFull_PF(nomeTextSearch),
        telefoneModel.getTelefoneNome_BD_Receita(nomeTextSearch),
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}

export let procuraTelefoneSimplificadoRazaoSocial = function (razaoSocial) {
    let razaoSocialTextSearch = toTextSearch(trataRequisicaNome(razaoSocial));

    return Promise.all([
        telefoneModel.getTelefoneRazaoSocial_ReceitaFull_PJ(razaoSocialTextSearch),
        telefoneModel.getTelefoneRazaoSocial_BD_Receita(razaoSocialTextSearch),
    ])
        .then(telefones => filtraNaoEncontrados(telefones))
}
