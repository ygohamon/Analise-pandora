import { Component, Input } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-jusbrasil',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Atenção: O resultado abaixo contém buscas no Jusbrasil.
      </div>

      <div class="ui-g-12">
        <pandora-table
          caption="Jusbrasil"
          exportFilename="jusbrasil"
          [value]="dados"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'titulo'">
                    <a href="{{rowData.url}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                </span>
                <span *ngSwitchCase="'data_hora'">{{utils.formataData(rowData.data_hora)}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>
    `
})
export class CrawlersJusbrasilTabelaComponent {

    @Input() dados;

    dicionarioDados = {
      titulo     : { nome: 'Título' },
      descricao  : { nome: 'Descrição' },
      data_hora  : { nome: 'Data Consulta' },
    }

    constructor(
      public utils: UtilsService
    ) {}
}
