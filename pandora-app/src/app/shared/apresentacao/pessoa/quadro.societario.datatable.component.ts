import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-quadro-societario-datatable',
    template: `
      <pandora-table
        *ngIf="dataRF.length"
        caption="Quadro Societário - Fonte: RF"
        exportFilename="historico_societario_rf"
        dataKey="idx"
        [value]="dataRF"
        [mostraEspacamentoExpand]="true"
        [dicionarioDados]="dicionarioDadosRF">

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
          <tr>
            <td>
              <a href="#" [pandoraRowToggler]="rowData">
                  <i class="pointer" [ngClass]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </a>
            </td>

            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cnpj'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchCase="'dataInicioAtividade'">{{utils.formataData(rowData.dataInicioAtividade)}}</span>
              <span *ngSwitchCase="'dataEntradaSociedade'">{{utils.formataData(rowData.dataEntradaSociedade)}}</span>
              <span *ngSwitchCase="'dataSaidaSociedade'">{{utils.formataData(rowData.dataSaidaSociedade)}}</span>
              <span *ngSwitchCase="'percCapital'">{{rowData.percCapital}} %</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="rowexpansion" let-rowData let-columns="columns">
          <tr>
            <td [attr.colspan]="columns.length + 1">
              <div class="ui-grid ui-grid-responsive ui-fluid" style="padding:20px">
                <div class="ui-g-12">
                  <b>Responsável - CPF:</b> <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfResponsavel)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfResponsavel, '###.###.###-##')}}</a>
                </div>
                <div class="ui-g-12">
                  <b>Responsável - Nome:</b> {{rowData.nomeResponsavel}}
                </div>
              </div>
            </td>
          </tr>
        </ng-template>

      </pandora-table>

      <div class="py-2" *ngIf="dataRF.length > 0 && dataCNE.length > 0"></div>

      <pandora-table
        *ngIf="dataCNE.length"
        caption="Quadro Societário - Fonte: CNE"
        exportFilename="historico_societario_cne"
        [value]="dataCNE"
        [dicionarioDados]="dicionarioDadosCNE">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'CNPJ_EMPRESA'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.CNPJ_EMPRESA)}' style="color: #3984b8;">{{utils.formataDado(rowData.CNPJ_EMPRESA, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchCase="'DATA_ACAO'">{{utils.formataData(rowData.DATA_ACAO)}}</span>
              <span *ngSwitchCase="'VL_PARTICIPACAO'">R$ {{rowData.VL_PARTICIPACAO}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class QuadroSocietarioPFDatatableComponent implements OnChanges {

    @Input() data;
    @Output() dataChange = new EventEmitter();

    dataRF;
    dataCNE;

    dicionarioDadosRF = {
      razaoSocial         : {nome: 'Razão Social' },
      nomeFantasia        : {nome: 'Nome Fantasia' },
      cnpj                : {nome: 'CNPJ' },
      dataInicioAtividade : {nome: 'Data Início Atividade' },
      dataEntradaSociedade: {nome: 'Data Entrada' },
      dataSaidaSociedade  : {nome: 'Data Saída' },
      percCapital         : {nome: 'Participação' },
      vinculo             : {nome: 'Vínculo' },
    };

    dicionarioDadosCNE = {
      EMPRESA          : {nome: 'Razão Social' },
      CNPJ_EMPRESA     : {nome: 'CNPJ' },
      ORIGEM_INFORMACAO: {nome: 'Origem Informação' },
      ACAO             : {nome: 'Ação' },
      DATA_ACAO        : {nome: 'Data' },
      VINCULO          : {nome: 'Vínculo' },
      VL_PARTICIPACAO  : {nome: 'Valor Participação' },
    };

    constructor(
      public utils: UtilsService
    ) {}

    ngOnChanges () {
        this.dataRF = this.data
          .filter(d => d.fonte.startsWith('RF') || d.fonte.startsWith('CTX'))
          .map((d, idx) => Object.assign(d, {idx}));

        this.dataCNE = this.data.filter(d => d.fonte === 'CNE');
    }
}
