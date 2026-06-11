import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges } from '@angular/core';

import Plotly from 'plotly.js-cartesian-dist';
import { groupBy, sum } from 'lodash-es';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-doacoes',
    template: `
    <div class="ui-g">

      <div class="ui-g-12">
        <div #grafico></div>
      </div>

      <div class="ui-g-12">
        <pandora-table
          caption="Doações Feitas"
          exportFilename="doacoes"
          [value]="data"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'data'">{{utils.formataData(rowData.data, 'DD/MM/YYYY')}}</span>
                <span *ngSwitchCase="'valor'">R$ {{utils.converteEmDinheiro(rowData.valor)}}</span>
                <span *ngSwitchCase="'cpf'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                </span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>
    </div>
    `
})
export class DoacoesTableComponent implements AfterViewInit, OnChanges {

  @Input() data;
  @Output() dataChange = new EventEmitter();

  @ViewChild('grafico') grafico : ElementRef;

  dicionarioDados = {
    ano            : {nome: 'Ano' },
    uf             : {nome: 'UF' },
    ue             : {nome: 'UE' },
    cargo          : {nome: 'Cargo' },
    partido        : {nome: 'Partido' },
    numeroCandidato: {nome: 'Número Candidato' },
    cpf            : {nome: 'CPF' },
    nome           : {nome: 'Nome' },
    // origem         : {nome: 'Origem' },
    // data           : {nome: 'Data' },
    qtd            : {nome: 'Qtd Doações' },
    valor          : {nome: 'Valor Total' },
    fonte          : {nome: 'Fonte' },
  };

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.data = this.data.map((d, i) => Object.assign(d, {idx: i}))
  }

  ngAfterViewInit() {
    let tmp = groupBy(this.data, d => d.ano);

    const dados = Object.keys(tmp).map(key => {
      return {
        x: tmp[key][0].ano,
        y: sum(tmp[key].map(v => v.valor))
      }
    })

    const layout = {
      title: 'Doações Feitas',
      // autosize: true,
      // height: 250,
      // margin: { b: 20, t: 15, pad: 4 },
    }

    const data = [
      {
        x: dados.map(d => d.x),
        y: dados.map(d => d.y),
        type: 'bar',
      }
    ];

    Plotly.newPlot(this.grafico.nativeElement, data, layout, { responsive: true });
  }
}
