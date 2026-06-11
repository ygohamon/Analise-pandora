import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoOperacoesService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaTabelaOperacoes(registros) {
        const headerTabela = [['Nome da Operação', 'Data da Operação']];
        const corpoTabela = registros.map(registro => {
            return [
                (registro.nomeOperacao) ? registro.nomeOperacao : '',
                (registro.dataOperacao) ? this.utils.formataData(registro.dataOperacao) : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    }

    criaSecaoOperacoes(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [{ text: 'Operações', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: ['*', 'auto'],
                body: this.criaTabelaOperacoes(registros)
            },
            layout: this.relatorio.layout
        }];
    }
}
