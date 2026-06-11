import { Component, Input, OnChanges } from '@angular/core';
import { UtilsService } from '../../services/common/utils.service';

@Component({
  selector: 'app-pessoa-virtual-table',
  template: `
    <pandora-table
      caption="Email"
      exportFilename="tabela_email"
      [value]="dataEmail"
      [dicionarioDados]="dicionarioDadosEmail">
    </pandora-table>
  `
})
export class VirtualTableComponent implements OnChanges {

  @Input() data;

  dataEmail;
  dicionarioDadosEmail = {
    email: { nome: 'Email' },
    fonte: { nome: 'Fonte' }
  };

  constructor(public utils: UtilsService) {}

  ngOnChanges() {
    this.dataEmail = this.data
      .filter(dado => dado.tipo === 'email')
      .map((dado, idx) => Object.assign(dado, {id: idx}));
  }
}
