import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-sociopj-datatable',
    template: `
      <pandora-table
        caption="Sócios PJ - Fonte: RF"
        exportFilename="socios_pj"
        [value]="socios"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchCase="'percCapital'">{{rowData.percCapital}} %</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class SocioPJDatatableComponent {

    @Input() socios;
    @Output() sociosChange = new EventEmitter();

    dicionarioDados = {
      razaoSocial: {nome: 'Razão Social'},
      cnpj       : {nome: 'CNPJ'},
      percCapital: {nome: 'Participação'},
    }

    constructor(
      public utils: UtilsService
    ) {}

}
