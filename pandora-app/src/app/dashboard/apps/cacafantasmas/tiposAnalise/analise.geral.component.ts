import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import {uniq, sortBy} from 'lodash-es';

import {RelatorioCacaFantasmasGeralService} from './../../../../services/relatorio/cacafantasmas/relatorio.cacafantasmas.geral.service';
import { UtilsService } from '../../../../services/common/utils.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cacafantasmas-analise-geral',
    template: `
      <pandora-table
        [caption]="orgao"
        exportFilename="tabela_geral_tipologias_geral_orgao"
        [value]="pessoasEncontradasTabelaGeral"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchCase="'qtdTipologias'" style="font-weight: bold;">{{rowData[col.field]}}</span>
              <span *ngSwitchCase="'totalTipologias'" style="font-weight: bold;">{{rowData[col.field]}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer" let-columns>
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="true">
              <span *ngSwitchCase="col.field === 'cpf'" style="font-weight: bold">Total</span>
              <span *ngSwitchCase="col.field.startsWith('t') && col.field !== 'totalTipologias'" style="font-weight: bold">{{somaTotalTipologias(col.field)}}</span>
              <span *ngSwitchDefault></span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    `
})
export class CacaFantasmasAnaliseGeralComponent implements OnInit, OnChanges {

  @Input() data;
  @Input() orgao;

  pessoasEncontradasTabelaGeral;

  dicionarioDados = {
    nome           : { nome: 'Nome'},
    cpf            : { nome: 'CPF'},
    t1             : { nome: 'T1', dica : 'FP x SISOBI'},
    t2             : { nome: 'T2', dica : 'Empenhos x SISOBI'},
    t3             : { nome: 'T3', dica : 'Servidores x Endereços RF'},
    t4             : { nome: 'T4', dica : 'Servidores x Endereços RE'},
    t5             : { nome: 'T5', dica : 'Servidores x Sócios PJ'},
    t6             : { nome: 'T6', dica : 'Servidores x Responsáveis PJ'},
    t7             : { nome: 'T7', dica : 'Servidores x Extra Vínculos Públicos'},
    t8             : { nome: 'T8', dica : 'Servidores x RAIS'},
    t9             : { nome: 'T9', dica : 'Servidores x Analfabetos'},
    t10            : { nome: 'T10', dica: 'Servidores x Bolsa Família'},
    t11            : { nome: 'T11', dica: 'Servidores x Contas Bancárias'},
    t12            : { nome: 'T12', dica: 'Servidores x Tipologias TCU'},
    t13            : { nome: 'T13', dica: 'Servidores x Tipologias TCU (Doaddores)'},
    t14            : { nome: 'T14', dica: 'Servidores x CPF Inexistente na Receita Federal'},
    t15            : { nome: 'T15', dica: 'Servidores x Filiação Regular em Partido Político'},
    t16            : { nome: 'T16', dica: 'Servidores x Filiação Cancelada em Partido Político'},
    t17            : { nome: 'T17', dica: 'Servidores x Condenação no Cadicon'},
    t18            : { nome: 'T18', dica: 'Servidores x Condenação no CEIS'},
    qtdTipologias  : { nome: 'QTD'},
    totalTipologias: { nome: 'Total'},
  }

  constructor(
    private router: Router,
    public utils: UtilsService,
    private relatorio: RelatorioCacaFantasmasGeralService
  ) { }

  ngOnInit() {
    this.geraDadosTabelaGeral(this.data);
  }

  ngOnChanges() {
    this.geraDadosTabelaGeral(this.data);
  }

  geraDadosTabelaGeral(dados) {
    const pessoasUnicas = uniq(dados.map(dado => dado.cpf));

    const p = pessoasUnicas.map(cpf => {
      const pessoa: any = { cpf: cpf };

      const tipologiasEncontradasParaPessoa = dados.filter(d => d.cpf === pessoa.cpf);

      let totalTipologias = 0;
      let qtdTipologias = 0;
      tipologiasEncontradasParaPessoa.forEach(tipo => {
        if (!pessoa[tipo.tipologia]) { pessoa[tipo.tipologia] = tipo.score; totalTipologias += tipo.score; qtdTipologias += 1; }
        if (!pessoa.nome && tipo.nome) { pessoa.nome = tipo.nome; }
      });

      pessoa.totalTipologias = totalTipologias;
      pessoa.qtdTipologias   = qtdTipologias;

      return pessoa;
    });

    this.pessoasEncontradasTabelaGeral = sortBy(p, ['totalTipologias']).reverse();
  }

  somaTotalTipologias(tipologia) {
    return this.pessoasEncontradasTabelaGeral.filter(p => { return (p[tipologia]) ? true : false; }).length;
  }

  gerarPDF() {
    const fileName = `Relatório Análise Geral - ${this.orgao}.pdf`;
    const grupo = null;

    const url = location.origin + this.router.url;

    this.relatorio.relatorioAnaliseGeral(this.pessoasEncontradasTabelaGeral, grupo, fileName, url);
  }
}
