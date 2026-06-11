import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-pagas-por-orgao-publico',
  template: `
    <pandora-table
      caption="Recebimentos de Órgãos Públicos"
      exportFilename="empresas_receberam_estado"
      [value]="data"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'CNPJDestinatario'">
            <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.CNPJDestinatario)}' style="color: #3984b8;">{{utils.formataDado(rowData.CNPJDestinatario, '##.###.###/####-##')}}</a>
            </span>
            <span *ngSwitchCase="'ValorTotalNF'"> {{utils.converteEmDinheiroFormatoBrasileiro(rowData.ValorTotalNF)}} </span>
            <span *ngSwitchDefault>{{rowData[col.field]  | uppercase}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class DNAEmpresasPagasEstadoComponent {

  @Input() data;

  dicionarioDados = {
    CNPJDestinatario            : { nome: 'CNPJ' },
    NomeDestinatario            : { nome: 'Razão Social' },    
    endMunicipioDestinatario    : { nome: 'Município' },
    endUFDestinatario           : { nome: 'UF' },
    AnoEmissao                  : { nome: 'Mês/Ano Emissão'},
    ValorTotalNF                : { nome: 'Valor total da nota'}
  }

  constructor(
    public utils: UtilsService
  ) { }
}
