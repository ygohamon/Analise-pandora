import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-tcu-acordao-table',
  template: `
    <pandora-table
      caption="Acórdão - Fonte: TCU"
      exportFilename="acordaos_tcu"
      [value]="dados"
      dataKey="key"
      [dicionarioDadosExpand]="dicionarioDadosAcordaoTCUExpand"
      [dicionarioDados]="dicionarioDadosAcordaoTCU">

      <ng-template pTemplate="header" let-columns>
        <tr>
          <th style="width: 3.25em"></th>
          <th *ngFor="let col of columns" [pandoraSortableColumn]="col.field">
            {{col.header}}
            <p-sortIcon [field]="col.field"></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-rowData let-columns="columns" let-expanded="expanded">
        <tr>
          <td>
            <span href="#" [pandoraRowToggler]="rowData">
              <i class="pointer" [ngClass]="expanded ? 'fa fa-chevron-circle-down' : 'fa fa-chevron-circle-right'"></i>
            </span>
          </td>

          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'titulo'">
              <a href="{{rowData.link}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
            </span>
            <span *ngSwitchCase="'tipo'" class="font-weight-bold">{{rowData.tipo}}</span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `
})
export class TCUAcordaoTableComponent {

  @Input() dados;

  dicionarioDadosAcordaoTCU = {
    titulo     : { nome: 'Título' },
    dataSessao : { nome: 'Data Sessão' },
    situacao   : { nome: 'Situação' },
    colegiado  : { nome: 'Colegiado' },
    relator    : { nome: 'Relator' },
  }

  dicionarioDadosAcordaoTCUExpand = {
    sumario    : { nome: 'Sumário' },
  }

  constructor(
    public utils: UtilsService
  ) {}
}
