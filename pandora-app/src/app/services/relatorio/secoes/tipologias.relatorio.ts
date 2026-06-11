import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoTipologiasService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoTipologias(tipologias, tipo = 'PF') {
        if (!tipologias || tipologias.length === 0) { return null; }

        return [{ text: 'Tipologias', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['auto', '*'],
                body: this.criaTabelaTipologias(tipologias, tipo)
            },
            layout: this.relatorio.layout
        }];
    }

    criaTabelaTipologias(tipologias, tipo) {
        const headerTabela = [['ID', 'Descrição']];
        const indices = tipologias.map((tipo: any) => {
            return Array(54).fill(0).map((x, i) => (!!tipo['t' + i]) ? i : null).filter(x => x !== null);
        });
        let corpoTabela = indices[0].map(idx => {
            return [
                'T' + idx,
                //tipologias[0]['t' + idx],
                (tipo === 'PF') ? this.utils.mapeamentoTipologiaPF['t' + idx] : this.utils.mapeamentoTipologiaPJ['t' + idx]
            ];
        });
        const footerTabela = [
            [' ', ' '],
            //[{colSpan: 1, text: 'Peso total'}, tipologias[0].totalPeso],
            [{ colSpan: 1, text: 'Total de Ocorrências' }, tipologias[0].totalOcorrencias],
            [{ colSpan: 1, text: 'Doação Eleitoral' }, 'R$ ' + this.utils.converteEmDinheiro(tipologias[0].doacaoEleitoral)],
            [{ colSpan: 1, text: 'Taxa de Doação' }, Number(tipologias[0].taxaDoacao) + ' %'],
            [{ colSpan: 1, text: 'Total TCS' }, 'R$ ' + this.utils.converteEmDinheiro(tipologias[0].totalTCS)],
        ];
        corpoTabela = corpoTabela.concat(footerTabela);

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

}
