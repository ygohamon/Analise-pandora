import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-ranking-empenho',
  template: `
    <pandora-table
      [caption]="cabecalho"
      exportFilename="ranking_empenho"
      dataKey="id"
      [value]="dadosComIndice"
      [mostraEspacamentoExpand]="true"
      [dicionarioDadosExpand]="dicionarioDadosExpand"
      [dicionarioDados]="dicionarioDados">
    </pandora-table>
  `
})
export class DNARankingEmpenhosComponent implements OnInit {

  @Input() dados;
  @Input() cabecalho;
  @Input() tipo;

  dadosComIndice;

  dicionarioDados = {
    dataAno:     {nome: 'Ano' },
    uGestora:    {nome: 'Gestora' },
    vlPagamento: {nome: 'Pago' , fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
  }

  dicionarioDadosExpand = {
    descricao: {nome: 'Descrição'}
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    const dados = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === this.tipo));

    this.dadosComIndice = (this.tipo in dados) ?
      dados[this.tipo].map((d, i) => Object.assign(d, {id: i})) :
      null;
  }
}
