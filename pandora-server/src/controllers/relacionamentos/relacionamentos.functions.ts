import * as _ from 'underscore';
import * as rp from 'request-promise-native';

import { BenchmarkService } from './../../services/benchmark.service';

import * as relacionamentoModel from './../../models/relacionamentos';

import {
    printTempoExecucao,
} from './../../utils';

export let procuraRelacionamentosPessoaLista = function (listaCpf, listaCnpj, tipobusca) {

    return Promise.all([
        /**
         * PF
         */
        relacionamentoModel.getNodesParentescosPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesParentescosPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEmpresasResponsavelPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEmpresasResponsavelPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEmpresasSocioPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEmpresasSocioPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesTelefonesPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesTelefonesPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEnderecosPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEnderecosPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesOrgaosPublicosEstaduaisPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesOrgaosPublicosEstaduaisPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesOrgaosPublicosMunicipaisPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesOrgaosPublicosMunicipaisPessoaCPF(listaCpf, tipobusca),

        /**
         * PJ
         */
        relacionamentoModel.getNodesEnderecosEmpresaCNPJ(listaCnpj, tipobusca),
        relacionamentoModel.getEdgesEnderecosEmpresaCNPJ(listaCnpj, tipobusca),

        relacionamentoModel.getNodesResponsavelEmpresaCNPJ(listaCnpj, tipobusca),
        relacionamentoModel.getEdgesResponsavelEmpresaCNPJ(listaCnpj, tipobusca),

        relacionamentoModel.getNodesSociosPFEmpresaCNPJ(listaCnpj, tipobusca),
        relacionamentoModel.getEdgesSociosPFEmpresaCNPJ(listaCnpj, tipobusca),

        relacionamentoModel.getNodesSociosPJEmpresaCNPJ(listaCnpj, tipobusca),
        relacionamentoModel.getEdgesSociosPJEmpresaCNPJ(listaCnpj, tipobusca),
    ])
}

export let procuraRelacionamentosPessoaCPF = function (listaCpf, tipobusca) {

    return Promise.all([
        relacionamentoModel.getNodesParentescosPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesParentescosPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEmpresasResponsavelPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEmpresasResponsavelPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEmpresasSocioPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEmpresasSocioPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesTelefonesPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesTelefonesPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesEnderecosPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesEnderecosPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesOrgaosPublicosMunicipaisPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesOrgaosPublicosMunicipaisPessoaCPF(listaCpf, tipobusca),

        relacionamentoModel.getNodesOrgaosPublicosEstaduaisPessoaCPF(listaCpf, tipobusca),
        relacionamentoModel.getEdgesOrgaosPublicosEstaduaisPessoaCPF(listaCpf, tipobusca),
    ])
}

export let procuraRelacionamentosTelefoneTelefone = function (listaTelefone, tipobusca) {

    return Promise.all([
        relacionamentoModel.getNodesPessoasTelefone(listaTelefone, tipobusca),
        relacionamentoModel.getEdgesPessoasTelefone(listaTelefone, tipobusca),

        relacionamentoModel.getNodesEmpresasTelefone(listaTelefone, tipobusca),
        relacionamentoModel.getEdgesEmpresasTelefone(listaTelefone, tipobusca),
    ])
}

export let procuraRelacionamentosEmpresaCNPJ = function (listaCNPJ, tipobusca) {

    return Promise.all([
        relacionamentoModel.getNodesEnderecosEmpresaCNPJ(listaCNPJ, tipobusca),
        relacionamentoModel.getEdgesEnderecosEmpresaCNPJ(listaCNPJ, tipobusca),

        relacionamentoModel.getNodesResponsavelEmpresaCNPJ(listaCNPJ, tipobusca),
        relacionamentoModel.getEdgesResponsavelEmpresaCNPJ(listaCNPJ, tipobusca),

        relacionamentoModel.getNodesSociosPFEmpresaCNPJ(listaCNPJ, tipobusca),
        relacionamentoModel.getEdgesSociosPFEmpresaCNPJ(listaCNPJ, tipobusca),

        relacionamentoModel.getNodesSociosPJEmpresaCNPJ(listaCNPJ, tipobusca),
        relacionamentoModel.getEdgesSociosPJEmpresaCNPJ(listaCNPJ, tipobusca),
    ])
}

export let procuraRelacionamentosEndereco = function (logradouro, numero, municipio, tipobusca) {

    return Promise.all([
        relacionamentoModel.getNodesPessoasEndereco(logradouro, numero, municipio, tipobusca),
        relacionamentoModel.getEdgesPessoasEndereco(logradouro, numero, municipio, tipobusca),

        relacionamentoModel.getNodesEmpresasEndereco(logradouro, numero, municipio, tipobusca),
        relacionamentoModel.getEdgesEmpresasEndereco(logradouro, numero, municipio, tipobusca),
    ])
}

export let procuraRelacionamentosOrgaoCdugestora = function (cdugestora, anoinicial, anofinal, tipobusca) {

    return Promise.all([
        relacionamentoModel.getNodesOrgaoPublicoCdUgestoraMunicipal(cdugestora, tipobusca),

        relacionamentoModel.getNodesEmpresasPagasCdUgestoraMunicipal(cdugestora, anoinicial, anofinal, tipobusca),
        relacionamentoModel.getEdgesEmpresasPagasCdUgestoraMunicipal(cdugestora, anoinicial, anofinal, tipobusca),

        relacionamentoModel.getNodesServidoresCdUgestoraMunicipal(cdugestora, anoinicial, anofinal, tipobusca),
        relacionamentoModel.getEdgesServidoresCdUgestoraMunicipal(cdugestora, anoinicial, anofinal, tipobusca),
    ])
}

/**
 * Valida os tipos possiveis de busca para a entidade Pessoa.
 * @param tipoBusca
 */
export let validaTipoBuscaPessoa = function(tipoBusca: string) {
    if(!tipoBusca) { return false; }

    if(tipoBusca === 'parentesco' ||
        tipoBusca === 'telefones' ||
        tipoBusca === 'empresasresponsavel' ||
        tipoBusca === 'empresassocio' ||
        tipoBusca === 'orgaospublicos' ||
        tipoBusca === 'enderecos' ||
        tipoBusca === 'completa') {
        return true;
    } else {
        return false;
    }
}

/**
 * Valida os tipos possiveis de busca para a entidade Telefone.
 * @param tipoBusca
 */
export let validaTipoBuscaTelefone = function(tipoBusca: string) {
    if(!tipoBusca) { return false; }

    if(tipoBusca === 'proprietarios' ||
        tipoBusca === 'completa') {
        return true;
    } else {
        return false;
    }
}

/**
 * Valida os tipos possiveis de busca para a entidade Empresa.
 * @param tipoBusca
 */
export let validaTipoBuscaEmpresa = function(tipoBusca: string) {
    if(!tipoBusca) { return false; }

    if(tipoBusca === 'responsavel' ||
        tipoBusca === 'sociospf' ||
        tipoBusca === 'sociospj' ||
        tipoBusca === 'socios' ||
        tipoBusca === 'filiais' ||
        tipoBusca === 'telefones' ||
        tipoBusca === 'enderecos' ||
        tipoBusca === 'completa') {
        return true;
    } else {
        return false;
    }
}

/**
 * Valida os tipos possiveis de busca para a entidade Endereco.
 * @param tipoBusca
 */
export let validaTipoBuscaEndereco = function(tipoBusca: string) {
    if(!tipoBusca) { return false; }

    if(tipoBusca === 'pessoas' ||
        tipoBusca === 'empresas' ||
        tipoBusca === 'completa') {
        return true;
    } else {
        return false;
    }
}

export let filtraNodesPorCiclos = function(grafo, cdugestora) {

    const ANALISE_CICLOS_SERVER = `http://localhost:5000`

    let options = {
        method: 'POST',
        uri: `${ANALISE_CICLOS_SERVER}/analiseciclos`,
        body: {
            edges: grafo.edges,
            cdugestora: cdugestora
        },
        timeout: 120000,
        json: true
    };

    const tempoInicial = new BenchmarkService();

    return rp(options)
        .then(data => {
            printTempoExecucao(tempoInicial, 'filtraNodesPorCiclos');

            const nodesAlvo = data.nodes;

            const nodesFiltrados = grafo.nodes.map(node => {
                return (nodesAlvo.indexOf(node.id) !== -1) ? node : null
            }).filter(n => n !== null);

            const edgesFiltrados = grafo.edges.map(edge => {
                return (nodesAlvo.indexOf(edge.origem) !== -1 || nodesAlvo.indexOf(edge.destino)) ? edge : null
            }).filter(e => e !== null);

            return {
                nodes: nodesFiltrados,
                edges: edgesFiltrados
            }
        })
        .catch(error => {console.error(error)});
}

export let criaGrafo = function () {
    return {
        nodes: [],
        edges: []
    };
}
