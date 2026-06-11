import {
    Request,
    Response
} from 'express';

import * as telefoneModel from './../../models/telefone';
import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    desagrupa,
    trataRequisicaNome,
    validaCPF,
    controllerFactory as cf,
    validaCNPJ,
    limpaNumero,
    logRequisicao,
    getNomeFuncao,
    controllerError,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    API_CONFIG,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraTelefoneSimplificadoCPF,
    procuraTelefoneSimplificadoCNPJ,
    procuraTelefoneSimplificadoTelefone,
    procuraTelefoneSimplificadoNome,
    procuraTelefoneSimplificadoRazaoSocial,
    procuraTelefoneBuscaProfundaTelefone,

} from './telefones.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.TELEFONE.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.TELEFONE.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getTelefoneSimplificadoCPF = function (req: Request, res: Response) {
    let cpf = req.params.cpf;
    let cpfUsuario = req.headers['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)) {
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTelefoneSimplificadoCPF, cpf, cpfUsuario)
            .then(telefones => res.status(200).send(telefones))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getTelefoneSimplificadoCNPJ = function (req : Request, res : Response){
  let cnpj = req.params.cnpj;
  let cpfUsuario = <string> req.headers['cpf-usuario'];
  let processo = req.query.processo;

  const nomeFuncao = getNomeFuncao(1,1);

  if (validaCNPJ(cnpj)){
      const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

      cf(log, procuraTelefoneSimplificadoCNPJ, cnpj, cpfUsuario)
          .then(telefones => res.status(200).send(telefones))
          .catch(error => controllerError(res, error, nomeFuncao));
  } else {
      res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
  }
}

export let getTelefoneSimplificadoTelefone = function (req : Request, res : Response){
	let telefone = limpaNumero(req.params.telefone);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (telefone && telefone.length >= 4){
        const log = new NovoLog({req, secao, item, chave: chaves.TELEFONE, valor: telefone, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTelefoneSimplificadoTelefone, telefone)
            .then(telefones => res.status(200).send(telefones))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getTelefoneBuscaProfundaTelefone = function (req : Request, res : Response){
	let telefone = limpaNumero(req.params.telefone);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (telefone && telefone.length >= 4){
        const log = new NovoLog({req, secao, item, chave: chaves.TELEFONE, valor: telefone, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTelefoneBuscaProfundaTelefone, telefone)
            .then(telefones => res.status(200).send(telefones))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getTelefoneSimplificadoNome = function (req : Request, res : Response){
    let nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTelefoneSimplificadoNome, nome)
            .then(telefones => res.status(200).send(telefones))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getTelefoneSimplificadoRazaoSocial = function (req : Request, res : Response){
    let razaoSocial = req.params.razaosocial;
    let razaoSocialArray = trataRequisicaNome(razaoSocial);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (razaoSocialArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.RAZAOSOCIAL, valor: razaoSocial, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraTelefoneSimplificadoRazaoSocial, razaoSocial)
            .then(telefones => res.status(200).send(telefones))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let setTelefoneCPFSimplificado = function (req : Request, res : Response){
    let form     = req.body;
    let cpf      = form.cpf;
    let telefone = form.telefone;
    const nomeFuncao = getNomeFuncao(1,1);

    cpf          = limpaNumero(cpf);
    telefone     = limpaNumero(telefone);

    if (validaCPF(cpf)){
        const fonte = `OP${(new Date()).getFullYear()}`;

        const secao = LOG_SECOES.CADASTRO.NOME;
        const item  = LOG_SECOES.CADASTRO.ITENS.TELEFONE.NOME;
        const chaves = LOG_SECOES.CADASTRO.ITENS.TELEFONE.CHAVES;

        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, mensagem: telefone})

        logRequisicao(log)
            .then(() => telefoneModel.insertTelefone_Sispesquisa_Telefones({cpf: cpf, telefone: telefone, fonte: fonte}))

            .then(resultado => res.status(200).send(resultado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
