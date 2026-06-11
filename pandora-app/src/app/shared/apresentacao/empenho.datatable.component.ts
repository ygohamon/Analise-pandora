import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../services/common/utils.service';

@Component({
    selector: 'app-empenho-datatable',
    template: `
      <pandora-table
        caption="Empenhos"
        exportFilename="empenhos"
        [value]="empenhos"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class EmpenhoDatatableComponent {

    @Input() empenhos;

    dicionarioDados = {
      dtAno         : {nome: 'Ano' },
      unidadeGestora: {nome: 'Unidade Gestora' },
      vEmpenho      : {nome: 'Empenhado', fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
      vPagto        : {nome: 'Pago', fn: v => `R$ ${this.utils.converteEmDinheiro(v)}` },
      qtd           : {nome: 'Quantidade'},
    };

    constructor(
      public utils: UtilsService
    ) {}
}
