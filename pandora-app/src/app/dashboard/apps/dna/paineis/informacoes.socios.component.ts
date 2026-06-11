
import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-informacoes-socios',
  template: `
    <pandora-table
      caption="Informações do Histórico de Sócios"
      exportFilename="informacoes_socios"
      [value]="dadosInfoSocios"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                  <span class="ui-column-title">{{col.header}}</span>

                  <span *ngSwitchCase="'cpf'">
                    <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                  </span>
                  <span *ngSwitchCase="'cadastroUnico'">{{utils.formataSimNao(rowData.cadastroUnico)}}</span>
                  <span *ngSwitchCase="'analfabeto'">{{utils.formataSimNao(rowData.analfabeto)}}</span>
                  <span *ngSwitchCase="'servidorMunicipal'">{{utils.formataSimNao(rowData.servidorMunicipal)}}</span>
                  <span *ngSwitchCase="'servidorEstadual'">{{utils.formataSimNao(rowData.servidorEstadual)}}</span>
                  <span *ngSwitchCase="'servidorFederal'">{{utils.formataSimNao(rowData.servidorFederal)}}</span>
                  <span *ngSwitchCase="'filiadoPartido'">{{utils.formataSimNao(rowData.filiadoPartido)}}</span>
                  <span *ngSwitchCase="'doadorEleitoral'">{{utils.formataSimNao(rowData.doadorEleitoral)}}</span>
                  <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
          </tr>
      </ng-template>
    </pandora-table>
  `
})
export class DNAInformacoesSociosComponent implements OnInit {

  @Input() dados;

  dadosInfoSocios;

  dicionarioDados = {
    cpf              : {nome: 'CPF'},
    cadastroUnico    : {nome: 'Cad. Unico'},
    analfabeto       : {nome: 'Analfabeto'},
    // servidorMunicipal: {nome: 'S. Municipal'},
    // servidorEstadual : {nome: 'S. Estadual'},
    servidorFederal  : {nome: 'S. Federal'},
    filiadoPartido   : {nome: 'Filiação Partidária'},
    doadorEleitoral  : {nome: 'Doador Eleitoral'},
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosInfoSocios = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'infosocios'))?.infosocios;
  }
}
