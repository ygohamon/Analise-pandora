import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-conselho-table',
    template: `
      <pandora-table
        caption="Conselho Advogado"
        exportFilename="conselho_advogado"
        [value]="dataAdvogado"
        [dicionarioDados]="dicionarioDados_Advogado">
      </pandora-table>
    `
})
export class ConselhoTableComponent implements OnChanges {

    @Input() data;

    dataAdvogado;

    dicionarioDados_Advogado = {
      status   : {nome: 'Status'},
      matricula: {nome: 'Matrícula'},
      defensor : {nome: 'Defensor'},
      numeroOAB: {nome: 'Número OAB'},
      ufOAB    : {nome: 'UF OAB'},
      fonte    : {nome: 'Fonte'},
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
        this.dataAdvogado = this.data.filter(dado => dado.tipo === 'advogado');
    }
}
