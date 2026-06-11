import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard-residenteexterior',
  template: `
    <pandora-table
      caption="Residentes no exterior que receberam"
      exportFilename="residentes_exterior"
      [value]="residentes"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchCase="'valor'">R$ {{rowData[col.field]}}</span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class DashboardPainelCovidResidenteExteriorComponent implements OnInit {

  @Input() dados;
  residentes;

  dicionarioDados = {
    mesAno        : {nome: 'Mês' },
    pais          : {nome: 'País' },
    cpf           : {nome: 'CPF' },
    nome          : {nome: 'Nome' },
    // parcela        : {nome: 'Parcela' },
    enquadramento : {nome: 'Enquadramento' },
    valor         : {nome: 'Valor' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.residentes = this.dados['tipologia_exterior'];
  }
}
