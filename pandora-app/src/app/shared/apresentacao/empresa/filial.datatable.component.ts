import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-empresa-filial-datatable',
    template: `
      <pandora-table
        caption="Filiais - Fonte: RF"
        exportFilename="filiais"
        [value]="filiais"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'logradouro'">{{(rowData.tipoLogradouro) ? rowData.tipoLogradouro + ' ' : '' }}{{rowData.logradouro}}</span>
                <span *ngSwitchCase="'dataInicioAtividade'">{{utils.formataData(rowData.dataInicioAtividade)}}</span>
                <span *ngSwitchCase="'cnpj'">
                    <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
                </span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class EmpresaFilialDatatableComponent {

    @Input() filiais;
    @Output() filiaisChange = new EventEmitter();

    dicionarioDados = {
      razaoSocial        : {nome: 'Razão Social'},
      cnpj               : {nome: 'CNPJ'},
      nomeFantasia       : {nome: 'Nome Fantasia'},
      dataInicioAtividade: {nome: 'Início Atividade'},
      logradouro         : {nome: 'Endereço'},
      municipio          : {nome: 'Município'},
      uf                 : {nome: 'UF'},
    }

    constructor(
      public utils: UtilsService
    ) {}
}
