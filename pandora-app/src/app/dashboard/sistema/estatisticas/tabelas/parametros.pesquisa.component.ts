import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import {groupBy} from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { SistemaService } from './../../../../services/sistema/sistema.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-sistema-parametros-pesquisa',
  template: `
    <div class="ui-g">
      <div class="ui-g-12 titulo">
        Distribuição dos Parâmetros de Pesquisa
      </div>

      <div class="ui-g-4 ui-sm-12" *ngFor="let recurso of recursos">
        <div class="ui-g-12 subtitulo">
          {{recurso}}
        </div>

        <div class="ui-g-12" *ngIf="buscaRecursos">
          <p-chart type="doughnut" [data]="dadosGrafico[recurso]" [options]="configGrafico"></p-chart>
        </div>

        <div class="ui-g-12" *ngIf="buscaRecursos">
          <pandora-table
            [dicionarioDados]="dicionarioDados"
            [value]="dadosTabela[recurso]">
          </pandora-table>
        </div>

      </div>
    </div>
  `,
  styleUrls: ['../estatisticas.component.css']
})
export class SistemaParametrosPesquisaComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  recursos = [
    'PESSOA',
    'EMPRESA',
    'TELEFONE',
    'VEICULO',
    'ENDERECO',
    'OBITO',
    'PRESO',
    'IMOVEL',
    'EMPENHO',
    'EMBARCACAO',
    'INVESTIGADO',
  ];

  dicionarioDados = {
    chave: {nome: 'Parâmetro'},
    qtd: {nome: 'QTD'},
    pct: {nome: '%', fn: (x) => `${x} %`}
  }

  dadosGrafico;
  dadosTabela;

  configGrafico;
  buscaRecursos;

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) { }

  ngOnInit() {
    this.configGrafico = {
      legend: { display: false}
    };

    this.requisicaoRecursosMaisUtilizados(null, true);
  }

  ngOnDestroy() {
    this.dadosGrafico = null;
    this.dadosTabela  = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  requisicaoRecursosMaisUtilizados(periodoBusca, comChave = null) {
    this.sistema.getRecursosMaisUtilizados(periodoBusca, comChave)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {

          this.dadosGrafico  = this.criaGraficoDistribuicao(dados);
          this.dadosTabela   = this.criaTabelaDistribuicao(dados);
          this.buscaRecursos = true;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  criaGraficoDistribuicao(dados) {
    const grupos = groupBy(dados, (d) => d.recurso);

    const retorno = {};
    Object.keys(grupos).forEach(recurso => {
      retorno[recurso] = {
        labels: grupos[recurso].map(dado => dado.chave),
        datasets: [
          {
            data: grupos[recurso].map(dado => dado.qtd),
            backgroundColor: grupos[recurso].map((dado, i) => this.utils.retornaCor(i)),
            hoverBackgroundColor: grupos[recurso].map((dado, i) => this.utils.retornaCor(i))
          }]
      };
    });

    return retorno;
  }

  criaTabelaDistribuicao(dados) {
    const grupos = groupBy(dados, (d) => d.recurso);

    const retorno = {};
    Object.keys(grupos).forEach(recurso => {
      // Pega o total de chaves para o mesmo recurso, usado para calcular a porcentagem
      const totalRecurso = grupos[recurso].map(d => d.qtd).reduce((a, b) => a + b, 0);
      retorno[recurso] = grupos[recurso].map(d => ({pct: (100*d.qtd/totalRecurso).toFixed(2), ...d}));
    });

    return retorno;
  }
}
