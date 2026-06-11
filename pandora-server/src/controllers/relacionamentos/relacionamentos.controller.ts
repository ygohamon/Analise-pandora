import {
    Request,
    Response
} from 'express';

import * as _ from 'underscore';

import * as relacionamentoModel from './../../models/relacionamentos';
import { NovoLog } from './../../schemas/log.schema';

import {
    criaRespostaAPI,
    print,
    checaCPF,
    checaCNPJ,
    toTextSearch,
    filtraLogradouro,
    validaCPF,
    validaCNPJ,
    logRequisicao,
    controllerError,
    getNomeFuncao,
} from './../../utils';

import {
    validaTipoBuscaPessoa,
    validaTipoBuscaTelefone,
    validaTipoBuscaEmpresa,
    filtraNodesPorCiclos,
    validaTipoBuscaEndereco,
    procuraRelacionamentosPessoaLista,
    procuraRelacionamentosPessoaCPF,
    procuraRelacionamentosTelefoneTelefone,
    procuraRelacionamentosEmpresaCNPJ,
    procuraRelacionamentosEndereco,
    procuraRelacionamentosOrgaoCdugestora,
    criaGrafo
} from './relacionamentos.functions';

import {
    API_CODES,
    API_MSGS,
    API_CONFIG,
    LOG_CODES,
    LOG_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from './../../config';

const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.RELACIONAMENTOS.NOME;
const chaves = LOG_SECOES.APPS.ITENS.RELACIONAMENTOS.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getRelacionamentosPessoaLista = function (req: Request, res: Response){
    let listaParametros: string = req.params.lista;
    let lista = (listaParametros) ? listaParametros.split(',') : [];

    const nomeFuncao = getNomeFuncao(1,1);

    const cpfsValidos = lista.map(d => checaCPF(d)).filter(d => d !== null);
    const cnpjsValidos = lista.map(d => checaCNPJ(d)).filter(d => d !== null);

    if (cpfsValidos.length !== 0 || cnpjsValidos.length !== 0) {
        const listaCpf  = cpfsValidos;
        const listaCnpj = cnpjsValidos;
        const tipobusca = 'completa';

        const mensagem = `${lista.join(',')}`;
        const log    = new NovoLog({req, secao, item, chave: chaves.LISTA, mensagem});

        logRequisicao(log)
            .then(() => procuraRelacionamentosPessoaLista(listaCpf, listaCnpj, tipobusca))
            .then((res: any) => {
                const graph = criaGrafo();

                // Filtra os nos repetidos
                graph.nodes = res.filter((x, i) => i%2 === 0).flat();
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = res.filter((x, i) => i%2 === 1).flat();
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                return graph;
            })
            .then(grafo => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafo }))
            .catch(error => controllerError(res, error, nomeFuncao))
    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getRelacionamentosPessoaCPF = function (req: Request, res: Response){
    const cpf = req.query.cpf as string;
    const tipobusca = req.query.tipobusca as string;

    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCPF(cpf) && validaTipoBuscaPessoa(tipobusca)) {
        const mensagem = LOG_MSGS.RELACIONAMENTO_CPF;
        const log    = new NovoLog({req, secao, item, chave: chaves.CPF, valor: cpf, mensagem});

        logRequisicao(log)
            .then(() => procuraRelacionamentosPessoaCPF([cpf], tipobusca))
            .then((res: any) => {

                const graph = criaGrafo();

                // Filtra os nos repetidos
                graph.nodes = res.filter((x, i) => i%2 === 0).flat();
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = res.filter((x, i) => i%2 === 1).flat();
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                return graph;
            })
            .then(grafo => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafo }))
            .catch(error => controllerError(res, error, nomeFuncao))

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getRelacionamentosTelefoneTelefone = function (req: Request, res: Response){
    const telefone = req.query.telefone as string;
    const tipobusca = req.query.tipobusca as string;

    const listaTelefone = (telefone) ? telefone.split(',') : null;

    const nomeFuncao = getNomeFuncao(1,1);

    if (listaTelefone && validaTipoBuscaTelefone(tipobusca)) {
        const mensagem = LOG_MSGS.RELACIONAMENTO_TELEFONE;
        const log    = new NovoLog({req, secao, item, chave: chaves.TELEFONE, valor: listaTelefone, mensagem});

        logRequisicao(log)
            .then(() => procuraRelacionamentosTelefoneTelefone(listaTelefone, tipobusca))
            .then(res => {
                const graph = criaGrafo();

                // Filtra os nos repetidos
                graph.nodes = graph.nodes.concat(res[0]);
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = graph.edges.concat(res[1]);
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                return graph;
            })
            .then(grafo => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafo }))
            .catch(error => controllerError(res, error, nomeFuncao))

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getRelacionamentosEmpresaCNPJ = function (req: Request, res: Response){
    let cnpj = req.query.cnpj as string;
    let tipobusca = req.query.tipobusca as string;

    const nomeFuncao = getNomeFuncao(1,1);

    if (validaCNPJ(cnpj) && validaTipoBuscaEmpresa(tipobusca)){
        const mensagem = LOG_MSGS.RELACIONAMENTO_CNPJ;
        const log    = new NovoLog({req, secao, item, chave: chaves.CNPJ, valor: cnpj, mensagem});

        logRequisicao(log)
            .then(() => procuraRelacionamentosEmpresaCNPJ([cnpj], tipobusca))
            .then((res: any) => {
                const graph = criaGrafo();

                // Filtra os nos repetidos
                graph.nodes = res.filter((x, i) => i%2 === 0).flat();
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = res.filter((x, i) => i%2 === 1).flat();
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                return graph;
            })
            .then(grafo => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafo }))
            .catch(error => controllerError(res, error, nomeFuncao))

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

export let getRelacionamentosEndereco = function (req: Request, res: Response){
    const enderecoComposto = req.query.endereco as string;
    const tipobusca = req.query.tipobusca as string;

    const endereco = (enderecoComposto) ? enderecoComposto.split(',') : null;
    const nomeFuncao = getNomeFuncao(1,1);

    if (endereco && validaTipoBuscaEndereco(tipobusca)){
        const lista      = endereco[0].split('|');
        const logradouro = toTextSearch(filtraLogradouro(lista[0]));;
        const numero     = lista[1];
        const municipio  = lista[2];

        const mensagem = LOG_MSGS.RELACIONAMENTO_ENDERECO;
        const log    = new NovoLog({req, secao, item, chave: chaves.ENDERECO, valor: endereco, mensagem});

        logRequisicao(log)
            .then(() => procuraRelacionamentosEndereco(logradouro, numero, municipio, tipobusca))
            .then(res => {
                const graph = criaGrafo();

                // Filtra os nos repetidos
                graph.nodes = graph.nodes.concat(res[0]).concat(res[2]);
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = graph.edges.concat(res[1]).concat(res[3]);
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                return graph;
            })
            .then(grafo => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafo }))
            .catch(error => controllerError(res, error, nomeFuncao))

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}

/**
 * Para a aplicacao de analise de ciclos
 */
export let getRelacionamentosOrgaoCdugestora = function (req: Request, res: Response){
    let cdugestora = req.query.cdugestora as string;

    let anoinicial = req.query.anoinicial as string;
    let anofinal   = req.query.anofinal as string;

    let tipobusca = req.query.tipobusca as string;

    const nomeFuncao = getNomeFuncao(1,1);

    if (cdugestora){
        // if (API_CONFIG.CFG_ENV == 'production') {
        //     logModel.salvaLogPorId(new Log({ ip: req.headers['x-real-ip'], usuario_id: getId_Token(req.headers['authorization']), tipo: LOG_CODES.TIPO_RELACIONAMENTOS, mensagem: `${API_CONFIG.CFG_NOME_SISTEMA} - ${LOG_MSGS.RELACIONAMENTO_CDUGESTORA}: ${cdugestora}`, user_agent: req.headers['user-agent']}));
        // }

        const graph = criaGrafo();

        let empresasPagas;
        let servidores;
        let pessoas;

        procuraRelacionamentosOrgaoCdugestora(cdugestora, anoinicial, anofinal, tipobusca)
            .then(res => {
                // Filtra os nos repetidos
                graph.nodes = graph.nodes.concat(res[0]).concat(res[1]).concat(res[3]);
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = graph.edges.concat(res[2]).concat(res[4]);
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                empresasPagas = graph.nodes.filter(d => d.entidade === 'empresa').map(d => d.cnpj);
                servidores    = graph.nodes.filter(d => d.entidade === 'pessoa').map(d => d.cpf);

                return graph;
            })
            .then(() => {
                return Promise.all([
                    // PF
                    relacionamentoModel.getNodesParentescosPessoaCPF(servidores, tipobusca, 'completa'),
                    relacionamentoModel.getEdgesParentescosPessoaCPF(servidores, tipobusca, 'completa'),

                    relacionamentoModel.getNodesEmpresasResponsavelPessoaCPF(servidores, tipobusca),
                    relacionamentoModel.getEdgesEmpresasResponsavelPessoaCPF(servidores, tipobusca),

                    relacionamentoModel.getNodesEmpresasSocioPessoaCPF(servidores, tipobusca),
                    relacionamentoModel.getEdgesEmpresasSocioPessoaCPF(servidores, tipobusca),

                    // PJ
                    relacionamentoModel.getNodesResponsavelEmpresaCNPJ(empresasPagas, 'completa'),
                    relacionamentoModel.getEdgesResponsavelEmpresaCNPJ(empresasPagas, 'completa'),

                    relacionamentoModel.getNodesSociosPFEmpresaCNPJ(empresasPagas, 'completa'),
                    relacionamentoModel.getEdgesSociosPFEmpresaCNPJ(empresasPagas, 'completa'),

                    relacionamentoModel.getNodesSociosPJEmpresaCNPJ(empresasPagas, 'completa'),
                    relacionamentoModel.getEdgesSociosPJEmpresaCNPJ(empresasPagas, 'completa'),

                ])
            })
            .then(res => {
                // Filtra os nos repetidos
                graph.nodes = graph.nodes.concat(res[0]).concat(res[2]).concat(res[4]).concat(res[6]).concat(res[8]).concat(res[10]);
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = graph.edges.concat(res[1]).concat(res[3]).concat(res[5]).concat(res[7]).concat(res[9]).concat(res[11]);
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);

                pessoas = [].concat(res[6]).concat(res[8]).filter(d => d.entidade === 'pessoa').map(d => d.cpf);
            })
            .then(() => {
                return Promise.all([
                    // PF
                    relacionamentoModel.getNodesParentescosPessoaCPF(pessoas, tipobusca, 'completa'),
                    relacionamentoModel.getEdgesParentescosPessoaCPF(pessoas, tipobusca, 'completa'),
                ])
            })
            .then(res => {
                // Filtra os nos repetidos
                graph.nodes = graph.nodes.concat(res[0]);
                graph.nodes = _.uniq(graph.nodes, (d) => d.id);

                graph.edges = graph.edges.concat(res[1]);
                graph.edges = _.uniq(graph.edges, (d) => (d.id) ? d.id : d.origem + '-' + d.relacao + '-' + d.destino);
            })
            .then(() => filtraNodesPorCiclos(graph, cdugestora))
            // .then(grafoFiltrado => {
            //     graph = grafoFiltrado;
            // })
            .then(grafoFiltrado => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: grafoFiltrado }))
            // .then(() => res.status(200).json({ status: API_CODES.CODE_SUCESSO, dados: graph }))
            .catch(error => controllerError(res, error, nomeFuncao))

    } else {
        res.status(400).send(criaRespostaAPI(API_CODES.CODE_PARAM_INVALIDO, API_MSGS.MSG_PARAM_INVALIDO));
    }
}
