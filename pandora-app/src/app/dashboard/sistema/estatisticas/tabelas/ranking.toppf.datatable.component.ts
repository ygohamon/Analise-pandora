import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
    selector: 'app-log-ranking-top-pf',
    template: `
      <pandora-table
        caption=" "
        exportFilename="rankinglogpf"
        [value]="data"
        [mostraFiltroColunas]="true"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    `
})
export class LogRankingTopPFTableComponent implements OnInit {

    @Input() data;

    dicionarioDados = {
      nome: {nome: 'Nome' },
      cpf : {nome: 'CPF' },
      qtd : {nome: 'QTD' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnInit() {}
}
