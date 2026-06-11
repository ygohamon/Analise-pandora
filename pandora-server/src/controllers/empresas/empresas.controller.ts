import {
    Request,
    Response
} from 'express';

import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    trataRequisicaNome,
    agrupaEFiltraDuplicados,
    print,
    filtraLogradouro,
    controllerFactory as cf,
    limpaNumero,
    logRequisicao,
    validaCNPJ,
    validaEmail,
    validaCPF,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

import {
    procuraEmpresaDetalhado,
    procuraEmpresaSimplificadoCNPJ,
    procuraEmpresaSimplificadoRazaoSocial,
    procuraEmpresaSimplificadoNomeFantasia,
    procuraEmpresaSimplificadoNomeSocioPF,
    procuraEmpresaSimplificadoCPFSocioPF,
    procuraEmpresaSimplificadoCNPJSocioPJ,
    procuraEmpresaIntegradoCNPJ,
    procuraEmpresaSimplificadoLogradouro,
    procuraEmpresaSimplificadoEmail,
    procuraEmpresaSimplificadoTelefone,
    procuraEmpresaIntegradoCNPJ_Local,
    procuraEmpresaIntegradoCNPJ_Externo,
} from './empresas.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.EMPRESA.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.EMPRESA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getEmpresaIntegradoCNPJ = function (req: Request, res: Response){
    let cnpj         = req.params.cnpj;
    let processo     = req.query.processo;
    let funcao       = req.query.funcao;
    let useCrawlers  = !(req.query.crawlers == 'false');
    let cpfUsuario   = <string> req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)

            .then(() => {
              return (funcao === 'local') ?
                procuraEmpresaIntegradoCNPJ_Local(cnpj) :
                (funcao === 'externo') ?
                  procuraEmpresaIntegradoCNPJ_Externo(cnpj, useCrawlers, cpfUsuario) :
                  procuraEmpresaIntegradoCNPJ(cnpj, cpfUsuario);
            })
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmpresaDetalhadoCNPJ = function (req : Request, res : Response){
    let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraEmpresaDetalhado, cnpj, cpfUsuario)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmpresaSimplificadoCNPJ = function (req : Request, res : Response){
    let cnpj = req.params.cnpj;
    let cpfUsuario = <string> req.params['cpf-usuario'];
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoCNPJ, cnpj, cpfUsuario)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmpresaSimplificadoRazaoSocial = function (req : Request, res : Response){
    let razaoSocial = req.params.razaosocial;
    let razaoSocialArray = trataRequisicaNome(razaoSocial);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (razaoSocialArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.RAZAOSOCIAL, valor: razaoSocial, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoRazaoSocial, razaoSocial)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getEmpresaSimplificadoNomeFantasia = function (req : Request, res : Response){
    let nomeFantasia = req.params.nomefantasia;
    let nomeFantasiaArray = trataRequisicaNome(nomeFantasia);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeFantasiaArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOMEFANTASIA, valor: nomeFantasia, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoNomeFantasia, nomeFantasia)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getEmpresaSimplificadoTelefone = function (req: Request, res: Response){
    let telefone = limpaNumero(req.params.telefone);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (telefone && ( telefone.length >= 8 && telefone.length <= 15) ){
        const log = new NovoLog({req, secao, item, chave: chaves.TELEFONE, valor: telefone, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoTelefone, telefone)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmpresaSimplificadoEmail = function (req : Request, res : Response){
    let email    = req.params.email;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (!validaEmail(email)){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.EMAIL, valor: email, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoEmail, email)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getEmpresaSimplificadoLogradouro = function (req : Request, res : Response){
    let endereco = req.params.endereco;
    let enderecoArray = filtraLogradouro(endereco);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (enderecoArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.ENDERECO, valor: endereco, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoLogradouro, endereco)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getEmpresaSimplificadoSocioPFNome = function (req : Request, res : Response){
    let nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOMESOCIOPF, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoNomeSocioPF, nome)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getEmpresaSimplificadoSocioPFCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPFSOCIOPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoCPFSocioPF, cpf)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getEmpresaSimplificadoSocioPJCNPJ = function (req: Request, res: Response){
    let cnpj = req.params.cnpj;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj)){
        const log = new NovoLog({req, secao, item, chave: chaves.CNPJSOCIOPJ, valor: cnpj, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraEmpresaSimplificadoCNPJSocioPJ, cnpj)
            .then(empresas => res.status(200).send(empresas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
