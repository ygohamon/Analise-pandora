import { Injectable, Inject, forwardRef } from '@angular/core';

import { RelatorioUtilsService } from './../../relatorio.utils';
import { UtilsService } from './../../../common/utils.service';

@Injectable()
export class RelatorioSecaoQualificacaoService {
    
    constructor(private utils: UtilsService,
                private relatorio: RelatorioUtilsService) { }

    criaTextoQualificacao(data) {
    }

    criaSecaoQualificacao(registros) {
        if (!registros || registros.length === 0) { return null; }

        return [
            { text: '\nQualificação\n', alignment: 'center', bold: true },
            { text: this.criaTextoQualificacao(registros)}
        ];
    }
}
