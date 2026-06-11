import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';


@Component({
    selector: 'app-empresa-contador-table',
    template: `
      <pandora-table
        caption="Contadores da Empresa"
        exportFilename="contadores"
        [value]="contadores"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class EmpresaContadorTableComponent {

    @Input() contadores;

    dicionarioDados = {
      cpf:   {nome: 'CPF'},
      nome:  {nome: 'Nome'},
      crc:   {nome: 'CRC'},
      ufCRC: {nome: 'UF'},
      fonte: {nome: 'Fonte'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
