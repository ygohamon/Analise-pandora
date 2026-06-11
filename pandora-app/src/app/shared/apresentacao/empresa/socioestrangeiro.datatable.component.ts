import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-socioestrangeiro-datatable',
    template: `
      <pandora-table
        caption="Sócios Estrangeiros - Fonte: RF"
        exportFilename="socios_estrangeiros"
        [value]="socios"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class SocioEstrangeiroDatatableComponent {

    @Input() socios;
    @Output() sociosChange = new EventEmitter();

    dicionarioDados = {
      nome       : {nome: 'Nome'},
      nomePais   : {nome: 'País'},
      percCapital: {nome: 'Participação', fn: (x) => `${x.percCapital} %`},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
