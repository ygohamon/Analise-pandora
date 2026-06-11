
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-atividade-economica',
  template: `
    <pandora-table
      caption="Atividade Econômica"
      exportFilename="atividadeeconomica"
      [value]="dadosAtividadeEconomica"
      [dicionarioDados]="dicionarioDados">
    </pandora-table>
  `
})
export class DNAAtividadeEconomicaComponent implements OnInit {

  @Input() dados;

  dadosAtividadeEconomica;

  // Colunas da tabela de resultado
  dicionarioDados = {
    cnae      : {nome: 'CNAE' },
    descricao : {nome: 'Descrição' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosAtividadeEconomica = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'atividadeeconomica'))?.atividadeeconomica;
  }
}
