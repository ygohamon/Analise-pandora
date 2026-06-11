import * as moment from 'moment';
import * as _ from 'underscore';
import * as natural from 'natural';

import { removerAcentos } from './../../utils';
import { Pessoa, Empresa } from './../../models/schemas';

export let adicionaPessoaAoGrafo = function (grafo: { nodes: Array<any>, links: Array<any> }, elemento: any, relacionamento: string) {

    if (_.isArray(elemento)) {
        if (!_.isEmpty(elemento[0])) {
            elemento.forEach(el => {
                if (el.socio_cpf) {
                    el.id = el.socio_cpf;
                } else if (el.cpf) {
                    el.id = el.cpf;
                } else {
                    el.id = el.nome;
                }

                el.tipo = 'pessoa';
                if (relacionamento === 'alvo') { el.pesquisado = 'S'; }

                // Se não existir registro
                const indiceNode = _.findIndex(grafo.nodes, (n) => n.id === el.id);
                if (indiceNode === -1){
                    grafo.nodes.push(el);

                    if (relacionamento !== 'alvo') {
                        let idAlvo = _.find(grafo.links, link => link.relacionamento === "alvo").source;
                        let alvo = _.find(grafo.nodes, node => node.id === idAlvo);

                        grafo.links.push({ source: alvo.id, target: el.id, value: 1, relacionamento: relacionamento });
                    } else
                        grafo.links.push({ source: el.id, target: el.id, value: 1, relacionamento: relacionamento });
                } else {
                    Object.keys(el).forEach(attr => {
                        if (!grafo.nodes[indiceNode][attr]){
                            grafo.nodes[indiceNode][attr] = el[attr];
                        }
                    });

                    if (relacionamento !== 'alvo') {
                        const idAlvo     = _.find(grafo.links, link     => link.relacionamento === "alvo").source;
                        const alvo       = _.find(grafo.nodes, node     => node.id             === idAlvo);
                        const indiceLink = _.findIndex(grafo.links, (l) => l.source === alvo.id && l.target === el.id);

                        if (indiceLink !== -1) {
                            grafo.links[indiceLink].relacionamento += ' - ' + relacionamento;
                        }
                    } else{
                        const indiceLink = _.findIndex(grafo.links, (l) => l.source === el.id && l.target === el.id);

                        if (indiceLink !== -1) {
                            grafo.links[indiceLink].relacionamento += ' - ' + relacionamento;
                        }
                    }
                }
            })
        }
    }
}

export let adicionaEmpresaAoGrafo = function (grafo: { nodes: Array<any>, links: Array<any> }, elemento: any, relacionamento: string) {

    if (_.isArray(elemento)) {
        if (!_.isEmpty(elemento[0])) {
            elemento.forEach(el => {
                if (el.socio_cnpj)
                    el.id = el.socio_cnpj;
                else if (el.cnpj)
                    el.id = el.cnpj;
                else
                    el.id = el.razaoSocial;

                el.tipo = 'empresa';
                if (relacionamento === 'alvo') { el.pesquisado = 'S'; }

                // Se não existir registro
                const indiceNode = _.findIndex(grafo.nodes, (n) => n.id === el.id);
                if (indiceNode === -1) {
                    grafo.nodes.push(el);

                    if (relacionamento !== 'alvo') {
                        let idAlvo = _.find(grafo.links, link => link.relacionamento === "alvo").source;
                        let alvo   = _.find(grafo.nodes, node => node.id === idAlvo);

                        grafo.links.push({ source: alvo.id, target: el.id, value: 1, relacionamento: relacionamento });
                    } else
                        grafo.links.push({ source: el.id, target: el.id, value: 1, relacionamento: relacionamento });
                } else {
                    Object.keys(el).forEach(attr => {
                        if (!grafo.nodes[indiceNode][attr]) {
                            grafo.nodes[indiceNode][attr] = el[attr];
                        }
                    });

                    if (relacionamento !== 'alvo') {
                        const idAlvo = _.find(grafo.links, link => link.relacionamento === "alvo").source;
                        const alvo = _.find(grafo.nodes, node => node.id === idAlvo);
                        const indiceLink = _.findIndex(grafo.links, (l) => l.source === alvo.id && l.target === el.id);

                        if (indiceLink !== -1) {
                            grafo.links[indiceLink].relacionamento += ' - ' + relacionamento;
                        }
                    } else {
                        const indiceLink = _.findIndex(grafo.links, (l) => l.source === el.id && l.target === el.id);

                        if (indiceLink !== -1) {
                            grafo.links[indiceLink].relacionamento += ' - ' + relacionamento;
                        }
                    }
                }
            })
        }
    }
}

let grafoBrasil = {
    'AC': { 'AC': 0, 'AL': 5, 'AM': 1, 'AP': 3, 'BA': 4, 'CE': 5, 'DF': 4, 'ES': 5, 'GO': 3, 'MA': 3, 'MG': 4, 'MS': 3, 'MT': 2, 'PA': 2, 'PB': 6, 'PE': 5, 'PI': 4, 'PR': 4, 'RJ': 5, 'RN': 6, 'RO': 1, 'RR': 2, 'RS': 6, 'SC': 5, 'SE': 5, 'SP': 4, 'TO': 3, 'EX': 9 },
    'AL': { 'AC': 5, 'AL': 0, 'AM': 4, 'AP': 4, 'BA': 1, 'CE': 2, 'DF': 3, 'ES': 2, 'GO': 2, 'MA': 3, 'MG': 2, 'MS': 3, 'MT': 3, 'PA': 3, 'PB': 2, 'PE': 1, 'PI': 2, 'PR': 4, 'RJ': 3, 'RN': 3, 'RO': 4, 'RR': 4, 'RS': 6, 'SC': 5, 'SE': 1, 'SP': 3, 'TO': 2, 'EX': 9 },
    'AM': { 'AC': 1, 'AL': 4, 'AM': 0, 'AP': 2, 'BA': 3, 'CE': 4, 'DF': 3, 'ES': 4, 'GO': 2, 'MA': 2, 'MG': 3, 'MS': 2, 'MT': 1, 'PA': 1, 'PB': 5, 'PE': 4, 'PI': 3, 'PR': 3, 'RJ': 4, 'RN': 5, 'RO': 1, 'RR': 1, 'RS': 5, 'SC': 4, 'SE': 4, 'SP': 3, 'TO': 2, 'EX': 9 },
    'AP': { 'AC': 3, 'AL': 4, 'AM': 2, 'AP': 0, 'BA': 3, 'CE': 4, 'DF': 4, 'ES': 4, 'GO': 3, 'MA': 2, 'MG': 4, 'MS': 3, 'MT': 2, 'PA': 1, 'PB': 5, 'PE': 4, 'PI': 3, 'PR': 4, 'RJ': 5, 'RN': 5, 'RO': 3, 'RR': 2, 'RS': 6, 'SC': 5, 'SE': 4, 'SP': 4, 'TO': 2, 'EX': 9 },
    'BA': { 'AC': 4, 'AL': 1, 'AM': 3, 'AP': 3, 'BA': 0, 'CE': 2, 'DF': 2, 'ES': 1, 'GO': 1, 'MA': 2, 'MG': 1, 'MS': 2, 'MT': 2, 'PA': 2, 'PB': 2, 'PE': 1, 'PI': 1, 'PR': 3, 'RJ': 2, 'RN': 3, 'RO': 3, 'RR': 3, 'RS': 5, 'SC': 4, 'SE': 1, 'SP': 2, 'TO': 1, 'EX': 9 },
    'CE': { 'AC': 5, 'AL': 2, 'AM': 4, 'AP': 4, 'BA': 2, 'CE': 0, 'DF': 4, 'ES': 3, 'GO': 3, 'MA': 2, 'MG': 3, 'MS': 4, 'MT': 3, 'PA': 3, 'PB': 1, 'PE': 1, 'PI': 1, 'PR': 5, 'RJ': 4, 'RN': 1, 'RO': 4, 'RR': 4, 'RS': 7, 'SC': 6, 'SE': 3, 'SP': 4, 'TO': 2, 'EX': 9 },
    'DF': { 'AC': 4, 'AL': 3, 'AM': 3, 'AP': 4, 'BA': 2, 'CE': 4, 'DF': 0, 'ES': 3, 'GO': 1, 'MA': 3, 'MG': 2, 'MS': 2, 'MT': 2, 'PA': 3, 'PB': 4, 'PE': 3, 'PI': 3, 'PR': 3, 'RJ': 3, 'RN': 5, 'RO': 3, 'RR': 4, 'RS': 5, 'SC': 4, 'SE': 3, 'SP': 3, 'TO': 2, 'EX': 9 },
    'ES': { 'AC': 5, 'AL': 2, 'AM': 4, 'AP': 4, 'BA': 1, 'CE': 3, 'DF': 3, 'ES': 0, 'GO': 2, 'MA': 3, 'MG': 1, 'MS': 3, 'MT': 3, 'PA': 3, 'PB': 3, 'PE': 2, 'PI': 2, 'PR': 3, 'RJ': 1, 'RN': 4, 'RO': 4, 'RR': 4, 'RS': 5, 'SC': 4, 'SE': 2, 'SP': 2, 'TO': 2, 'EX': 9 },
    'GO': { 'AC': 3, 'AL': 2, 'AM': 2, 'AP': 3, 'BA': 1, 'CE': 3, 'DF': 1, 'ES': 2, 'GO': 0, 'MA': 2, 'MG': 1, 'MS': 1, 'MT': 1, 'PA': 2, 'PB': 3, 'PE': 2, 'PI': 2, 'PR': 2, 'RJ': 2, 'RN': 4, 'RO': 2, 'RR': 3, 'RS': 4, 'SC': 3, 'SE': 2, 'SP': 2, 'TO': 1, 'EX': 9 },
    'MA': { 'AC': 3, 'AL': 3, 'AM': 2, 'AP': 2, 'BA': 2, 'CE': 2, 'DF': 3, 'ES': 3, 'GO': 2, 'MA': 0, 'MG': 3, 'MS': 3, 'MT': 2, 'PA': 1, 'PB': 3, 'PE': 2, 'PI': 1, 'PR': 4, 'RJ': 4, 'RN': 3, 'RO': 3, 'RR': 2, 'RS': 6, 'SC': 5, 'SE': 3, 'SP': 4, 'TO': 1, 'EX': 9 },
    'MG': { 'AC': 4, 'AL': 2, 'AM': 3, 'AP': 4, 'BA': 1, 'CE': 3, 'DF': 2, 'ES': 1, 'GO': 1, 'MA': 3, 'MG': 0, 'MS': 2, 'MT': 2, 'PA': 3, 'PB': 3, 'PE': 2, 'PI': 2, 'PR': 2, 'RJ': 1, 'RN': 4, 'RO': 3, 'RR': 4, 'RS': 4, 'SC': 3, 'SE': 2, 'SP': 1, 'TO': 2, 'EX': 9 },
    'MS': { 'AC': 3, 'AL': 3, 'AM': 2, 'AP': 3, 'BA': 2, 'CE': 4, 'DF': 2, 'ES': 3, 'GO': 1, 'MA': 3, 'MG': 2, 'MS': 0, 'MT': 1, 'PA': 2, 'PB': 4, 'PE': 3, 'PI': 3, 'PR': 1, 'RJ': 2, 'RN': 5, 'RO': 2, 'RR': 3, 'RS': 3, 'SC': 2, 'SE': 3, 'SP': 1, 'TO': 2, 'EX': 9 },
    'MT': { 'AC': 2, 'AL': 3, 'AM': 1, 'AP': 2, 'BA': 2, 'CE': 3, 'DF': 2, 'ES': 3, 'GO': 1, 'MA': 2, 'MG': 2, 'MS': 1, 'MT': 0, 'PA': 1, 'PB': 4, 'PE': 3, 'PI': 2, 'PR': 2, 'RJ': 3, 'RN': 4, 'RO': 1, 'RR': 2, 'RS': 4, 'SC': 3, 'SE': 3, 'SP': 2, 'TO': 1, 'EX': 9 },
    'PA': { 'AC': 2, 'AL': 3, 'AM': 1, 'AP': 1, 'BA': 2, 'CE': 3, 'DF': 3, 'ES': 3, 'GO': 2, 'MA': 1, 'MG': 3, 'MS': 2, 'MT': 1, 'PA': 0, 'PB': 4, 'PE': 3, 'PI': 2, 'PR': 3, 'RJ': 4, 'RN': 4, 'RO': 2, 'RR': 1, 'RS': 5, 'SC': 4, 'SE': 3, 'SP': 3, 'TO': 1, 'EX': 9 },
    'PB': { 'AC': 6, 'AL': 2, 'AM': 5, 'AP': 5, 'BA': 2, 'CE': 1, 'DF': 4, 'ES': 3, 'GO': 3, 'MA': 3, 'MG': 3, 'MS': 4, 'MT': 4, 'PA': 4, 'PB': 0, 'PE': 1, 'PI': 2, 'PR': 5, 'RJ': 4, 'RN': 1, 'RO': 5, 'RR': 5, 'RS': 7, 'SC': 6, 'SE': 3, 'SP': 4, 'TO': 3, 'EX': 9 },
    'PE': { 'AC': 5, 'AL': 1, 'AM': 4, 'AP': 4, 'BA': 1, 'CE': 1, 'DF': 3, 'ES': 2, 'GO': 2, 'MA': 2, 'MG': 2, 'MS': 3, 'MT': 3, 'PA': 3, 'PB': 1, 'PE': 0, 'PI': 1, 'PR': 4, 'RJ': 3, 'RN': 2, 'RO': 4, 'RR': 4, 'RS': 6, 'SC': 5, 'SE': 2, 'SP': 3, 'TO': 2, 'EX': 9 },
    'PI': { 'AC': 4, 'AL': 2, 'AM': 3, 'AP': 3, 'BA': 1, 'CE': 1, 'DF': 3, 'ES': 2, 'GO': 2, 'MA': 1, 'MG': 2, 'MS': 3, 'MT': 2, 'PA': 2, 'PB': 2, 'PE': 1, 'PI': 0, 'PR': 4, 'RJ': 3, 'RN': 2, 'RO': 3, 'RR': 3, 'RS': 6, 'SC': 5, 'SE': 2, 'SP': 3, 'TO': 1, 'EX': 9 },
    'PR': { 'AC': 4, 'AL': 4, 'AM': 3, 'AP': 4, 'BA': 3, 'CE': 5, 'DF': 3, 'ES': 3, 'GO': 2, 'MA': 4, 'MG': 2, 'MS': 1, 'MT': 2, 'PA': 3, 'PB': 5, 'PE': 4, 'PI': 4, 'PR': 0, 'RJ': 2, 'RN': 6, 'RO': 3, 'RR': 4, 'RS': 2, 'SC': 1, 'SE': 4, 'SP': 1, 'TO': 3, 'EX': 9 },
    'RJ': { 'AC': 5, 'AL': 3, 'AM': 4, 'AP': 5, 'BA': 2, 'CE': 4, 'DF': 3, 'ES': 1, 'GO': 2, 'MA': 4, 'MG': 1, 'MS': 2, 'MT': 3, 'PA': 4, 'PB': 4, 'PE': 3, 'PI': 3, 'PR': 2, 'RJ': 0, 'RN': 5, 'RO': 4, 'RR': 5, 'RS': 4, 'SC': 3, 'SE': 3, 'SP': 1, 'TO': 3, 'EX': 9 },
    'RN': { 'AC': 6, 'AL': 3, 'AM': 5, 'AP': 5, 'BA': 3, 'CE': 1, 'DF': 5, 'ES': 4, 'GO': 4, 'MA': 3, 'MG': 4, 'MS': 5, 'MT': 4, 'PA': 4, 'PB': 1, 'PE': 2, 'PI': 2, 'PR': 6, 'RJ': 5, 'RN': 0, 'RO': 5, 'RR': 5, 'RS': 8, 'SC': 7, 'SE': 4, 'SP': 5, 'TO': 3, 'EX': 9 },
    'RO': { 'AC': 1, 'AL': 4, 'AM': 1, 'AP': 3, 'BA': 3, 'CE': 4, 'DF': 3, 'ES': 4, 'GO': 2, 'MA': 3, 'MG': 3, 'MS': 2, 'MT': 1, 'PA': 2, 'PB': 5, 'PE': 4, 'PI': 3, 'PR': 3, 'RJ': 4, 'RN': 5, 'RO': 0, 'RR': 2, 'RS': 5, 'SC': 4, 'SE': 4, 'SP': 3, 'TO': 2, 'EX': 9 },
    'RR': { 'AC': 2, 'AL': 4, 'AM': 1, 'AP': 2, 'BA': 3, 'CE': 4, 'DF': 4, 'ES': 4, 'GO': 3, 'MA': 2, 'MG': 4, 'MS': 3, 'MT': 2, 'PA': 1, 'PB': 5, 'PE': 4, 'PI': 3, 'PR': 4, 'RJ': 5, 'RN': 5, 'RO': 2, 'RR': 0, 'RS': 6, 'SC': 5, 'SE': 4, 'SP': 4, 'TO': 2, 'EX': 9 },
    'RS': { 'AC': 6, 'AL': 6, 'AM': 5, 'AP': 6, 'BA': 5, 'CE': 7, 'DF': 5, 'ES': 5, 'GO': 4, 'MA': 6, 'MG': 4, 'MS': 3, 'MT': 4, 'PA': 5, 'PB': 7, 'PE': 6, 'PI': 6, 'PR': 2, 'RJ': 4, 'RN': 8, 'RO': 5, 'RR': 6, 'RS': 0, 'SC': 1, 'SE': 6, 'SP': 3, 'TO': 5, 'EX': 9 },
    'SC': { 'AC': 5, 'AL': 5, 'AM': 4, 'AP': 5, 'BA': 4, 'CE': 6, 'DF': 4, 'ES': 4, 'GO': 3, 'MA': 5, 'MG': 3, 'MS': 2, 'MT': 3, 'PA': 4, 'PB': 6, 'PE': 5, 'PI': 5, 'PR': 1, 'RJ': 3, 'RN': 7, 'RO': 4, 'RR': 5, 'RS': 1, 'SC': 0, 'SE': 5, 'SP': 2, 'TO': 4, 'EX': 9 },
    'SE': { 'AC': 5, 'AL': 1, 'AM': 4, 'AP': 4, 'BA': 1, 'CE': 3, 'DF': 3, 'ES': 2, 'GO': 2, 'MA': 3, 'MG': 2, 'MS': 3, 'MT': 3, 'PA': 3, 'PB': 3, 'PE': 2, 'PI': 2, 'PR': 4, 'RJ': 3, 'RN': 4, 'RO': 4, 'RR': 4, 'RS': 6, 'SC': 5, 'SE': 0, 'SP': 3, 'TO': 2, 'EX': 9 },
    'SP': { 'AC': 4, 'AL': 3, 'AM': 3, 'AP': 4, 'BA': 2, 'CE': 4, 'DF': 3, 'ES': 2, 'GO': 2, 'MA': 4, 'MG': 1, 'MS': 1, 'MT': 2, 'PA': 3, 'PB': 4, 'PE': 3, 'PI': 3, 'PR': 1, 'RJ': 1, 'RN': 5, 'RO': 3, 'RR': 4, 'RS': 3, 'SC': 2, 'SE': 3, 'SP': 0, 'TO': 3, 'EX': 9 },
    'TO': { 'AC': 3, 'AL': 2, 'AM': 2, 'AP': 2, 'BA': 1, 'CE': 2, 'DF': 2, 'ES': 2, 'GO': 1, 'MA': 1, 'MG': 2, 'MS': 2, 'MT': 1, 'PA': 1, 'PB': 3, 'PE': 2, 'PI': 1, 'PR': 3, 'RJ': 3, 'RN': 3, 'RO': 2, 'RR': 2, 'RS': 5, 'SC': 4, 'SE': 2, 'SP': 3, 'TO': 0, 'EX': 9 },
    'EX': { 'AC': 9, 'AL': 9, 'AM': 9, 'AP': 9, 'BA': 9, 'CE': 9, 'DF': 9, 'ES': 9, 'GO': 9, 'MA': 9, 'MG': 9, 'MS': 9, 'MT': 9, 'PA': 9, 'PB': 9, 'PE': 9, 'PI': 9, 'PR': 9, 'RJ': 9, 'RN': 9, 'RO': 9, 'RR': 9, 'RS': 9, 'SC': 9, 'SE': 9, 'SP': 9, 'TO': 9, 'EX': 1 },
}

let maioresValoresDistribuicaoFitnessIdadeMae = {
    0: 0.062666917774232389, 1: 0.062715041431180632, 2: 0.062762472646189782, 3: 0.062809208733671448, 4: 0.062855247024847544, 5: 0.062900584867934414,
    6: 0.062945219628328233, 7: 0.062989148688789839, 8: 0.06303236944962913, 9: 0.063074879328889055, 10: 0.063116675762529828, 11: 0.063157756204613058,
    12: 0.063198118127484507, 13: 0.063237759021957982, 14: 0.063276676397497886, 15: 0.063314867782402057, 16: 0.063352330723983649, 17: 0.063389062788753628,
    18: 0.063425061562602053, 19: 0.063460324650979269, 20: 0.063494849679076967, 21: 0.063528634292008279, 22: 0.063561676154988214, 23: 0.063609165030949377,
    24: 0.063678463473381686, 25: 0.063747071037583647, 26: 0.063814984177416392, 27: 0.063882199360886974, 28: 0.063948713070379345, 29: 0.06401452180288511,
    30: 0.06407962207023489, 31: 0.064144010399329793, 32: 0.06420768333237277, 33: 0.064270637427100555, 34: 0.064332869257015576, 35: 0.064394375411617744,
    36: 0.064455152496636803, 37: 0.064515197134264332, 38: 0.064574505963386236, 39: 0.064633075639815102, 40: 0.064690902836522318, 41: 0.064747984243870876,
    42: 0.064804316569847628, 43: 0.064859896540295642, 44: 0.064914720899146836, 45: 0.064968786408654278, 46: 0.065022089849624404, 47: 0.065074628021649469,
    48: 0.065126397743339531, 49: 0.065177395852554568, 50: 0.065227619206636597, 51: 0.065277064682641286, 52: 0.0653257291775695, 53: 0.065373609608599031,
    54: 0.065420702913315767, 55: 0.065467006049944557, 56: 0.06551251599758047, 57: 0.065557229756418922, 58: 0.065601144347986196, 59: 0.065644256815369659,
    60: 0.065686564223447139, 61: 0.065728063659116459, 62: 0.065768752231524827, 63: 0.065808627072297038, 64: 0.065847685335764211, 65: 0.065885924199191453,
    66: 0.065923340863005761, 67: 0.065959932551022629, 68: 0.066026890262274485, 69: 0.066104155971982714, 70: 0.066180658951681987, 71: 0.066256394971135307,
    72: 0.066331359815806512, 73: 0.066405549287150797, 74: 0.066478959202905391, 75: 0.06655158539738143, 76: 0.066623423721755268, 77: 0.066694470044360743,
    78: 0.066764720250981777, 79: 0.066834170245145069, 80: 0.066902815948413269, 81: 0.066970653300678237, 82: 0.06703767826045505, 83: 0.067103886805175497,
    84: 0.067169274931482809, 85: 0.06723383865552536, 86: 0.067297574013251718, 87: 0.067360477060705165, 88: 0.067422543874318522, 89: 0.067483770551209257,
    90: 0.067544153209474211, 91: 0.067603687988485317, 92: 0.067662371049184225, 93: 0.067720198574377666, 94: 0.067777166769033004, 95: 0.067833271860572877,
    96: 0.067888510099171073, 97: 0.067942877758046763, 98: 0.067996371133760433, 99: 0.068048986546508025, 100: 0.068100720340416199, 101: 0.068151568883836694,
    102: 0.06820152856964086, 103: 0.068250595815514015, 104: 0.068298767064249061, 105: 0.068346038784040761, 106: 0.068392407468778602, 107: 0.068437869638340615,
    108: 0.068482421838885574, 109: 0.068526060643146008, 110: 0.068568782650720125, 111: 0.068610584488363116, 112: 0.068654769554722259, 113: 0.068742557393327935,
    114: 0.068829502737321371, 115: 0.068915600453529346, 116: 0.069000845425724336, 117: 0.069085232554995796, 118: 0.069168756760121269, 119: 0.0692514129779392,
    120: 0.069333196163721411, 121: 0.069414101291547681, 122: 0.069494123354679541, 123: 0.069573257365936059, 124: 0.069651498358069372, 125: 0.069728841384141399,
    126: 0.069805281517900789, 127: 0.069880813854160576, 128: 0.069955433509176698, 129: 0.07002913562102614, 130: 0.070101915349986901, 131: 0.070173767878916979,
    132: 0.070244688413634931, 133: 0.070314672183300161, 134: 0.070383714440793957, 135: 0.070451810463100437, 136: 0.070518955551688536, 137: 0.070585145032893218,
    138: 0.070650374258298343, 139: 0.070714638605118077, 140: 0.070777933476579957, 141: 0.070840254302307504, 142: 0.070901596538702663, 143: 0.070961955669328988,
    144: 0.071021327205294471, 145: 0.071079706685634597, 146: 0.071137089677694956, 147: 0.071193471777514866, 148: 0.07124884861020947, 149: 0.07130321583035322
}

let gammaFunction = function (n) {
    //some magic constants 
    var g = 7, // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
        p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (n < 0.5) {
        return Math.PI / Math.sin(n * Math.PI) / gammaFunction(1 - n);
    }
    else {
        n--;
        var x = p[0];
        for (var i = 1; i < g + 2; i++) {
            x += p[i] / (n + i);
        }
        var t = n + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
    }
}


let fitnessIdadePai = function (dataPai, dataFilho) {
    if (!dataPai || !dataFilho) {
        return 0;
    }

    const pai = moment(dataPai);
    const filho = moment(dataFilho);
    const idadeQuandoPai = filho.diff(pai, 'years');

    const shift = 10;
    const escala = 5;
    const param = (idadeQuandoPai - shift) / escala;

    return 100 * ((param ** 4) / (24 * escala * Math.exp(param)));
}

let fitnessIdadeMae = function (dataMae, dataFilho) {
    if (!dataMae || !dataFilho) {
        return 0;
    }

    const pai            = moment(dataMae);
    const filho          = moment(dataFilho);
    const idadeQuandoMae = filho.diff(pai, 'years');
    const anosAtras      = moment().diff(moment(dataFilho), 'years');

    const shift  = 11;
    const escala = 2.8;
    const a      = 6;
    let _a       = a - 8 * anosAtras / 1000;
    const rGamma = gammaFunction(_a);
    const param  = ((idadeQuandoMae - shift) / escala);

    return ((((idadeQuandoMae - shift) / escala) ** (_a - 1)) / (rGamma * escala * Math.exp(((idadeQuandoMae - shift) / escala)))) / maioresValoresDistribuicaoFitnessIdadeMae[anosAtras];
}

let fitnessLocal = function (ufPai, ufFilho) {
    if (!ufPai || !ufFilho) {
        return 0;
    }

    //return 1 / (grafoBrasil[ufPai][ufFilho] + 1);
    return 1 / ((grafoBrasil[ufPai][ufFilho] + 1) ** (0.7));
}

// Estima a relavancia da informacao da pessoa morar perto dos seus pais
let fitnessRelevanciaLocal = function (dataNascimento) {
    if (!dataNascimento) {
        return 0;
    }

    const idade = moment().diff(moment(dataNascimento), 'years');

    const param = 100;
    return Math.exp(-idade / param);
}

let fitnessRelevanciaNome = function (nome) {
    if (!nome) {
        return 0;
    }

    const param = 0.05;

    return (nome.split(" ").length) ** (param);
}

let fitnessNome = function (nomeReal, nomeEncontrado) {
    if (!nomeReal || !nomeEncontrado) {
        return 0;
    }

    //return ss.compareTwoStrings(removerAcentos(nomeReal), removerAcentos(nomeEncontrado) );
    const pesoDice = 0.7;
    const pesoJaroWinkler = 0.3;

    const _nomeReal = removerAcentos(nomeReal);
    const _nomeEncontrado = removerAcentos(nomeEncontrado);

    return (pesoDice * natural.DiceCoefficient(_nomeReal, _nomeEncontrado)
        + pesoJaroWinkler * natural.JaroWinklerDistance(_nomeReal, _nomeEncontrado)) ** (3);
}

export let heuristicaFilhos = function (possiveisFilhos: Array<Pessoa>, pai: Pessoa) {

    let filhosComObjetivo = possiveisFilhos.map((filho: any) => {
        
        if (pai.sexo === 'Masculino' && removerAcentos(filho.nomePai) !== removerAcentos(pai.nome)) {
            return null;
        }
        if (pai.sexo === 'Feminino' && removerAcentos(filho.nomeMae) !== removerAcentos(pai.nome)) {
            return null;
        }
        
        const limiarObjetivoFilho = 0.7;
        let pesoTotal = 0;
        let objetivo = 0;
        let pesoIdade = 1;
        let pesoLocal = 2.5;
        let pesoNome = 0.8;

        if (filho.dataNascimento) {
            // FIT IDADE
            const fitIdade = (pai.sexo === 'Masculino') ?
                fitnessIdadePai(pai.dataNascimento, filho.dataNascimento) / 4 :
                fitnessIdadeMae(pai.dataNascimento, filho.dataNascimento);
            //console.log('fitIdade', fitIdade);

            objetivo += pesoIdade * fitIdade;
        }
        if (filho.uf) {
            // FIT LOCALIZACAO
            const relevanciaLocal = fitnessRelevanciaLocal(filho.dataNascimento);
            const fitLocal = fitnessLocal(pai.uf, filho.uf);

            //console.log('fitLocal', fitLocal);
            //console.log('relevanciaLocal', relevanciaLocal);

            pesoLocal *= relevanciaLocal;
            objetivo += pesoLocal * fitLocal;
        }
        if (filho.nome) {
            // const fitNome  = (pai.sexo === 'Masculino') ?
            //     fitnessNome(filho.nomePai, pai.nome) :
            //     fitnessNome(filho.nomeMae, pai.nome);
            const relevanciaNome = fitnessRelevanciaNome(pai.nome);
            const fitNome = 1;

            //console.log('fitNome', fitNome);
            //console.log('relevanciaNome', relevanciaNome);

            pesoNome *= relevanciaNome;
            objetivo += pesoNome * fitNome;
        }

        pesoTotal = pesoNome + pesoLocal + pesoIdade;

        //console.log('pre objetivo', objetivo)
        filho.objetivo = objetivo / pesoTotal;
        //console.log('objetivo', filho.objetivo)

        if (filho.objetivo < limiarObjetivoFilho) {
            return null;
        }

        return filho;
    }).filter(f => f !== null);
    filhosComObjetivo = _.sortBy(filhosComObjetivo, (d) => d.cpf).reverse();
    filhosComObjetivo = _.uniq(filhosComObjetivo, (d) => d.nome + '|' + d.dataNascimento)
    return _.sortBy(filhosComObjetivo, (d) => d.objetivo).reverse();
}

export let heuristicaPai = function (possiveisPais: Array<Pessoa>, filho: Pessoa, rankTop = 3) {

    let paisComObjetivo = possiveisPais.map((pai: any) => {
        //console.log('pai', pai);
        //console.log('filho', filho);
        const fitNome = fitnessNome(filho.nomePai, pai.nome);
        if (fitNome < 0.9) {
            return null;
        }

        //console.log('pai', pai);

        let pesoTotal = 0;
        let objetivo = 0;
        if (filho.dataNascimento) {
            // FIT IDADE
            // Scale para tornar o fit entre 0 e 1
            const pesoIdade = 1;
            const fitIdade = fitnessIdadePai(pai.dataNascimento, filho.dataNascimento) / 4;
            //console.log('fitIdade', fitIdade);

            objetivo += pesoIdade * fitIdade;
            pesoTotal += pesoIdade;
        }
        if (filho.uf) {
            // FIT LOCALIZACAO
            const pesoLocal = 3;
            const fitLocal = fitnessLocal(pai.uf, filho.uf);//fitnessIdadePai(pai.dataNascimento, filho.dataNascimento) / 4;
            //console.log('fitLocal', fitLocal);

            objetivo += pesoLocal * fitLocal;
            pesoTotal += pesoLocal;
        }
        if (filho.nome) {
            // FIT NOME
            const pesoNome = 5;
            const fitNome = fitnessNome(filho.nomePai, pai.nome);
            //console.log('fitNome', fitNome);

            objetivo += pesoNome * fitNome;
            pesoTotal += pesoNome;
        }

        //console.log('pre objetivo', objetivo)
        pai.objetivo = objetivo / pesoTotal;
        //console.log('objetivo', pai.objetivo)
        //console.log('\n\n');

        return pai;
    }).filter(f => f !== null);
    const finalistas = _.sortBy(paisComObjetivo, (d) => d.objetivo).reverse().slice(0, rankTop);
    const limiarPai = 0.95;
    const vencedor = finalistas.filter(d => d.objetivo >= limiarPai);

    if (vencedor.length === 1) {
        return vencedor;
    } else {
        return finalistas;
    }
}

export let heuristicaMae = function (possiveisMaes: Array<Pessoa>, filho: Pessoa, rankTop = 3) {

    let maesComObjetivo = possiveisMaes.map((mae: any) => {
        const fitNome = fitnessNome(filho.nomeMae, mae.nome);
        if (fitNome < 0.9) {
            return null;
        }

        //console.log('mae', mae);

        let pesoTotal = 0;
        let objetivo = 0;
        if (filho.dataNascimento) {
            // FIT IDADE
            // Scale para tornar o fit entre 0 e 1
            const pesoIdade = 1;
            const fitIdade = fitnessIdadeMae(mae.dataNascimento, filho.dataNascimento);
            //console.log('fitIdade', fitIdade);

            objetivo += pesoIdade * fitIdade;
            pesoTotal += pesoIdade;
        }
        if (filho.uf) {
            // FIT LOCALIZACAO
            const pesoLocal = 3;
            const fitLocal = fitnessLocal(mae.uf, filho.uf);
            //console.log('fitLocal', fitLocal);

            objetivo += pesoLocal * fitLocal;
            pesoTotal += pesoLocal;
        }
        if (filho.nome) {
            // FIT NOME
            const pesoNome = 5;
            const fitNome = fitnessNome(filho.nomeMae, mae.nome);
            //console.log('fitNome', fitNome);

            objetivo += pesoNome * fitNome;
            pesoTotal += pesoNome;
        }

        //console.log('pre objetivo', objetivo)
        mae.objetivo = objetivo / pesoTotal
        //console.log('objetivo', mae.objetivo)
        //console.log('\n\n');

        return mae;
    }).filter(f => f !== null);
    const finalistas = _.sortBy(maesComObjetivo, (d) => d.objetivo).reverse().slice(0, rankTop);
    const limiarMae = 0.95;
    const vencedor = finalistas.filter(d => d.objetivo >= limiarMae);

    if (vencedor.length === 1) {
        return vencedor;
    } else {
        return finalistas;
    }
}
