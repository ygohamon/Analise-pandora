import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'membros-por-unidade-prisional-component',
  template: `
    <pandora-table
      caption="Membros Por Unidade Prisional"
      exportFilename="membros_por_unidade_prisional"
      styleClass="ui-corner-all"
      [mostraFiltroColunas]="true"
      [value]="membrosPorUnidadePrisional"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchDefault>{{rowData[col.field] | uppercase}}</span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class MembrosPorUnidadePrisionalComponent implements OnInit {
  @Input() dados;

  membrosPorUnidadePrisional;

  dicionarioDados = {
    cpf              : { nome: 'CPF' },
    faccionado       : { nome: 'Nome' },
    unidadePrisional : { nome: 'Unidade Prisional'},
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit(): void {
    this.membrosPorUnidadePrisional = this.utils.first(
      this.dados.filter(
        x => Object.keys(x)[0] === 'faccionados_unidade_prisional'
      )
    )?.faccionados_unidade_prisional;
  }
}
