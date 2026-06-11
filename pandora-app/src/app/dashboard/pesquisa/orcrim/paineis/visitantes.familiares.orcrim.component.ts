import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'visitantes-familiares-orcrim-component',
  template: `
    <pandora-table
      caption="Visitantes com 2 (dois) ou mais parentes no sistema penitenciário"
      exportFilename="visitantes"
      styleClass="ui-corner-all"
      [mostraFiltroColunas]="true"
      [value]="familiaresVisitantes"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf_visitante'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_visitante)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_visitante, '###.###.###-##')}}</a>
            </span>

            <span *ngSwitchCase="'cpf_membro'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_membro)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_membro, '###.###.###-##')}}</a>
            </span>

            <span *ngSwitchCase="'data_visita'">{{utils.formataData(rowData.data_visita)}}</span>

            <span *ngSwitchDefault>{{rowData[col.field] | uppercase}}</span>

          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class VisitantesFamiliaresOrcrimComponent implements OnInit {
  @Input() dados;

  familiaresVisitantes;

  dicionarioDados = {
    cpf_visitante     : { nome: 'CPF Visitante' },
    nome_visitante    : { nome: 'Nome do Visitante' },
    parentesco        : { nome: 'Parentesco'},
    cpf_membro        : { nome: 'CPF' },
    nome_membro       : { nome: 'Nome' },
    unidade_prisional : { nome: 'Unidade Prisional' },
    data_visita       : { nome: 'Data da Visita' },
    horario_visita    : { nome: 'Horário'}
  };

  constructor(
    public utils: UtilsService
  ) {

  };

  ngOnInit(): void {
    this.familiaresVisitantes = this.utils.first(
      this.dados.filter(
        x => Object.keys(x)[0] === 'top_visitas'
      )
    )?.top_visitas;
  };
}
