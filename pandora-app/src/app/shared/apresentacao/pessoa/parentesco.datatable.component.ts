import { Component, Input, OnChanges } from '@angular/core';

import { uniqBy } from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-parentesco-datatable',
    template: `
      <pandora-table
        caption="Parentescos"
        exportFilename="tabela_parentescos"
        [value]="dadosParentesco"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'cpf'">
                    <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                </span>
                <span *ngSwitchCase="'categoria'">{{rowData.categoria.split('/').join(' / ')}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
        </ng-template>
      </pandora-table>
    `
})
export class ParentescoDatatableComponent implements OnChanges {

    @Input() parentesco;

    dadosParentesco;

    dicionarioDados = {
      // { field: 'dataNascimento',  header: 'Data Nascimento' },
      // { field: 'sexo',            header: 'Sexo' },
        categoria: {nome: 'Relação' },
        cpf      : {nome: 'CPF' },
        nome     : {nome: 'Nome' },
        sexo     : {nome: 'Sexo' },
        idade    : {nome: 'Idade' },
        municipio: {nome: 'Município' },
        uf       : {nome: 'UF' },
    }

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges() {
        this.dadosParentesco = uniqBy(this.parentesco, (d) => {
            return d.categoria + d.cpf + d.nome + d.idade
                + d.dataNascimento + d.sexo + d.municipio
                + d.uf;
        });
    }
}
