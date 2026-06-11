
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-inp-analise-orgao',
  template: `
    <pandora-table
      caption="Pessoas Identificadas"
      exportFilename="inp"
      [value]="dados"
      [mostraFiltroColunas]="true"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'CATEGORIA'">{{rowData.CATEGORIA.split('/').join(' / ')}}</span>
            <span *ngSwitchCase="'CPF'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.CPF)}' class="primary-text">{{utils.formataDado(rowData.CPF, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchCase="'CPF_PARENTE'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.CPF_PARENTE)}' class="primary-text">{{utils.formataDado(rowData.CPF_PARENTE, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchDefault>{{rowData[col.field]  | uppercase}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>

  `
})
export class INPAnaliseOrgaoComponent  {

  @Input() dados;

  dicionarioDados = {
    CARGO         : { nome: 'Cargo' },
    CPF           : { nome: 'CPF' },
    NOME          : { nome: 'Nome' },
    CATEGORIA     : { nome: 'Relação' },
    CPF_PARENTE   : { nome: 'CPF' },
    NOME_PARENTE  : { nome: 'Nome' },
    CARGO_PARENTE : { nome: 'Cargo' },
    ULTIMO_MES_ANO: { nome: 'Última Ocorrência' },
    NATUREZA      : { nome: 'Natureza' },
    ORGAO         : { nome: 'Órgão' },
    ESFERA        : { nome: 'Esfera' },
  }

  constructor(
    public utils: UtilsService
  ) { }
}
