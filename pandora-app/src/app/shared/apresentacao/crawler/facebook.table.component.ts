import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-facebook',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Atenção: Os resultados de Facebook aqui apresentados não expressam certeza, apenas possíveis registros baseados em heurísticas do sistema.
      </div>

      <div class="ui-g-12">
        <pandora-table
          caption="Facebook"
          exportFilename="facebook"
          sortField="score"
          sortOrder=-1
          [value]="dados"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'titulo'">
                    <a href="{{rowData.url}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                </span>
                <span *ngSwitchCase="'score'">{{roundScore(rowData.score)}}</span>
                <span *ngSwitchCase="'data_hora'">{{utils.formataData(rowData.data_hora)}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>
        </pandora-table>
      </div>
    `
})
export class CrawlersFacebookTabelaComponent implements OnChanges {

  @Input() data;

  dados;

  dicionarioDados = {
    titulo    : { nome: 'Título' },
    score     : { nome: 'Score' },
    data_hora : { nome: 'Data Consulta' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.dados = this.data.map(d => {
      return { score: d.relevancia * d.obj, ...d }
    });
  }

  roundScore(score: any) {
    return score.toFixed(3);
  }
}
