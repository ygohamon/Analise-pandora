import { Component, Input } from '@angular/core';

import { UtilsService } from '../../services/common/utils.service';

@Component({
    selector: 'app-endereco-datatable',
    template: `
      <pandora-table
        caption="Endereços"
        exportFilename="enderecos"
        [value]="enderecos"
        [dicionarioDados]="dicionarioDados">
      </pandora-table>
    `
})
export class EnderecoDatatableComponent {

  @Input() enderecos;

  dicionarioDados = {
    logradouro : { nome: 'Logradouro' },
    numero     : { nome: 'Número' },
    complemento: { nome: 'Complemento' },
    bairro     : { nome: 'Bairro' },
    cep        : { nome: 'CEP' },
    municipio  : { nome: 'Município' },
    uf         : { nome: 'UF' },
    fonte      : { nome: 'Fonte' }
  }

  constructor(
    public utils: UtilsService
  ) {}
}
