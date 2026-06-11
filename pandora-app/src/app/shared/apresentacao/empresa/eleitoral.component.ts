import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-eleitoral',
    template: `
    <div class="p-2">
      <app-pessoa-doacoes *ngIf="!!doacoes.length" [data]="doacoes"></app-pessoa-doacoes>
      <app-pessoa-candidatos-fornecidos *ngIf="!!candidatosfornecidos.length" [data]="candidatosfornecidos"></app-pessoa-candidatos-fornecidos>
    </div>
    `
})
export class EmpresaEleitoralComponent implements OnChanges {

    @Input() data;

    doacoes;
    candidatosfornecidos;

    constructor(public utils: UtilsService) {}

    ngOnChanges() {
      this.doacoes = this.data.filter(d => d.tipo === 'doacao');
      this.candidatosfornecidos = this.data.filter(d => d.tipo === 'forneceu');
    }
}
