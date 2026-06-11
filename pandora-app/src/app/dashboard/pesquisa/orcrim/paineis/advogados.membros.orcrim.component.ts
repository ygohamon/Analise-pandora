import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'advogados-membros-orcrim-component',
  template: `
    <pandora-table
      caption="Advogados dos Membros da Organização Criminosa"
      exportFilename="advogados"
      styleClass="ui-corner-all"
      [mostraFiltroColunas]="true"
      [value]="advogados"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>


            <span *ngSwitchCase="'cpf_membro'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_membro)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_membro, '###.###.###-##')}}</a>
            </span>
            <span *ngSwitchDefault>{{rowData[col.field] | uppercase}}</span>
            <span *ngSwitchCase="'cpf_advogado'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_advogado)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_advogado, '###.###.###-##')}}</a>
            </span>
          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class AdvogadoMembrosOrcrimComponent implements OnInit {
  @Input() dados;

  advogados;

  dicionarioDados = {
    cpf_membro    : { nome: 'CPF Membro' },
    nome_membro   : { nome: 'Nome' },
    cpf_advogado  : { nome: 'CPF Advogado' },
    nome_advogado : { nome: 'Advogado' },
    numero_oab    : { nome: 'Número OAB' },
    uf_oab        : { nome: 'UF OAB' }
  }

  constructor(
    public utils: UtilsService
  ) {

  }

  ngOnInit(): void {
    this.advogados = this.utils.first(
      this.dados.filter(
        x => Object.keys(x)[0] === 'advogados_internos'
      )
    )?.advogados_internos;
  }
}
