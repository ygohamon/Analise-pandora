import * as tipologiaModel from './../../models/tipologia';
import * as utilsModel from './../../models/utils/utils.model';

import {
    filtraNaoEncontrados,
    print,
    limpaNumero,
} from './../../utils';

const tiposAnalise = ['geral', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

export let tipoValido = function (tipo: string) {
    return (tiposAnalise.indexOf(tipo) !== -1) ? true : false;
}

let procuraTipologiasAnaliseGeralUgestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaSimplificadaFP_SISOBI(cdugestora, dtInicio, dtFim),                      // T1
        tipologiaModel.getTipologiaSimplificadaEmpenhos_SISOBI(cdugestora, dtInicio, dtFim),                // T2

        tipologiaModel.getTipologiaSimplificadaFP_ENDERECOSRF(cdugestora, dtInicio, dtFim),                 // T3
        tipologiaModel.getTipologiaSimplificadaFP_ENDERECOSRE(cdugestora, dtInicio, dtFim),                 // T4

        tipologiaModel.getTipologiaSimplificadaFP_SocioPJ(cdugestora, dtInicio, dtFim),                     // T5
        tipologiaModel.getTipologiaSimplificadaFP_ResponsavelPJ(cdugestora, dtInicio, dtFim),               // T6

        tipologiaModel.getTipologiaSimplificadoFP_ExtraVinculos(cdugestora, dtInicio, dtFim),               // T7
        tipologiaModel.getTipologiaSimplificadoFP_BD_RAIS(cdugestora, dtInicio, dtFim),                       // T8

        tipologiaModel.getTipologiaSimplificadoFP_Analfabetos(cdugestora, dtInicio, dtFim),                 // T9
        tipologiaModel.getTipologiaSimplificadoFP_BolsaFamilia(cdugestora, dtInicio, dtFim),                // T10
        //tipologiaModel.getTipologiaSimplificadoFP_BolsaFamilia_Veiculos(cdugestora, dtInicio, dtFim),     // T11

        tipologiaModel.getTipologiaSimplificadoFP_SIAF(cdugestora, dtInicio, dtFim),                        // T11

        tipologiaModel.getTipologiaSimplificadoFP_TipologiasTCU(cdugestora, dtInicio, dtFim),               // T12
        tipologiaModel.getTipologiaSimplificadoFP_TipologiasTCU_Doadores(cdugestora, dtInicio, dtFim),      // T13

        tipologiaModel.getTipologiaSimplificadoFP_CPFInexistente(cdugestora, dtInicio, dtFim),              // T14

        tipologiaModel.getTipologiaSimplificadoFP_FiliacaoPartidariaRegular(cdugestora, dtInicio, dtFim),   // T15
        tipologiaModel.getTipologiaSimplificadoFP_FiliacaoPartidariaCancelada(cdugestora, dtInicio, dtFim), // T16

        tipologiaModel.getTipologiaSimplificadoFP_Cadicon(cdugestora, dtInicio, dtFim),                     // T17
        tipologiaModel.getTipologiaSimplificadoFP_CEIS(cdugestora, dtInicio, dtFim),                        // T18
    ])
        // .then(tipologias => retornaErroSeEncontraErro(tipologias))
        .then(tipologias => filtraNaoEncontrados(tipologias))
        //.then(tipologias => print(tipologias, 'procuraTipologiasAnaliseGeralUgestora'))
}


// T1
let procuraTipologiasAnaliseFP_SISOBI_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaFP_SISOBI(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

// T2
let procuraTipologiasAnaliseEmpenhos_SISOBI_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaEmpenhos_SISOBI(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

// T3
let procuraTipologiasAnaliseFP_EnderecosRF_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaFP_ENDERECOSRF(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

// T4
let procuraTipologiasAnaliseFP_EnderecosRE_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaFP_ENDERECOSRE(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

// T5
let procuraTipologiasAnaliseFP_SocioPJ_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaFP_SocioPJ(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

// T8
let procuraTipologiasAnaliseFP_Extravinculo_Detalhada_Ugestora = function (cdugestora: string, dtInicio: string, dtFim: string) {
    cdugestora = limpaNumero(cdugestora);

    return Promise.all([
        tipologiaModel.getTipologiaDetalhadaFP_ExtraVinculos(cdugestora, dtInicio, dtFim),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}


export let procuraOrgaoSagresMunicipal = function (orgao: string) {
    return Promise.all([
        utilsModel.getOrgaoSagresMunicipal(orgao),
    ])
        .then(tipologias => filtraNaoEncontrados(tipologias))
}

export let procuraTipologiasAnalise = function (cdugestora: string, dtInicio: string, dtFim: string, tipoAnalise: string) {

    let analise;

    if (tipoAnalise === 'geral') { analise = procuraTipologiasAnaliseGeralUgestora(cdugestora, dtInicio, dtFim); }

    else if (tipoAnalise === 't1') { analise = procuraTipologiasAnaliseFP_SISOBI_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }
    else if (tipoAnalise === 't2') { analise = procuraTipologiasAnaliseEmpenhos_SISOBI_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }

    else if (tipoAnalise === 't3') { analise = procuraTipologiasAnaliseFP_EnderecosRF_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }
    else if (tipoAnalise === 't4') { analise = procuraTipologiasAnaliseFP_EnderecosRE_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }

    else if (tipoAnalise === 't5') { analise = procuraTipologiasAnaliseFP_SocioPJ_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }
    else if (tipoAnalise === 't6') { analise = procuraTipologiasAnaliseGeralUgestora(cdugestora, dtInicio, dtFim); }
    else if (tipoAnalise === 't7') { analise = procuraTipologiasAnaliseGeralUgestora(cdugestora, dtInicio, dtFim); }

    else if (tipoAnalise === 't8') { analise = procuraTipologiasAnaliseFP_Extravinculo_Detalhada_Ugestora(cdugestora, dtInicio, dtFim); }
    else { analise = null; }

    return analise;
}
