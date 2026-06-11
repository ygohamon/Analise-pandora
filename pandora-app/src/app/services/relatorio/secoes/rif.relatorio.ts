import { Injectable, Inject, forwardRef } from '@angular/core';

import { UtilsService } from './../../common/utils.service';
import { RelatorioUtilsService } from '../relatorio.utils';

@Injectable()
export class RelatorioSecaoRIFService {

  constructor(
    private utils: UtilsService,
    private relatorio: RelatorioUtilsService
  ) { }

  criaSecaoRIF(registros) {
    if (!registros || registros.length === 0) { return null; }

    return [
      { text: 'Relatório de Inteligência Financeira', style: 'secao' },
      {
        style: 'tabela',
        table: {
          widths: ['auto', '*'],
          body: [
            ['Número de RIFs existentes:', registros[0].qtd],
            [{ colSpan: 2, text: 'Para ter acesso aos conteúdos do RIF, solicite-os através do Integra.' }],
          ]
        },
        layout: this.relatorio.layout
      }
    ];
  }
}
