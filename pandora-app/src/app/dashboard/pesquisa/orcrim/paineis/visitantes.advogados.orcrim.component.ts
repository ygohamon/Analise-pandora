import { Component, Input, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/common/utils.service";

@Component({
  selector: 'visitantes-advogados-orcrim-component',
  template: `
    <pandora-table
      caption="Atendimentos de advogados"
      exportFilename="atendimentos_advogados"
      styleClass="ui-corner-all"
      [mostraFiltroColunas]="true"
      [value]="advogadosVisitantes"
      [dicionarioDados]="dicionarioDados">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'cpf_advogado'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_advogado)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_advogado, '###.###.###-##')}}</a>
            </span>

            <span *ngSwitchCase="'cpf_interno'">
              <a target='_blank' [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf_interno)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf_interno, '###.###.###-##')}}</a>
            </span>

            <span *ngSwitchCase="'data_visita'">{{utils.formataData(rowData.data_visita)}}</span>

            <span *ngSwitchDefault>{{rowData[col.field] | uppercase}}</span>

          </td>
        </tr>
      </ng-template>

    </pandora-table>
  `
})
export class VisitantesAdvogadosOrcrimComponent implements OnInit {
  @Input() dados;

  advogadosVisitantes;

  dicionarioDados = {
    cpf_advogado             : { nome: 'CPF Advogado' },
    nome_advogado            : { nome: 'Nome Advogado' },
    numero_oab               : { nome: 'Número OAB' },
    uf_oab                   : { nome: 'UF OAB' },
    cpf_interno              : { nome: 'CPF'},
    nome_interno             : { nome: 'Nome' },
    unidade_prisional        : { nome: 'Unidade Prisional' },
    cidade_unidade_prisional : { nome: 'Cidade' },
    data_visita              : { nome: 'Data'}
  };

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit(): void {
    this.advogadosVisitantes = this.utils.first(
      this.dados.filter(
        x => Object.keys(x)[0] === 'top_advogados'
      )
    )?.top_advogados;
  }
}
