import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-discrepancias-por-orgao-publico',
  template: `
  <p-table
    #dt        
    [columns]="dicionarioBase"
    [value]="data"           
    exportFilename="itensDiscrepantes"
    [responsive]="true"
    [paginator]="true"
    [autoLayout]="true"
    [rows]="5">

    <ng-template pTemplate="caption">
      <div class="p-card-subtitulo my-2 text-left d-flex">
        Recebimento de mercadorias com preços suspeitos pelo ente público

        <div class="export-button pointer text-primary ml-auto" (click)="dt.exportCSV()">
          <span>CSV</span>
          <i class="pi pi-download"></i>
        </div>
      </div>

      <div style="text-align: left; padding: 10px 0px 5px 0px;" *ngIf="utils.isMobile()">
        <i class="pi pi-search mr-2"></i>
        <input type="text" pInputText placeholder="Filtro Global" (input)="dt.filterGlobal($event.target.value, 'contains')" style="width:90%">
      </div>
    </ng-template>

    <ng-template pTemplate="header" let-columns>
      <tr>
        <th *ngFor="let col of columns" [pSortableColumn]="col.field">
          {{col.header}}
          <p-sortIcon [field]="col.field"></p-sortIcon>
        </th>
      </tr>
      <tr>
        <th *ngFor="let col of columns" [ngSwitch]="col.field">                  
          <input *ngSwitchDefault placeholder="Busca" pInputText type="text" style="width:100%" (input)="dt.filter($event.target.value, col.field, 'contains')">
        </th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-rowData let-columns="columns">              
      <tr>
        <td *ngFor="let col of columns" [ngSwitch]="col.field">
          <span title="Detalhar produto" *ngSwitchCase="'nomeProduto'">
            <a target='_blank' [routerLink]="['/dashboard/apps/sefazML/dashboard']" [queryParams]='{idItem: utils.codificaDado(rowData.IdItem)}' class="primary-text">{{rowData.nomeProduto}}</a>
          </span>         
          <span *ngSwitchCase="'CNPJDestinatario'">
            {{utils.formataDado(rowData.CNPJDestinatario, '##.###.###/####-##')}}
          </span>
          <span *ngSwitchCase="'ValorUnitario'">
            {{utils.converteEmDinheiroFormatoBrasileiro(rowData.ValorUnitario)}}
          </span>
          <span *ngSwitchDefault>{{rowData[col.field]}}</span>
        </td>
      </tr>
    </ng-template>
  </p-table>
  `
})
export class DNAEmpresasPagasEstadoItensDiscrepantesComponent {

  @Input() data;

  dicionarioBase = [
    { field: 'nomeProduto', header: 'Produto'},    
    { field: 'unidadeAquisicao', header: 'Unidade de Aquisição'},    
    { field: 'dataEmissao', header: 'Data de Emissão'},    
    { field: 'faixaPreco', header: 'Preço esperado'}, 
    { field: 'ValorUnitario', header: 'Valor do Item'}, 
    { field: 'NomeDestinatario', header: 'Nome Destinatário'},    
    { field: 'CNPJDestinatario', header: 'CNPJ Destinatário'},    
    { field: 'endMunicipioDestinatario', header: 'Município Destinatário'}
  ]

  constructor(
    public utils: UtilsService
  ) { }
}
