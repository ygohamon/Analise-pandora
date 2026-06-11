import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/services/common/utils.service';


@Component({
    selector: 'app-imovel-itbi-table',
    template: `
      <pandora-table
        caption="Imóveis - Fonte: ITBI"
        exportFilename="imoveis_doi_itbi"
        [value]="dadosITBI"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpfCnPJAnterior'">
                  <a *ngIf="rowData.cpfCnPJAnterior.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnPJAnterior)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnPJAnterior, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnPJAnterior.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnPJAnterior)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnPJAnterior, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'cpfCnpj'">
                  <a *ngIf="rowData.cpfCnpj.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpj, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnpj.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpj, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'valorMercado'">R$ {{utils.converteEmDinheiro(rowData.valorMercado)}}</span>
              <span *ngSwitchCase="'valorAvaliacao'">R$ {{utils.converteEmDinheiro(rowData.valorAvaliacao)}}</span>
              <span *ngSwitchCase="'dtAvaliacao'">{{utils.formataData(rowData.dtAvaliacao)}}</span>
              <span *ngSwitchCase="'dtLancamento'">{{utils.formataData(rowData.dtLancamento)}}</span>
              <span *ngSwitchCase="'areaPrivTotal'">{{rowData.areaPrivTotal}} m²</span>

              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    `
})
export class ImovelITBITableComponent implements OnInit {

    @Input() dados;

    dadosITBI;

    dicionarioDados = {
      proprietarioAnterior: {nome: 'Vendedor'},
      cpfCnPJAnterior     : {nome: 'Doc - Vendedor'},
      nome                : {nome: 'Nome'},
      logradouro          : {nome: 'Logradouro'},
      bairro              : {nome: 'Bairro'},
      natureza            : {nome: 'Natureza'},
      valorMercado        : {nome: 'V.Mercado'},
      valorAvaliacao      : {nome: 'V.Avaliação'},
      areaPrivTotal       : {nome: 'Área Total'},
      dtAvaliacao         : {nome: 'Data Avaliação'},
      dtLancamento        : {nome: 'Data Lançamento'}
    };

    constructor(
      public utils: UtilsService
    ) {}

    ngOnInit() {
      this.dadosITBI = this.dados.filter(d => d.fonte.toUpperCase() === 'ITB')
    }
}
