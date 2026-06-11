import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-tcu-processo-table',
  template: `
    <pandora-table
      caption="Processos - Fonte: TCU"
      exportFilename="processos_tcu"
      [value]="dados"
      dataKey="key"
      [dicionarioDados]="dicionarioDadosProcessoTCU">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'titulo'">
              <a href="{{rowData.link}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
            </span>
            <span *ngSwitchCase="'tipo'" style="font-weight: bold">{{rowData.tipo}}</span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `
})
export class TCUProcessoTableComponent {

  @Input() dados;

  dicionarioDadosProcessoTCU = {
    tipoProcesso  : { nome: 'Tipo' },
    status        : { nome: 'Situação' },
    relator       : { nome: 'Relator' },
    titulo        : { nome: 'Título' },
    assunto       : { nome: 'Assunto' },
  }

  constructor(
    public utils: UtilsService
  ) {}
}
