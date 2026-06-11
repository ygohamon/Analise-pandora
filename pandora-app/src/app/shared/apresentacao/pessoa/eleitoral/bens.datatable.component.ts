import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import Plotly from 'plotly.js-cartesian-dist';
import { groupBy, sum } from 'lodash-es';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-bens',
    template: `
    <div class="ui-g">
      <div class="ui-g-6 ui-sm-12">
        <div #grafico></div>
      </div>

      <div class="ui-g-6 ui-sm-12">
        <pandora-table
          caption="Bens"
          exportFilename="bens"
          [value]="data"
          [dicionarioDados]="dicionarioDados">
        </pandora-table>
      </div>
    </div>
    `
})
export class BensDatatableComponent implements AfterViewInit {

    @Input() data;
    @ViewChild('grafico') grafico : ElementRef;

    dicionarioDados = {
      ano      : {nome: 'Ano' },
      classe   : {nome: 'Tipo' },
      descricao: {nome: 'Descrição' },
      valor    : {nome: 'Valor' , fn: v => `R$ ${this.utils.converteEmDinheiro(v)}`},
      fonte    : {nome: 'Fonte' },
    };

    constructor(
      public utils: UtilsService
    ) {}

    ngAfterViewInit() {
      let grupos = groupBy(this.data, d => d.ano);

      const dados = Object.keys(grupos).map(key => {
        return {
          x: grupos[key][0].ano,
          y: sum(grupos[key].map(v => v.valor))
        }
      })

      const layout = {
        title: 'Bens',
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
