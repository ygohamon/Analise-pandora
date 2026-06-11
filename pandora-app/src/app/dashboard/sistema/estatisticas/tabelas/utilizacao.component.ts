import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { SistemaService } from './../../../../services/sistema/sistema.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-sistema-utilizacao',
  template: `
    <div class="ui-g">
      <div class="ui-g-12 titulo">
        Estatísticas de Utilização do Sistema
      </div>

      <div class="ui-g-12">
        <div class="ui-g-3 ui-sm-12 fw-bold">
          Período de análise:
        </div>

        <div class="ui-g-9 ui-sm-12">
          <p-spinner
            [(ngModel)]="periodoBusca" [min]="30" [max]="3650" (onChange)="getEstatisticas()">
          </p-spinner>
        </div>
      </div>

      <div class="ui-g-6 ui-sm-12" *ngIf="dadosGraficoPesquisa">
        <p-chart type="line" [data]="dadosGraficoPesquisa"></p-chart>
      </div>

      <div class="ui-g-6 ui-sm-12" *ngIf="dadosGraficoLogins">
        <p-chart type="line" [data]="dadosGraficoLogins"></p-chart>
      </div>
    </div>
  `,
  styleUrls: ['../estatisticas.component.css']
})
export class SistemaUtilizacaoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  dadosGraficoLogins;
  dadosGraficoPesquisa;
  periodoBusca: number = 90;

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) { }

  ngOnInit() {
    this.getEstatisticas();
  }

  ngOnDestroy() {
    this.dadosGraficoPesquisa = null;
    this.dadosGraficoLogins = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  getEstatisticas(){
    this.requisicaoEstatisticasUso('pesquisa', this.periodoBusca);
    this.requisicaoEstatisticasUso('login', this.periodoBusca);
  }

  requisicaoEstatisticasUso(categoria, duracao) {
    this.sistema.getEstatisticasUso(categoria, String(duracao))
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          if (categoria === 'pesquisa') {
            this.dadosGraficoPesquisa = this.criaGraficoLinha(dados.reverse(), 'Número de Pesquisas', 1);
          } else if (categoria === 'login') {
            this.dadosGraficoLogins = this.criaGraficoLinha(dados.reverse(), 'Número de Logins', 2);
          }

        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  criaGraficoLinha(dados, label, indiceCor) {
    return {
      labels: dados.map(d => this.utils.formataData(d.data, 'DD/MM/YYYY')),
      datasets: [
        {
          label: label,
          data: dados.map(d => d.qtd),
          fill: false,
          borderColor: this.utils.retornaCor(indiceCor)
        },
        {
          label: 'Média móvel de 30 dias',
          data: this.criaMediaMovel(dados.map(d => d.qtd), 30),
          fill: false,
          borderColor: 'rgba(255, 0, 0, 0.5)'
        },

      ]
    };
  }

  criaMediaMovel(dados, periodo) {
    let media = new Array(periodo-1).fill(0);
    for (var i = 0; i < dados.length - periodo +1 ; i++) {
      var val = dados.slice(i, i+periodo).reduce((a, b) => a + b, 0) / periodo;
      if (val) { val = Number(val.toFixed(2)) }
      media.push(val)
    }

    return media;
  }
}
