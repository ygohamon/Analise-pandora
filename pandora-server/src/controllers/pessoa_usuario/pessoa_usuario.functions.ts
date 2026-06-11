import * as pessoaUsuarioModel from '../../models/pessoa_usuario';
import * as usuarioModel from '../../models/usuario';

import {
    filtraNaoEncontrados, logRequisicao, criaRespostaAPI, print, getNomeFuncao, controllerError,
} from './../../utils';

import { PessoaUsuario } from '../../models/schemas';
import { LOG_MSGS, LOG_TIPOS, API_CODES, API_MSGS, LOG_SECOES } from '../../config';
import { NovoLog } from '../../schemas/log.schema';


export const secao  = LOG_SECOES.SISTEMA.NOME;
export const item   = LOG_SECOES.SISTEMA.ITENS.PESSOAUSUARIO.NOME;
export const chaves = LOG_SECOES.SISTEMA.ITENS.PESSOAUSUARIO.CHAVES;

export let procuraPessoaUsuarioInativo = function (){

    return Promise.all([
        pessoaUsuarioModel.getPessoaUsuariosInativos_BD_Pandora()
    ])
        .then(dados => filtraNaoEncontrados(dados))
}

export let removePessoaUsuarioID = function (id){

    return pessoaUsuarioModel.deletePessoaUsuario_BD_Pandora(id)

}

export let ativaRecadastramentoPessoaUsuarioID = function (id){

    return pessoaUsuarioModel.ativaRecadastramentoPreUsuario_BD_Pandora(id)
}

export let _atualizaPessoaUsuario = function (req, res, pessoa: PessoaUsuario, idPessoaUsuario: number, idUsuario: number) {
    const mensagem = LOG_MSGS.PESSOA_USUARIO_RECADASTRO;
    const log = new NovoLog({req, secao, item, chave: 'CPF', tipo: LOG_TIPOS.RECADASTRO, valor: pessoa.cpf, mensagem});
    const nomeFuncao = getNomeFuncao(1,1);

    logRequisicao(log, true)
        .then(() => pessoaUsuarioModel.recadastraPessoaUsuario_BD_Pandora(pessoa, idPessoaUsuario))
        .then(() => usuarioModel.desativaUsuario_BD_Pandora(idUsuario))
        .then(() => usuarioModel.desativaRecadastramentoUsuario_BD_Pandora(idUsuario))
        .then(() => res.status(200).send(criaRespostaAPI(API_CODES.CODE_SUCESSO, API_MSGS.MSG_RECADASTRO_PESSOA_SUCESSO)))
        .catch(error => {
            const mensagem = (error.msg) ? error.msg : error;
            const log = new NovoLog({req, secao, item, code:API_CODES.CODE_ERRO_500, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_RECADASTRO, mensagem});

            logRequisicao(log, true).then(() => controllerError(res, error, nomeFuncao))
        })
}

export let _cadastroPessoaUsuario = function (req, res, pessoa: PessoaUsuario, idUsuario: number = null) {
    const mensagem = LOG_MSGS.PESSOA_USUARIO_CADASTRO;
    const log = new NovoLog({req, secao, item, chave: 'CPF', tipo: LOG_TIPOS.CADASTRO, valor: pessoa.cpf, mensagem});
    const nomeFuncao = getNomeFuncao(1,1);

    logRequisicao(log, true)
        .then(() => pessoaUsuarioModel.cadastraPessoaUsuario_BD_Pandora(pessoa))
        .then(() => { if (idUsuario) { return usuarioModel.desativaUsuario_BD_Pandora(idUsuario)} ; return; })
        .then(() => { if (idUsuario) { return usuarioModel.desativaRecadastramentoUsuario_BD_Pandora(idUsuario)} ; return; })
        .then(() => res.status(200).send(criaRespostaAPI(API_CODES.CODE_SUCESSO, API_MSGS.MSG_CADASTRO_PESSOA_SUCESSO)))
        .catch(error => {
            const mensagem = (error.msg) ? error.msg : error;
            const log = new NovoLog({req, secao, item, code:API_CODES.CODE_ERRO_500, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

            logRequisicao(log, true).then(() => controllerError(res, error, nomeFuncao))
        })
}
