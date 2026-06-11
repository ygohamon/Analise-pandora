import { Component, Input } from '@angular/core';

import { UtilsService } from './../../../../services/common/utils.service';
import { ExportService } from 'src/app/services/common/export.service';

@Component({
  selector: 'app-simba-tabela',
  template: `
    <pandora-table
      [caption]="descricao"
      [value]="dados"
      [dicionarioDados]="dicionarioDados"
      exportFilename="simba">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
            <span class="ui-column-title">{{col.header}}</span>

            <span *ngSwitchCase="'CPF_CNPJ_PESSOA'">
              <a *ngIf="rowData.TIPO_PESSOA === 1" class="text-primary" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(checaCPF(rowData.CPF_CNPJ_PESSOA))}'>{{utils.formataDado(checaCPF(rowData.CPF_CNPJ_PESSOA), '###.###.###-##')}}</a>
              <a *ngIf="rowData.TIPO_PESSOA !== 1" class="text-primary" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.CPF_CNPJ_PESSOA)}' style="color: #3984b8;">{{utils.formataDado(rowData.CPF_CNPJ_PESSOA, '##.###.###/####-##')}}</a>
            </span>

            <span *ngSwitchCase="'RESULTADO'">
              <span *ngIf="rowData.REGRA === '10'">
                {{utils.converteEmDinheiro(rowData.RESULTADO)}}
              </span>
              <span *ngIf="rowData.REGRA !== '10'">
                R$ {{utils.converteEmDinheiro(rowData.RESULTADO)}}
              </span>
            </span>

            <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  `
})
export class SimbaTabelaComponent {

  @Input() alvo;
  @Input() dados;
  @Input() titulo;
  @Input() descricao;

  dicionarioDados = {
    CPF_CNPJ_PESSOA: {nome: 'CPF/CNPJ'},
    NOME_PESSOA:     {nome: 'Nome'},
    RESULTADO:       {nome: 'Valor'},
  }

  constructor(
    public utils: UtilsService,
    public exporta: ExportService
  ) {}

  get isMobile() {
    return this.utils.isMobile();
  }

  checaCPF(dado) {
    if (!dado) return null;
    if (dado === '00000000000191') return null;

    return this.utils.checaCPF(dado);
  }
}
