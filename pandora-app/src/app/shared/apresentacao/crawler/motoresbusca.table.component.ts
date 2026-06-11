import { Component, Input, OnChanges } from '@angular/core';

import {uniq} from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
    selector: 'app-crawlers-motoresbusca',
    template: `
      <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify" style="font-size: 12px">
        Atenção: O resultado abaixo contém buscas em diversos motores de busca e diversos domínios diferentes.
      </div>

      <div class="ui-g-12">
        <pandora-table
          #dt
          [caption]="cabecalho"
          exportFilename="motores_busca"
          [value]="data"
          [dicionarioDados]="dicionarioDados">

          <ng-template pTemplate="header" let-columns>
            <tr>
              <th *ngFor="let col of columns" [pandoraSortableColumn]="col.field">
                {{col.header}}
                <p-sortIcon [field]="col.field"></p-sortIcon>
              </th>
            </tr>

            <tr>
              <th *ngFor="let col of columns" [ngSwitch]="col.field">
                <input *ngSwitchCase="'titulo'" placeholder="Busca" pInputText type="text" style="width:100%" (input)="dt.filter($event.target.value, col.field, 'contains')">
                <input *ngSwitchCase="'descricao'" placeholder="Busca" pInputText type="text" style="width:100%" (input)="dt.filter($event.target.value, col.field, 'contains')">
                <p-multiSelect *ngSwitchCase="'dominio'"  [options]="opcoesDominio" [style]="{'width':'100%'}" defaultLabel="Domínios" (onChange)="dt.filter($event.value, col.field, 'equals')"></p-multiSelect>
                <p-multiSelect *ngSwitchCase="'filtro'"  [options]="opcoesFiltro" [style]="{'width':'100%'}" defaultLabel="Domínios" (onChange)="dt.filter($event.value, col.field, 'equals')"></p-multiSelect>
                <p-multiSelect *ngSwitchCase="'fonte'" [options]="opcoesFonte" [style]="{'width':'100%'}" defaultLabel="Fontes" (onChange)="dt.filter($event.value, col.field, 'equals')"></p-multiSelect>
              </th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'titulo'">
                    <a href="{{rowData.url}}" style="color: #3984b8;">{{(rowData.titulo) ? rowData.titulo : 'Link'}}</a>
                </span>
                <span *ngSwitchCase="'fonte'" class='font-weight-bold'>{{rowData.fonte}}</span>
                <span *ngSwitchCase="'data_hora'">{{utils.formataData(rowData.data_hora)}}</span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>
    `
})
export class CrawlersMotorBuscaTabelaComponent implements OnChanges {

  @Input() data;
  @Input() cabecalho;

  opcoesDominio;
  opcoesFonte;
  opcoesFiltro;

  dicionarioDados = {
    relevancia : { nome: 'Relevância' },
    dominio    : { nome: 'Domínio' },
    titulo     : { nome: 'Título' },
    descricao  : { nome: 'Descrição' },
    filtro     : { nome: 'Filtro' },
    data_hora  : { nome: 'Data Consulta' },
    fonte      : { nome: 'Fonte' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.opcoesDominio = uniq(this.data.map(d => d.dominio)).map(d => {return { label: d, value: d }});
    this.opcoesFonte = uniq(this.data.map(d => d.fonte)).map(d => {return { label: d, value: d }});
    this.opcoesFiltro = uniq(this.data.map(d => d.filtro)).map(d => {return { label: d, value: d }});
  }
}
