import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnChanges } from '@angular/core';

import Plotly from 'plotly.js-cartesian-dist';
import { groupBy, sum } from 'lodash-es';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-doadores',
    template: `
      <div class="ui-g">

        <div class="ui-g-12">
          <div #grafico></div>
        </div>

        <div class="ui-g-12">
          <pandora-table
            caption="Doações Recebidas"
            exportFilename="doadores"
            [value]="data"
            [dicionarioDados]="dicionarioDados">

            <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
              <tr>
                <td *ngFor="let col of columns" [ngSwitch]="col.field">
                  <span class="ui-column-title">{{col.header}}</span>

                  <span *ngSwitchCase="'dataReceita'">{{utils.formataData(rowData.dataReceita, 'DD/MM/YYYY')}}</span>
                  <span *ngSwitchCase="'media'">R$ {{utils.converteEmDinheiro(rowData.media)}}</span>
                  <span *ngSwitchCase="'menor'">R$ {{utils.converteEmDinheiro(rowData.menor)}}</span>
                  <span *ngSwitchCase="'maior'">R$ {{utils.converteEmDinheiro(rowData.maior)}}</span>
                  <span *ngSwitchCase="'valor'">R$ {{utils.converteEmDinheiro(rowData.valor)}}</span>
                  <span *ngSwitchCase="'cpf_cnpj'">
                    <a *ngIf="rowData.cpf_cnpj.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_cnpj, '###.###.###-##')}}</a>
                    <a *ngIf="rowData.cpf_cnpj.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpf_cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_cnpj, '##.###.###/####-##')}}</a>
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
export class DoadoresTableComponent implements AfterViewInit, OnChanges {

  @Input() data;
  @ViewChild('grafico') grafico : ElementRef;

  dicionarioDados = {
      ano     : { nome: 'Ano' },
      uf      : { nome: 'UF' },
      ue      : { nome: 'UE' },
      // cargo   : { nome: 'Cargo' },
      // partido : { nome: 'Partido' },
      // origem  : { nome: 'Origem' },
      // cpf_cnpj: { nome: 'CPF/CNPJ' },
      // nome    : { nome: 'Nome' },
      qtd   : { nome: 'Qtd Doações' },
      menor   : { nome: 'Menor Doação' },
      maior   : { nome: 'Maior Doação' },
      media   : { nome: 'Média' },
      valor   : { nome: 'Valor Total' },
      // dataReceita   : { nome: 'Data' },
      fonte   : { nome: 'Fonte' },
  };

  dicionarioDadosExpand = {
    descricao: {nome: 'Descrição da Receita'}
  }

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
      title: 'Doações Recebidas',
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
