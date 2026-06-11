import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { SistemaService } from './../../../../services/sistema/sistema.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-sistema-recursos',
  template: `
    <div class="ui-g">
      <div class="ui-g-12 titulo">
        Recursos mais pesquisados
      </div>

      <div class="ui-g-4 ui-sm-12" *ngFor="let p of periodosBusca">
        <div class="ui-g-12 subtitulo">
          {{p.descricao}}
        </div>

        <div class="ui-g-12" *ngIf="dadosGrafico[p.periodo]">
          <p-chart type="doughnut" [data]="dadosGrafico[p.periodo]" [options]="configGrafico"></p-chart>
        </div>

        <div class="ui-g-12" *ngIf="dadosTabela[p.periodo]">
          <pandora-table
            [dicionarioDados]="dicionarioDados"
            [value]="dadosTabela[p.periodo]">
          </pandora-table>
        </div>

      </div>
    </div>
  `,
  styleUrls: ['../estatisticas.component.css']
})
export class SistemaRecursosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  periodosBusca = [
    {periodo: '-1', descricao: 'Desde início'},
    {periodo: '30', descricao: 'Últimos 30 dias'},
    {periodo: '7', descricao: 'Últimos 7 dias'},
  ]

  dicionarioDados = {
    recurso: {nome: 'Parâmetro'},
    qtd: {nome: 'QTD'},
    pct: {nome: '%', fn: (x) => `${x} %`}
  }

  dadosGrafico = {};
  dadosTabela = {};
  configGrafico;

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) { }

  ngOnInit() {
    this.configGrafico = {
      legend: {
        display: false
      }
    };

    this.requisicaoRecursosMaisUtilizados('-1');
    this.requisicaoRecursosMaisUtilizados('30');
    this.requisicaoRecursosMaisUtilizados('7');
  }

  ngOnDestroy() {
    this.dadosGrafico = null;
    this.dadosTabela = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  requisicaoRecursosMaisUtilizados(periodoBusca, comChave = null) {
    this.sistema.getRecursosMaisUtilizados(periodoBusca, comChave)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {

          this.dadosGrafico[periodoBusca] = this.criaGrafico(dados);
          this.dadosTabela[periodoBusca]  = this.calculaPorcentagem(dados);

        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  criaGrafico(dados) {
    return {
      labels: dados.map(dado => dado.recurso),
      datasets: [{
        data: dados.map(dado => dado.qtd),
        backgroundColor: dados.map((dado, i) => this.utils.retornaCor(i)),
        hoverBackgroundColor: dados.map((dado, i) => this.utils.retornaCor(i))
      }]
    };
  }

  calculaPorcentagem(dados) {
    // Pega o total de chaves para o mesmo recurso, usado para calcular a porcentagem
    const totalPeriodo = dados.map(d => d.qtd).reduce((a, b) => a + b, 0);
    return dados.map(d => ({pct: (100*d.qtd / totalPeriodo).toFixed(2), ...d}))
  }
}
