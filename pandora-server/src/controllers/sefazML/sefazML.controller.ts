import { Request, Response } from 'express';
import { NovoLog } from '../../schemas/log.schema';

import {
    criaRespostaAPI,
    agrupaEFiltraDuplicados,
    validaCNPJ,
    logRequisicao,
    controllerError,
    getNomeFuncao,
} from '../../utils';

import {
    API_CODES,
    API_MSGS,
    LOG_SECOES,
    LOG_TIPOS_BUSCA
} from '../../config';

import {
    getItensAnomalos,
    getItemDetalhado,
    getTopFornecedores,
    getVendasFornecedor,
    getProdutos
} from './sefazML.functions';


const secao  = LOG_SECOES.APPS.NOME;
const item   = LOG_SECOES.APPS.ITENS.SEFAZML.NOME;
const itemRank   = LOG_SECOES.APPS.ITENS.SEFAZRANK.NOME;
const chaves = LOG_SECOES.APPS.ITENS.SEFAZML.CHAVES;
const tipos_busca = LOG_TIPOS_BUSCA;


export let getItemNFDetalhado = function (req: Request, res: Response) {
    let idItem = req.params.idItem;
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, item, valor: idItem, tipo: tipos_busca.SIMPLIFICADA, processo})
    logRequisicao(log)
            .then(() => getItemDetalhado(idItem))
            .then(bases => agrupaEFiltraDuplicados(bases))
            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}

export let getItensDiscrepantes = function (req: Request, res: Response) {
    let processo = req.query.processo;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, item, tipo: tipos_busca.SIMPLIFICADA, processo})
    logRequisicao(log)
            .then(() => getItensAnomalos(null, null, null, null, null, null))
            .then(bases => agrupaEFiltraDuplicados(bases))
            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}

export let getItensDiscrepantesMunicipio = function (req: Request, res: Response) {
    let municipio = req.params.municipio;
    let cnpjEmitente = req.query.cnpjEmitente;
    let cnpjDestinatario = req.query.cnpjDestinatario;
    let dtInicio = req.query.dtInicio;
    let dtFim = req.query.dtFim;
    let processo = req.query.processo;
    let produto = req.query.produtoSelecionado;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, item, valor: municipio, tipo: tipos_busca.SIMPLIFICADA, processo})

    logRequisicao(log)
            .then(() => getItensAnomalos(municipio, cnpjEmitente, cnpjDestinatario, dtInicio, dtFim, produto))
            .then(bases => agrupaEFiltraDuplicados(bases))

            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}

export let getTopFornecedoresComFiltros = function (req: Request, res: Response) {
    let topRank = req.params.top;
    let tipoProduto:string[];
    if (req.query.tipoProduto)
        tipoProduto = (req.query.tipoProduto as string).split(",");
    let dataIni = req.query.dataIni;
    let dataFim = req.query.dataFim;
    let cnpjDestinatario = req.query.cnpjDestinatario;
    let municipioDestinatario = req.query.municipioDestinatario;
    let processo = req.query.processo;
    let periodo = req.query.periodo;
    let suspeitos = req.query.suspeitos;
    let produto = req.query.produtoSelecionado;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, itemRank, valor: cnpjDestinatario, tipo: tipos_busca.SIMPLIFICADA, processo})

    logRequisicao(log)
            .then(() => getTopFornecedores(topRank, tipoProduto, dataIni, dataFim, periodo, cnpjDestinatario, municipioDestinatario, suspeitos, produto))
            .then(bases => agrupaEFiltraDuplicados(bases))

            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}

export let getTodasVendasFornecedor = function (req: Request, res: Response){
    let tipoProduto:string[];
    if (req.query.tipoProduto)
        tipoProduto = (req.query.tipoProduto as string).split(",");
    let dataIni = req.query.dataIni;
    let dataFim = req.query.dataFim;
    let cnpjDestinatario = req.query.cnpjDestinatario;
    let cnpjEmitente = req.query.cnpjEmitente;
    let processo = req.query.processo;
    let periodo = req.query.periodo;
    let suspeitos = req.query.suspeitos;
    let produto = req.query.produtoSelecionado;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, itemRank, valor: cnpjDestinatario, tipo: tipos_busca.SIMPLIFICADA, processo})
    logRequisicao(log)
            .then(() => getVendasFornecedor(tipoProduto, dataIni, dataFim, periodo, cnpjDestinatario, cnpjEmitente, suspeitos, produto))
            .then(bases => agrupaEFiltraDuplicados(bases))
            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}

export let getNomesProdutos = function (req: Request, res: Response){
    let nomeProduto = req.query.produto;
    const nomeFuncao = getNomeFuncao(1,1);
    const log = new NovoLog({req, secao, item, valor: nomeProduto, tipo: tipos_busca.SIMPLIFICADA, nomeProduto})
    logRequisicao(log)
            .then(() => getProdutos(nomeProduto))
            .then(bases => agrupaEFiltraDuplicados(bases))
            .then(bases => res.status(200).send(bases))
            .catch(error => controllerError(res, error, nomeFuncao));
}
