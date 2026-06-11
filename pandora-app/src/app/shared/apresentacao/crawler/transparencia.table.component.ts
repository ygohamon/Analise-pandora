import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-transparencia',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Os dados abaixo foram coletados diretamente da Transparência Federal
      </div>

      <div class="ui-g-12">
        <pandora-table
          [caption]="cabecalho"
          exportFilename="transparencia_federal"
          [value]="dados"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'titulo'">
                    <a href="http://www.portaltransparencia.gov.br/{{rowData.link}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                </span>
                <span *ngSwitchCase="'tipo'" style="font-weight: bold">{{rowData.tipo}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>
    `
})
export class CrawlersTransparenciaTabelaComponent implements OnChanges {

    @Input() data;
    @Input() cabecalho;

    dados;

    dicionarioDados = {
      titulo: { nome: 'Título' },
      tipo  : { nome: 'Tipo' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
      this.dados = this.data.map(d => {
        if (d.link.includes('busca/pessoa-juridica/')) { d.tipo = 'BuscaPJ'}
        else if (d.link.includes('contratos/')) { d.tipo = 'Contrato'}
        else { d.tipo = 'Outros' }
        return d;
      })
    }
}
