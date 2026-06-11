import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../services/common/utils.service';

@Component({
    selector: 'app-operacao-datatable',
    template: `
      <pandora-table
        caption="Operações"
        exportFilename="operacoes"
        [value]="operacoes"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class OperacaoDatatableComponent {

    @Input() operacoes;

    dicionarioDados = {
     nomeOperacao: {nome: 'Nome'},
     dataOperacao: {nome: 'Data', fn: this.utils.formataData},
     acaoPenal:    {nome: 'Ação Penal'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
