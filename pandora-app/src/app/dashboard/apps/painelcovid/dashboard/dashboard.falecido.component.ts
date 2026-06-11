import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard-falecido',
  template: `
    <pandora-table
      caption="Falecidos que receberam"
      exportFilename="falecido"
      [value]="falecidos"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
            </span>

            <span *ngSwitchCase="'cpfResponsavel'">
              <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfResponsavel)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfResponsavel, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchCase="'dtObito'">{{utils.formataData(rowData[col.field])}}</span>
            <span *ngSwitchCase="'valor'">R$ {{rowData[col.field]}}</span>
            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class DashboardPainelCovidFalecidoComponent implements OnInit {

  @Input() dados;
  falecidos;

  dicionarioDados = {
    mesAno         : {nome: 'Mês' },
    dtObito        : {nome: 'Data Óbito' },
    municipio      : {nome: 'Município' },
    nis            : {nome: 'NIS' },
    cpf            : {nome: 'CPF' },
    nome           : {nome: 'Nome' },
    nisResponsavel : {nome: 'R-NIS', dica: 'NIS do Responsável' },
    cpfResponsavel : {nome: 'R-CPF', dica: 'CPF do Responsável' },
    nomeResponsavel: {nome: 'R-Nome', dica: 'Nome do Responsável' },
    enquadramento  : {nome: 'Enquadramento' },
    valor          : {nome: 'Valor' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.falecidos = this.dados['tipologia_falecido'];
  }
}
