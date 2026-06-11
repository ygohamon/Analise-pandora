import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pgfn-dividaativa-table',
  template: `
    <div class="ui-g-12 pb-2" *ngIf="dadosFiltrados.length > 0">
      <pandora-table
        caption="Dívida Ativa - Fonte: PGFN"
        exportFilename="divida_ativa_pgfn"
        [value]="dadosFiltrados"
        [dicionarioDados]="dicionarioDadosDividaAtivaPGFN">
      </pandora-table>
    </div>
  `
})
export class PGFNDividaAtivaTableComponent implements OnChanges {

  @Input() dados;
  dadosFiltrados;


  dicionarioDadosDividaAtivaPGFN = {
    tipoDevedor  : {nome: 'Tipo Devedor'},
    sistema      : {nome: 'Sistema' },
    numInscricao : {nome: 'N. Inscrição' },
    dtInscricao  : {nome: 'Data Inscrição', fn: this.utils.formataData},
    situacao     : {nome: 'Situação' },
    receita      : {nome: 'Receita' },
    regional     : {nome: 'Regional' },
    numProcesso  : {nome: 'N. Processo'},
    valor        : {nome: 'Valor', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.dadosFiltrados = this.dados.filter(dado => dado.fonte === 'PGFN');
  }
}
