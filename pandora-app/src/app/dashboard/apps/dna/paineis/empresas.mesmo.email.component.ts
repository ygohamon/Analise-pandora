import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-empresas-mesmo-email',
  template: `
    <pandora-table
      caption="Empresas com mesmo email"
      exportFilename="empresas_mesmo_email"
      [value]="dadosEmpresa"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cnpj'">
            <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
            </span>
            <span *ngSwitchDefault>{{rowData[col.field]  | uppercase}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class DNAEmpresasMesmoEmailComponent implements OnInit {

  @Input() dados;

  dadosEmpresa;

  dicionarioDados = {
    email       : { nome: 'Email' },
    cnpj        : { nome: 'CNPJ' },
    razaoSocial : { nome: 'Razão Social' },
    nomeFantasia: { nome: 'Nome Fantasia' },
    municipio   : { nome: 'Município' },
    uf          : { nome: 'UF' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosEmpresa = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'empresasmesmoemail'))?.empresasmesmoemail;
  }
}
