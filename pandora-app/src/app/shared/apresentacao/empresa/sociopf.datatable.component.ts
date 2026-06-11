import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-sociopf-datatable',
    template: `
      <pandora-table
        caption="Sócios PF - Fonte: RF"
        exportFilename="socios_pf"
        [value]="socios"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'cpf'">
                    <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                </span>
                <span *ngSwitchCase="'percCapital'">{{rowData.percCapital}} %</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class SocioPFDatatableComponent {

    @Input() socios;
    @Output() sociosChange = new EventEmitter();

    dicionarioDados = {
      nome       : {nome: 'Nome'},
      cpf        : {nome: 'CPF'},
      percCapital: {nome: 'Participação'},
    }

    constructor(
      public utils: UtilsService
    ) {}

}
