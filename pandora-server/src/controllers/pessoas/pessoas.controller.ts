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
    limpaNumero,
    logRequisicao,
    controllerFactory as cf,
    validaCPF,
    validaEmail,
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
    procuraPessoaDetalhadoCPF,
    procuraPessoaSimplificadoCPF,
    procuraPessoaSimplificadoNome,
    procuraPessoaSimplificadoCNH,
    procuraPessoaSimplificadoTitulo,
    procuraPessoaSimplificadoRG,
    procuraPessoaSimplificadoNomePai,
    procuraPessoaSimplificadoNomeMae,
    procuraPessoaIntegradoCPF,
    getPessoasListaCPFs,
    procuraPessoaSimplificadoTelefone,
    procuraVizinhosPessoaCPF,
    procuraPessoaSimplificadoEndereco,
    procuraPessoaSimplificadoEmail,
    procuraPessoaQualificacaoPF,
    procuraPessoaIntegradoCPF_Local,
    procuraPessoaIntegradoCPF_Externo,
    procuraPessoaIntegradoRG_Local,
    procuraPessoaIntegradoRG_Externo,
    procuraPessoaIntegradoRG,
    procuraPessoaQualificacaoPF_RG,
    procuraPessoaIntegradoNome_Local,
    procuraPessoaIntegradoNome_Externo,
    procuraPessoaIntegradoNome,

} from './pessoas.functions';

const secao  = LOG_SECOES.PESQUISA.NOME;
const item   = LOG_SECOES.PESQUISA.ITENS.PESSOA.NOME;
const chaves = LOG_SECOES.PESQUISA.ITENS.PESSOA.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;

export let getPessoaSimplificadoCPF = function (req : Request, res : Response) {
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    let cpfUsuario = req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoCPF, cpf, cpfUsuario)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaDetalhadoCPF = function (req : Request, res : Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    let cpfUsuario = req.headers['cpf-usuario'];
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.DETALHADA, processo})

        cf(log, procuraPessoaDetalhadoCPF, cpf, cpfUsuario)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao))
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaIntegradoCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    let funcao = req.query.funcao;
    let cpfUsuario = <string> req.headers['cpf-usuario'];
    let useCrawlers = !(req.query.crawlers == 'false');
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)
            .then(() => {
              return (funcao === 'local') ?
                procuraPessoaIntegradoCPF_Local(cpf) :
                (funcao === 'externo') ?
                  procuraPessoaIntegradoCPF_Externo(cpf, useCrawlers, cpfUsuario) :
                  procuraPessoaIntegradoCPF(cpf, cpfUsuario);
            })
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))
            .then(integrado => res.status(200).send(integrado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaIntegradoRG = function (req: Request, res: Response){
    let { rg } = req.params;
    let processo = req.query.processo;
    let funcao = req.query.funcao;
    let useCrawlers = !(req.query.crawlers == 'false');
    const nomeFuncao = getNomeFuncao(1,1);

    if (rg) {
        const log = new NovoLog({req, secao, item, chave: chaves.RG, valor: rg, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)
            .then(() => {
              return (funcao === 'local') ?
                procuraPessoaIntegradoRG_Local(rg) :
                (funcao === 'externo') ?
                  procuraPessoaIntegradoRG_Externo(rg, useCrawlers) :
                  procuraPessoaIntegradoRG(rg);
            })
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))
            .then(integrado => res.status(200).send(integrado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaIntegradoNome = function (req: Request, res: Response) {
    let { nome } = req.params;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    let funcao = req.query.funcao;
    let useCrawlers = !(req.query.crawlers == 'false');
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length > 2) {
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)
            .then(() => {
              return (funcao === 'local') ?
                procuraPessoaIntegradoNome_Local(nome) :
                (funcao === 'externo') ?
                  procuraPessoaIntegradoNome_Externo(nome, useCrawlers) :
                  procuraPessoaIntegradoNome(nome);
            })
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))
            .then(integrado => res.status(200).send(integrado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaQualificacaoCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)

            .then(() => procuraPessoaQualificacaoPF(cpf))
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))

            .then(integrado => res.status(200).send(integrado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaQualificacaoRG = function(req: Request, res: Response){
    let rg = req.params.rg;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (rg){
        const log = new NovoLog({req, secao, item, chave: chaves.RG, valor: rg, tipo: tipos_busca.INTEGRADA, processo})

        logRequisicao(log)

            .then(() => procuraPessoaQualificacaoPF_RG(rg))
            .then(resultados => agrupaEFiltraDuplicados(resultados, ['endereco', 'telefone']))

            .then(integrado => res.status(200).send(integrado))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaSimplificadoNome = function (req : Request, res : Response){
    let nome = req.params.nome;
    let nomeArray = trataRequisicaNome(nome);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOME, valor: nome, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoNome, nome)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao))
    }
}

export let getPessoaSimplificadoCNH = function (req : Request, res : Response){
    let cnh = limpaNumero(req.params.cnh);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (cnh && ( cnh.length >= 5 && cnh.length <= 12) ){
        const log = new NovoLog({req, secao, item, chave: chaves.CNH, valor: cnh, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoCNH, cnh)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaSimplificadoTitulo = function (req : Request, res : Response){
    let titulo = limpaNumero(req.params.titulo);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (titulo && ( titulo.length === 12 || titulo.length === 13) ){
        const log = new NovoLog({req, secao, item, chave: chaves.TITULO, valor: titulo, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoTitulo, titulo)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaSimplificadoRG = function (req : Request, res : Response){
    let rg = limpaNumero(req.params.rg);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    // RG tem algum padrão ? :(
    if (rg && ( rg.length >= 3 && rg.length <= 15) ){
        const log = new NovoLog({req, secao, item, chave: chaves.RG, valor: rg, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoRG, rg)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}



export let getPessoaSimplificadoNomePai = function (req : Request, res : Response){
    let nomePai = req.params.nomepai;
    let nomeArray = trataRequisicaNome(nomePai);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOMEPAI, valor: nomePai, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoNomePai, nomePai)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getPessoaSimplificadoNomeMae = function (req : Request, res : Response){
    const nomeMae = req.params.nomemae;
    let nomeArray = trataRequisicaNome(nomeMae);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (nomeArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.NOMEMAE, valor: nomeMae, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoNomeMae, nomeMae)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getPessoaSimplificadoEndereco = function (req : Request, res : Response){
    const endereco = req.params.endereco;
    let enderecoArray = filtraLogradouro(endereco);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (enderecoArray.length < 2){
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_NOME_INSUFICIENTE));
    }else{
        const log = new NovoLog({req, secao, item, chave: chaves.ENDERECO, valor: endereco, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoEndereco, endereco)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    }
}

export let getPessoaSimplificadoEmail = function (req: Request, res: Response){
    let email = req.params.email;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaEmail(email)){
        const log = new NovoLog({req, secao, item, chave: chaves.EMAIL, valor: email, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoEmail, email)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getPessoaSimplificadoTelefone = function (req: Request, res: Response){
    let telefone = limpaNumero(req.params.telefone);
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (telefone && ( telefone.length >= 8 && telefone.length <= 15) ){
        const log = new NovoLog({req, secao, item, chave: chaves.TELEFONE, valor: telefone, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraPessoaSimplificadoTelefone, telefone)
            .then(pessoas => {
                if (pessoas.dados.length > 0){
                    const cpfsEncontrados = pessoas.dados.map(pessoa => pessoa.cpf);
                    return getPessoasListaCPFs(cpfsEncontrados);
                }else {
                    return pessoas;
                }
            })
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getVizinhosPessoaCPF = function (req: Request, res: Response){
    let cpf = req.params.cpf;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf)){
        const log = new NovoLog({req, secao, item: 'VIZINHO', chave: chaves.CPF, valor: cpf, tipo: tipos_busca.SIMPLIFICADA, processo})

        cf(log, procuraVizinhosPessoaCPF, cpf)
            .then(pessoas => res.status(200).send(pessoas))
            .catch(error => controllerError(res, error, nomeFuncao));
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
