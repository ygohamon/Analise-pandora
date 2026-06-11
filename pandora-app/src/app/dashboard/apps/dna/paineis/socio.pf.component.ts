
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-socios-pf',
  template: `
    <pandora-table
      caption="Sócios Pessoa Física"
      exportFilename="socios_pf"
      [value]="dadosSocioPF"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf'">
                <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchCase="'nome'">{{rowData.nome | uppercase}}</span>
            <span *ngSwitchCase="'percCapital'">{{rowData.percCapital}} %</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `,
})
export class DNASociosPFComponent implements OnInit {

  @Input() dados;

  dadosSocioPF;

  // Colunas da tabela de resultado
  dicionarioDados = {
    cpf        : {nome: 'CPF' },
    nome       : {nome: 'Nome' },
    percCapital: {nome: 'Participação' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosSocioPF = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'socio_pf'))?.socio_pf;
  }
}
