import {
    Request,
    Response
} from 'express';

import * as pessoaUsuarioModel from '../../models/pessoa_usuario';
import * as usuarioModel from '../../models/usuario';
import { NovoLog } from '../../schemas/log.schema';
import { Usuario, PessoaUsuario, NovoUsuario } from '../../models/schemas';

import {
    criaRespostaAPI,
    controllerFactory as cf,
    validaGoogleRecaptcha,
    logRequisicao,
    getId_Token,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    procuraPessoaUsuarioInativo,
    removePessoaUsuarioID,
    _atualizaPessoaUsuario,
    _cadastroPessoaUsuario,

    secao,
    item,
    chaves,
    ativaRecadastramentoPessoaUsuarioID,
} from './pessoa_usuario.functions';

import {
    API_CODES,
    API_MSGS,
    LOG_TIPOS,
    LOG_MSGS,
    LOG_SECOES,
} from '../../config';


export let getPessoaUsuariosInativos = function (req : Request, res : Response){

    const mensagem = LOG_MSGS.CADASTRO_USUARIO_LISTA_USUARIOS_INATIVOS;
    const log = new NovoLog({req, secao, item, mensagem})
    const nomeFuncao = getNomeFuncao(1,1);

    cf(log, procuraPessoaUsuarioInativo)
        .then(preusuarios => res.status(200).send(preusuarios))
        .catch(error => controllerError(res, error, nomeFuncao));
}

export let cadastraPessoaUsuario = function (req : Request, res : Response){
    const {recaptcha, ...cadastro} = req.body;
    const pessoa = new PessoaUsuario(cadastro);
    const nomeFuncao = getNomeFuncao(1,1);

    if (pessoa.dadosValidos()) {
        if (recaptcha) {
            validaGoogleRecaptcha(recaptcha)
                .then(valido => {
                    if (valido) {
                        pessoaUsuarioModel.checaCPFEmailExistentePessoaUsuario_BD_Pandora(pessoa)
                            .then(pessoaUsuarioExiste => {
                                if (!pessoaUsuarioExiste) {
                                    return _cadastroPessoaUsuario(req, res, pessoa);
                                } else {
                                    const mensagem = API_MSGS.MSG_CPF_EXISTENTE;
                                    const log = new NovoLog({req, secao, item, code: API_CODES.CODE_CPF_JA_CADASTRADO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                                    logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_CPF_JA_CADASTRADO, API_MSGS.MSG_CPF_EXISTENTE)))
                                }
                            })
                            .catch(error => {
                                const mensagem = error.msg;
                                const log = new NovoLog({req, secao, item, code:API_CODES.CODE_ERRO_500, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                                logRequisicao(log, true).then(() => controllerError(res, error, nomeFuncao))
                            })
                    } else {
                        const mensagem = API_MSGS.MSG_RECAPTCHA_INVALIDO;
                        const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                        logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, API_MSGS.MSG_RECAPTCHA_INVALIDO)))
                    }
                })
                .catch(error => {
                    const mensagem = API_MSGS.MSG_RECAPTCHA_INVALIDO;
                    const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                    logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, API_MSGS.MSG_RECAPTCHA_INVALIDO)));
                })
        } else {
            const mensagem = API_MSGS.MSG_RECAPTCHA_NAO_ENCONTRADO;
            const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

            logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO, API_MSGS.MSG_RECAPTCHA_NAO_ENCONTRADO)))
        }
    } else {
        const mensagem = API_MSGS.MSG_PARAM_INVALIDO;
        const log = new NovoLog({req, secao, item, code: API_CODES.CODE_PARAM_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

        logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO)))
    }
}

/**
 * Realiza o recadastramento do usuário que teve a opção `recadastramento` ativada.
 *
 */
export let recadastraPessoaUsuario = function (req : Request, res : Response){
    const {recaptcha, ...cadastro} = req.body;
    const pessoa = new PessoaUsuario(cadastro);
    const idUsuario = getId_Token(req.headers['authorization']);
    const nomeFuncao = getNomeFuncao(1,1);

    if (pessoa.dadosValidos()) {
        if (recaptcha) {
            validaGoogleRecaptcha(recaptcha)
                .then(valido => {
                    if (valido) {
                        pessoaUsuarioModel.getIDPessoaPessoaUsuario_BD_Pandora(idUsuario)
                            .then(idPessoaUsuario => (idPessoaUsuario) ? _atualizaPessoaUsuario(req, res, pessoa, idPessoaUsuario, idUsuario): _cadastroPessoaUsuario(req, res, pessoa))
                            .catch(error => {
                                const mensagem = error.msg;
                                const log = new NovoLog({req, secao, item, code:API_CODES.CODE_ERRO_500, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                                logRequisicao(log, true).then(() => controllerError(res, error, nomeFuncao))
                            })
                    } else {
                        const mensagem = API_MSGS.MSG_RECAPTCHA_INVALIDO;
                        const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                        logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, API_MSGS.MSG_RECAPTCHA_INVALIDO)))
                    }
                })
                .catch(error => {
                    const mensagem = API_MSGS.MSG_RECAPTCHA_INVALIDO;
                    const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

                    logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_INVALIDO, API_MSGS.MSG_RECAPTCHA_INVALIDO)));
                })
        } else {
            const mensagem = API_MSGS.MSG_RECAPTCHA_NAO_ENCONTRADO;
            const log = new NovoLog({req, secao, item, code: API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

            logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO, API_MSGS.MSG_RECAPTCHA_NAO_ENCONTRADO)))
        }
    } else {
        const mensagem = API_MSGS.MSG_PARAM_INVALIDO;
        const log = new NovoLog({req, secao, item, code: API_CODES.CODE_PARAM_INVALIDO, chave: 'CPF', valor: pessoa.cpf, tipo: LOG_TIPOS.TENTATIVA_CADASTRO, mensagem});

        logRequisicao(log, true).then(() => res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO)))
    }
}

export let removePessoaUsuario = function (req: Request, res: Response){
    let id = req.params.id;
    const nomeFuncao = getNomeFuncao(1,1);

    if (id) {
        const mensagem = LOG_MSGS.CADASTRO_USUARIO_REMOVE_USUARIO;
        const log = new NovoLog({req, secao, item, chave: chaves.ID, valor: id, tipo: LOG_TIPOS.REMOVE, mensagem});

        logRequisicao(log)
            .then(() => removePessoaUsuarioID(id))
            .then(resultado => res.status(200).send(resultado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let ativaRecadastramentoPessoaUsuario = function (req: Request, res: Response){
    let id = req.params.id;
    const nomeFuncao = getNomeFuncao(1,1);

    if (id) {
        const mensagem = LOG_MSGS.CADASTRO_USUARIO_RECADASTRAMENTO_USUARIO;
        const log = new NovoLog({req, secao, item, chave: chaves.ID, valor: id, tipo: LOG_TIPOS.RECADASTRO, mensagem});

        logRequisicao(log)
            .then(() => ativaRecadastramentoPessoaUsuarioID(id))
            .then(resultado => res.status(200).send(resultado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let ativaPessoaUsuario = function (req: Request, res: Response){
    let id = req.params.id;
    let dadosAtivacao = req.body;
    const nomeFuncao = getNomeFuncao(1,1);

    if (id) {
        const mensagem = LOG_MSGS.CADASTRO_USUARIO_ATIVAR_USUARIO;
        const log = new NovoLog({req, secao, item, chave: chaves.ID, valor: id, mensagem});

        let pessoaUsuario = new PessoaUsuario(dadosAtivacao);
        let novoUsuario   = new NovoUsuario({}).createFromFormAtivacao(dadosAtivacao);

        let erroSalvo;

        logRequisicao(log)
            .then(() => pessoaUsuarioModel.getUsuarioIDPessoaUsuario_BD_Pandora(pessoaUsuario))
            .then(idUsuario => {
                if (idUsuario) {
                    return usuarioModel.ativaUsuario_BD_Pandora(idUsuario);
                } else {
                    return usuarioModel.cadastraUsuario_BD_Pandora(novoUsuario).then(() => null);
                }
            })
            .then(() => pessoaUsuarioModel.ativarPessoaUsuario_BD_Pandora(pessoaUsuario))
            .then(resultado => res.status(200).send(resultado))

            .catch(error => {
                erroSalvo = error;
                console.error(error);

                pessoaUsuarioModel.desativarPessoaUsuario_BD_Pandora(pessoaUsuario)
                    .then(() => usuarioModel.removeUsuarioLogin_BD_Pandora(novoUsuario.login))
                    .then(() => controllerError(res, error, nomeFuncao))
            })
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
