import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-eleitoral',
    template: `
    <div class="p-2">
      <app-pessoa-candidatos *ngIf="!!candidatos.length" [data]="candidatos"></app-pessoa-candidatos>
      <app-pessoa-bens *ngIf="!!bens.length" [data]="bens"></app-pessoa-bens>
      <app-pessoa-doacoes *ngIf="!!doacoes.length" [data]="doacoes"></app-pessoa-doacoes>
      <app-pessoa-doadores *ngIf="!!doadores.length" [data]="doadores"> </app-pessoa-doadores>
      <app-pessoa-gastos *ngIf="!!gastos.length" [data]="gastos"> </app-pessoa-gastos>
      <app-pessoa-candidatos-fornecidos *ngIf="!!candidatosfornecidos.length" [data]="candidatosfornecidos"> </app-pessoa-candidatos-fornecidos>
    </div>
    `
})
export class PessoaEleitoralComponent implements OnChanges {

    @Input() data;

    bens;
    doacoes;
    doadores;
    candidatos;
    gastos;
    candidatosfornecidos;

    constructor(public utils: UtilsService) {}

    ngOnChanges() {
      this.bens = this.data.filter(d => d.tipo === 'bem');
      this.doacoes = this.data.filter(d => d.tipo === 'doacao');
      this.doadores = this.data.filter(d => d.tipo === 'doador');
      this.candidatos = this.data.filter(d => d.tipo === 'candidato');
      this.gastos = this.data.filter(d => d.tipo === 'gastos');
      this.candidatosfornecidos = this.data.filter(d => d.tipo === 'forneceu');
    }
}
