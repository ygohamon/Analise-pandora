import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard-proprietarioaeronaves',
  template: `
    <pandora-table
      caption="Proprietários de aeronaves que receberam"
      exportFilename="aeronaves"
      [value]="aeronaves"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchCase="'total'">R$ {{rowData[col.field]}}</span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class DashboardPainelCovidProprietarioAeronavesComponent implements OnInit {

  @Input() dados;
  aeronaves;

  dicionarioDados = {
    municipio    : {nome: 'Município' },
    cpf          : {nome: 'CPF' },
    nome         : {nome: 'Nome' },
    nAeronaves   : {nome: '# Aeronaves' },
    modelos      : {nome: 'Modelos' },
    qtd          : {nome: 'Qtd Parcelas' },
    total        : {nome: 'Total' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.aeronaves = this.dados['tipologia_aeronave'];
  }
}
