import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-contadores',
  template: `
    <pandora-table
        caption="Contadores"
        exportFilename="contadores"
        [value]="dadosContadores"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]  | uppercase}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
  `
})
export class DNAContadoresComponent implements OnInit {

  @Input() dados;

  dadosContadores;

  dicionarioDados = {
    cpf: {nome: 'CPF' },
    nome: {nome: 'Nome' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosContadores = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'contadores'))?.contadores;
  }

}
