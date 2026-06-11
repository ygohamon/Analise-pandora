import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-pessoa-vizinhos-empresa-table',
  template: `
    <div class="ui-g">

      <ng-container *ngIf="dadosCredilink.length > 0">
        <div class="ui-g-12 pb-2">
          <pandora-table
            caption="Vizinhos - Fonte: CREDILINK"
            exportFilename="tabela_vizinhos_credilink"
            [value]="dadosCredilink"
            [dicionarioDados]="dicionarioDadosCredilink">

            <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
              <tr>
                  <td *ngFor="let col of columns" [ngSwitch]="col.field">
                    <span class="ui-column-title">{{col.header}}</span>
                    <span *ngSwitchCase="'cpfcnpj'">
                      <a *ngIf="rowData.cpfcnpj?.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfcnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfcnpj, '###.###.###-##')}}</a>
                      <a *ngIf="rowData.cpfcnpj?.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfcnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfcnpj, '##.###.###/####-##')}}</a>
                    </span>
                    <span *ngSwitchDefault>{{rowData[col.field]}}</span>
                  </td>
                </tr>
            </ng-template>
          </pandora-table>
        </div>
      </ng-container>

    </div>
    `
})
export class VizinhosEmpresaTableComponent implements OnChanges {
  @Input() data;

  mapaOptions;
  mapaOverlays;

  dadosCredilink;

  dicionarioDadosCredilink = {
    nome          : {nome: 'Nome' },
    cpfcnpj       : {nome: 'CPF/CNPJ' },
    logradouro    : {nome: 'Logradouro' },
    numero        : {nome: 'Número' },
    complemento   : {nome: 'Complemento' },
    municipio     : {nome: 'Município' },
    telefone      : {nome: 'Telefone'},
    fonte         : {nome: 'Fonte' },
  }

  ngOnChanges() {
    this.dadosCredilink = this.data.filter(d => d.fonte.startsWith('cred'))
  }

  constructor(
    public utils: UtilsService
  ) {}
}
