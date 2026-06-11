import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoTelefonesService {

    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaSecaoTelefones(telefones) {
        if (!telefones || telefones.length === 0) { return null; }

        return [{ text: 'Telefones', style: 'secao' },
        {
            style: 'tabela',
            table: {
                widths: [100, '*'],
                body: this.criaTabelaTelefones(telefones)
            },
            layout: this.relatorio.layout
        }];
    };

    criaTabelaTelefones(telefones) {
        const headerTabela = [['DDD', 'Número']];
        const corpoTabela = telefones.map(telefone => {
            return [
                (telefone.ddd)      ? telefone.ddd : '',
                (telefone.telefone) ? telefone.telefone : '',
            ];
        });

        return this.relatorio.formataCabecalhoTabela(headerTabela).concat(corpoTabela);
    };
}
