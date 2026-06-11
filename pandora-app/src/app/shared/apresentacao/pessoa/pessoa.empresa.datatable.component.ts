import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-pessoa-empresa-datatable',
    template: `
      <pandora-table
        *ngIf="dataSocio.length"
        caption="Empresas que é Sócio - Fonte: RF"
        exportFilename="empresas"
        [value]="dataSocio"
        [dicionarioDados]="dicionarioDadosSocio">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'socio_percCapital'">{{rowData.socio_percCapital}} %</span>
              <span *ngSwitchCase="'dataInicioAtividade'">{{utils.formataData(rowData.dataInicioAtividade)}}</span>
              <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchCase="'cpfResponsavel'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfResponsavel)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfResponsavel, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>

      <div class="py-2" *ngIf="dataSocio.length > 0 && dataResponsavel.length > 0"></div>

      <pandora-table
        *ngIf="dataResponsavel.length"
        caption="Empresas que é Responsável - Fonte: RF"
        exportFilename="empresas_responsavel"
        [value]="dataResponsavel"
        [dicionarioDados]="dicionarioDadosResponsavel">

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'dataInicioAtividade'">{{utils.formataData(rowData.dataInicioAtividade)}}</span>
              <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>
      </pandora-table>

      <pandora-table
        *ngIf="dataContador.length"
        caption="Empresas que é Contador - Fonte: RF"
        exportFilename="empresas_contador"
        [value]="dataContador"
        [dicionarioDados]="dicionarioDadosResponsavel">

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

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
export class PessoaEmpresaDatatableComponent implements OnChanges {

    @Input() data;

    dataSocio;
    dataResponsavel;
    dataContador;

    dicionarioDadosSocio = {
        razaoSocial        : {nome: 'Razão Social' },
        cnpj               : {nome: 'CNPJ' },
        dataInicioAtividade: {nome: 'Início Atividade' },
        socio_percCapital  : {nome: 'Participação' },
        nomeResponsavel    : {nome: 'Responsável' },
        cpfResponsavel     : {nome: 'CPF' },
        fonte              : {nome: 'Fonte' },
    };

    dicionarioDadosResponsavel  = {
      razaoSocial        : {nome: 'Razão Social' },
      cnpj               : {nome: 'CNPJ' },
      nomeFantasia       : {nome: 'Nome Fantasia' },
      dataInicioAtividade: {nome: 'Data Início Atividade' },
      fonte              : {nome: 'Fonte' },
  }

    dicionarioDadosContador  = {
      razaoSocial        : {nome: 'Razão Social' },
      cnpj               : {nome: 'CNPJ' },
      nomeFantasia       : {nome: 'Nome Fantasia' },
      dataInicioAtividade: {nome: 'Data Início Atividade' },
      fonte              : {nome: 'Fonte' },
  }

    constructor(public utils: UtilsService) {}

    ngOnChanges() {
      this.dataSocio       = this.data.filter(d => d.vinculo === 'socio');
      this.dataResponsavel = this.data.filter(d => d.vinculo === 'responsavel');
      this.dataContador    = this.data.filter(d => d.vinculo === 'contador');
    }
}
