import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-tokens-validos',
  template: `
    <pandora-table
      caption="Tokens Válidos"
      exportFilename="tokens_validos"
      [value]="tokensValidos"
      dataKey="key"
      [rows]="20"
      [dicionarioDados]="dicionarioDados">
    </pandora-table>
    `
})
export class TokensValidosComponent {

  @Input() tokensValidos;

  dicionarioDados = {
    ip      : {nome: 'IP' },
    usuario : {nome: 'Usuário', fn: (x) => this.utils.toLowerCase(x) },
    tipo    : {nome: 'Tipo', fn: (x) => this.utils.toUpperCase(x) },
    dataHora: {nome: 'Início', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') },
    validade: {nome: 'Válido até', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') },
  }

  constructor(
    public utils: UtilsService
  ) {}
}
