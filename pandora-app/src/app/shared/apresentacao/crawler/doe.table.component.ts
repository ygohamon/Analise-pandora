import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-doe',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Atenção: O resultado abaixo contém buscas em diversos motores de busca e diversos domínios diferentes.
      </div>

      <div class="ui-g-12">
        <pandora-table
          caption="Diário Oficial - Motores de Busca (Google, Bing, Presearch, Yahoo e Lukol)"
          exportFilename="diarios_oficiais"
          [value]="dados"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'titulo'">
                    <a href="{{rowData.url}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                </span>
                <span *ngSwitchCase="'fonte'" class='font-weight-bold'>{{rowData.fonte}}</span>
                <span *ngSwitchCase="'data_hora'">{{utils.formataData(rowData.data_hora)}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>
    `
})
export class CrawlersDOETabelaComponent {

    @Input() dados;

    dicionarioDados = {
      relevancia : { nome: 'Relevância' },
      dominio    : { nome: 'Domínio' },
      titulo     : { nome: 'Título' },
      descricao  : { nome: 'Descrição' },
      data_hora  : { nome: 'Data Consulta' },
      fonte      : { nome: 'Fonte' },
    }

    constructor(
      public utils: UtilsService
    ) {}
}
