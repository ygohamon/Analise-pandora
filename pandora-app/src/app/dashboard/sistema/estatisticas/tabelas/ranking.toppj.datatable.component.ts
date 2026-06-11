import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
    selector: 'app-log-ranking-top-pj',
    template: `
      <pandora-table
        caption=" "
        exportFilename="rankinglogpj"
        [value]="data"
        [mostraFiltroColunas]="true"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    `
})
export class LogRankingTopPJTableComponent implements OnInit {

    @Input() data;

    dicionarioDados = {
      razaoSocial : {nome: 'Razão Social' },
      cnpj        : {nome: 'CNPJ' },
      nomeFantasia: {nome: 'Nome Fantasia' },
      qtd         : {nome: 'QTD' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnInit() {}
}
