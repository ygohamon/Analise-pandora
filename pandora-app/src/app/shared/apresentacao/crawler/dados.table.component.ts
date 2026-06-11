import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-table',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Atenção: Os resultados de Facebook aqui apresentados não expressam certeza, apenas possíveis registros baseados em heurísticas do sistema.
      </div>
      <div class="ui-g-12">
        <pandora-table
          [caption]="cabecalho"
          exportFilename="tabela_fontes_abertas"
          [value]="data"
          [dicionarioDados]="dicionarioDados">

            <ng-template pTemplate="body" let-rowData let-columns="columns">
              <tr>
                <td *ngFor="let col of columns" [ngSwitch]="col.field">
                  <span class="ui-column-title">{{col.header}}</span>

                  <span *ngSwitchCase="'titulo'">
                      <a href="{{rowData.url}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                  </span>
                  <span *ngSwitchDefault>{{rowData[col.field]}}</span>
                </td>
              </tr>
            </ng-template>
        </pandora-table>
      </div>
    `
})
export class CrawlersTabelaComponent implements OnInit {

    @Input() data;
    @Input() cabecalho;
    @Input() dominio;
    @Input() semelhanca;
    @Input() descricao;

    dicionarioDados = {
      titulo   : { nome: 'Título' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnInit() {
      if (this.descricao) {
        this.dicionarioDados = Object.assign(this.dicionarioDados, {descricao: {nome: 'Descrição'}})
      }

      if (this.dominio) {
        this.dicionarioDados = Object.assign(this.dicionarioDados, {dominio: {nome: 'Domínio'}})
      }

      if (this.semelhanca) {
        this.dicionarioDados = Object.assign(this.dicionarioDados, {obj: {nome: 'Semelhança'}})
      }
    }
}
