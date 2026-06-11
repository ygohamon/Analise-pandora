import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-painelcovid-dashboard-tabelageral',
  template: `
    <pandora-table
      caption="Tabela geral de tipologias"
      exportFilename="tabelageral"
      [value]="tabelageral"
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
export class DashboardPainelCovidTabelaGeralComponent implements OnInit {

  @Input() dados;
  tabelageral;

  dicionarioDados = {
    municipio           : {nome: 'Município' },
    cpf                 : {nome: 'CPF' },
    nome                : {nome: 'Nome' },
    total               : {nome: 'Total', dica: 'Soma total dos valores recebidos' },
    qtd                 : {nome: 'Parcelas', dica: 'Número total de parcelas recebidas' },
    falecido            : {nome: 'Falecido', dica: 'Beneficiário está falecido' },
    exterior            : {nome: 'Exterior', dica: 'Beneficiário é reside no exterior' },
    servidor            : {nome: 'Servidor', dica: 'Beneficiário é servidor público' },
    empresas_responsavel: {nome: 'E-Responsável', dica: 'Número de empresas que o beneficiário é responsável' },
    empresas_socio      : {nome: 'E-Sócio', dica: 'Número de empresas que o beneficiário é sócio' },
    aeronave            : {nome: 'Aeronave', dica: 'Número de aeronaves que o beneficiário é proprietário' },
    embarcacao          : {nome: 'Embarcação', dica: 'Número de embarcações que o beneficiário é proprietário' },
    veiculo             : {nome: 'Veiculo', dica: 'Número de veículos que o beneficiário é proprietário' },
    doador              : {nome: 'Doador', dica: 'Beneficiário é doador de campanha' },
    candidato           : {nome: 'Candidato', dica: 'Beneficiário já foi candidato político' },
    tipologia_tcu       : {nome: 'TCU', dica: 'Quantificação do risco do beneficiário segundo as tipologias do TCU' },
    somatorio           : {nome: 'Somatório' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.tabelageral = this.dados['tabelageral'];
  }
}
