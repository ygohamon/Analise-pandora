import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'membros-orcrim-component',
  template: `
    <pandora-table
      caption="Membros da Organização Criminosa"
      exportFilename="membros_organizacao_criminosa"
      styleClass="ui-corner-all"
      [mostraFiltroColunas]="true"
      [value]="membrosOrganizacaoCriminosa"
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
export class MembrosOrcrimComponent implements OnInit {
  @Input() dados;

  membrosOrganizacaoCriminosa;

  dicionarioDados = {
    cpf  : { nome: 'CPF' },
    nome : { nome: 'Nome' }
  }

  /**
   *
   * @param utils
   */
  constructor (
    public utils: UtilsService
  ) { }

  /**
   *
   */
  ngOnInit() {
    this.membrosOrganizacaoCriminosa = this.utils.first(
      this.dados.filter(
        x => Object.keys(x)[0] === 'membros_organizacao_criminosa'
      )
    )?.membros_organizacao_criminosa;
  }
}
