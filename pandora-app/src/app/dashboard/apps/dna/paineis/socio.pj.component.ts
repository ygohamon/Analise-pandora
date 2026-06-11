
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-socios-pj',
  template: `
    <pandora-table
      caption="Sócios Pessoa Jurídica"
      exportFilename="socios_pj"
      [value]="dadosSocioPJ"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cnpj'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' class="primary-text">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
            </span>
            <span *ngSwitchCase="'razaoSocial'">{{rowData.razaoSocial | uppercase}}</span>
            <span *ngSwitchCase="'percCapital'">{{rowData.percCapital}} %</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `
})
export class DNASociosPJComponent implements OnInit {

  @Input() dados;

  dadosSocioPJ;

  dicionarioDados = {
    cnpj       : {nome: 'CNPJ' },
    razaoSocial: {nome: 'Razão Social' },
    percCapital: {nome: 'Participação' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosSocioPJ = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'socio_pj'))?.socio_pj;
  }

}
