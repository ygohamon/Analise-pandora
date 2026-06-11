import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-servidor-estadual-datatable',
    template: `
      <pandora-table
        caption="Folha de Pagamento - Fonte: SAGRES"
        exportFilename="servidor_estadual"
        [value]="data"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class ServidorEstadualDatatableComponent {

    @Input() data;

    dicionarioDados = {
      dtAno    : {nome: 'Ano' },
      matricula: {nome: 'Matrícula' },
      cargo    : {nome: 'Cargo' },
      vinculo  : {nome: 'Vínculo' },
      orgao    : {nome: 'Órgão' },
      vlBruto  : {nome: 'V. Bruto' , fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
      meses    : {nome: 'Meses'},
      media    : {nome: 'Média', fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
