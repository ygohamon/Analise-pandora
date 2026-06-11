import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { groupBy } from 'lodash-es';

import { UtilsService } from './../../../../services/common/utils.service';

@Component({
  selector: 'app-simba-rankings',
  template: `
    <p-tabView *ngIf="tipologiasEncontradas">
      <p-tabPanel
        header="{{tituloTipologias[tipologia].titulo}}"
        tooltip="{{tituloTipologias[tipologia].tooltip}}"
        *ngFor="let tipologia of tipologiasEncontradas; let first = first;"
        [selected]="first"
        leftIcon="pi pi-calendar">

        <app-simba-tabela
          [alvo]="alvo"
          [titulo]="tituloTipologias[tipologia].titulo"
          [descricao]="tituloTipologias[tipologia].tooltip"
          [dados]="tipologias[tipologia]">
        </app-simba-tabela>

      </p-tabPanel>
    </p-tabView>
  `
})
export class SimbaRankingsComponent {

  @Input() alvo;
  @Input() dados;

  tipologias;
  tipologiasEncontradas;

  tituloTipologias = {
    '01' : { titulo: 'Maiores débitos',       tooltip: 'Para quem mais transferiu'},
    '02' : { titulo: 'Maiores créditos',      tooltip: 'De quem mais recebeu'},
    '03' : { titulo: 'Maiores saldos',        tooltip: 'Com maior saldo, o que recebeu menos o transferido'},
    '04' : { titulo: 'Menores saldos',        tooltip: 'Com menor saldo, o que transferiu menos o que recebeu'},
    '05' : { titulo: 'Maiores movimentações', tooltip: 'O somatório das operações em absoluto, o que recebeu mais o que transferiu'},
    '06' : { titulo: 'Maiores CI',            tooltip: 'Maiores operações de crédito identificado'},
    '07' : { titulo: 'Maiores CNI',           tooltip: 'Maiores operações de crédito não identificado'},
    '08' : { titulo: 'Maiores DI',            tooltip: 'Maiores operações de débito identificado'},
    '09' : { titulo: 'Maiores DNI',           tooltip: 'Maiores operações de débito não identificado'},
    '10' : { titulo: 'Quantidades DI',        tooltip: 'Maior quantidade de operações de débito identificado'},
  };

  // 1) os 10 para quem eu mais transferi (ok)  --> EX.NATUREZA = D
	// 2) os 10 de quem eu mais recebi (ok)  --> EX.NATUREZA = C
	// 3) os 10 com maior saldo (o que eu recebi - o q transferi) (ok)  --> EX.NATUREZA = C - EX.NATUREZA = D
	// 4) os 10 com maior "débito"/menor saldo(o que eu recebi - o q transferi) (ok)  -->  EX.NATUREZA = D - EX.NATUREZA = C
	// 5) os 10 que eu mais transferi e recebi (transferi + recebi)  -->  EX.NATUREZA = C + EX.NATUREZA = D
	// 6) 10 maiores operações de crédito identificado (ok)
	// 7) 10 maiores operações de crédito não identificado (ok)
	// 8) 10 maiores operações de débito identificado (ok)
	// 9) 10 maiores operações de débito não identificado (ok)
	// 10) 10 com maior quantidade de operações de débito identificado (ok)

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.tipologias = groupBy(this.dados, d => d.REGRA);
    this.tipologiasEncontradas = Object.keys(this.tipologias);
  }
}
