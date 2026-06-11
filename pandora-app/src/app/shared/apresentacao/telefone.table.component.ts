import { Component, Input } from '@angular/core';

import { UtilsService } from '../../services/common/utils.service';

@Component({
  selector: 'app-telefone-table',
  template: `
    <pandora-table
      caption="Telefones"
      exportFilename="telefones"
      [value]="telefones"
      [dicionarioDados]="dicionarioDados">
    </pandora-table>
  `
})
export class TelefoneTableComponent {

  @Input() telefones;

  dicionarioDados = {
    ddd       : { nome: 'DDD' },
    telefone  : { nome: 'Telefone' },
    whatsapp  : { nome: 'WhatsApp' },
    operadora : { nome: 'Operadora' },
    fonte     : { nome: 'Fonte' },
  }

  constructor(
    public utils: UtilsService
  ) {}
}
