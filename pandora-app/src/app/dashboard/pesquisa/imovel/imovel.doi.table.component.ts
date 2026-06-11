import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilsService } from 'src/app/services/common/utils.service';


@Component({
    selector: 'app-imovel-doi-table',
    template: `
      <pandora-table
        caption="Imóveis - Alienante - Fonte: DOI"
        exportFilename="imoveis_doi_alientante"
        [value]="dadosAlienante"
        dataKey="id"
        [mostraEspacamentoExpand]="true"
        [dicionarioDadosExpand]="dicionarioDadosExpand"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
          <tr>
            <td>
              <a href="#" [pandoraRowToggler]="rowData">
                <i class="pointer" [ngClass]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </a>
            </td>

            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cartorioCnpj'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cartorioCnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cartorioCnpj, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'cpfCnpjAlienante'">
                  <a *ngIf="rowData.cpfCnpjAlienante.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnpjAlienante)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAlienante, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnpjAlienante.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnpjAlienante)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAlienante, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'cpfCnpjAdquirente'">
                  <a *ngIf="rowData.cpfCnpjAdquirente.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnpjAdquirente)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAdquirente, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnpjAdquirente.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnpjAdquirente)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAdquirente, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'dataCarga'">{{utils.formataData(rowData.dataCarga)}}</span>
              <span *ngSwitchCase="'dataLavratura'">{{utils.formataData(rowData.dataLavratura)}}</span>

              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>

      <pandora-table
        caption="Imóveis - Adquirente - Fonte: DOI"
        exportFilename="imoveis_doi_adquirente"
        [value]="dadosAdquirente"
        dataKey="id"
        [mostraEspacamentoExpand]="true"
        [dicionarioDadosExpand]="dicionarioDadosExpand"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-expanded="expanded" let-rowData let-columns="columns">
          <tr>

            <td>
              <a href="#" [pandoraRowToggler]="rowData">
                <i class="pointer" [ngClass]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </a>
            </td>

            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cartorioCnpj'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cartorioCnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cartorioCnpj, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'cpfCnpjAlienante'">
                  <a *ngIf="rowData.cpfCnpjAlienante.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnpjAlienante)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAlienante, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnpjAlienante.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnpjAlienante)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAlienante, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'cpfCnpjAdquirente'">
                  <a *ngIf="rowData.cpfCnpjAdquirente.length === 11" [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpfCnpjAdquirente)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAdquirente, '###.###.###-##')}}</a>
                  <a *ngIf="rowData.cpfCnpjAdquirente.length === 14" [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cpfCnpjAdquirente)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpfCnpjAdquirente, '##.###.###/####-##')}}</a>
              </span>

              <span *ngSwitchCase="'dataCarga'">{{utils.formataData(rowData.dataCarga)}}</span>
              <span *ngSwitchCase="'dataLavratura'">{{utils.formataData(rowData.dataLavratura)}}</span>

              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    `
})
export class ImovelDOITableComponent implements OnInit {

    @Input() dados;

    dadosAlienante;
    dadosAdquirente;

    dicionarioDados = {
      cartorioCnpj        : {nome: 'CNPJ' },
      cartorioMunicipio   : {nome: 'Município' },
      cartorioUf          : {nome: 'UF' },
      cartorioRazaoSocial : {nome: 'Razão Social' },
      dataLavratura       : {nome: 'Data Lavratura' },
      cpfCnpjAlienante    : {nome: 'CPF-CNPJ Alienante' },
      alienante           : {nome: 'Alienante' },
      cpfCnpjAdquirente   : {nome: 'CPF-CNPJ Adquirente' },
      adquirente          : {nome: 'Adquirente' },
      dataCarga           : {nome: 'Data Carga' },
    };

    dicionarioDadosExpand = {
      livro     : {nome: 'Livro' },
      folha     : {nome: 'Folha' },
      matricula : {nome: 'Matrícula' },
      registro  : {nome: 'Registro' },
    };

    constructor(
      public utils: UtilsService
    ) {}

    ngOnInit() {
      this.dadosAlienante = this.dados
                                .filter(d => d.fonte.toUpperCase() === 'DOI' && d.tipo === 'alienante')
                                .map((d, i) => Object.assign(d, {id: i}))
      this.dadosAdquirente = this.dados
                                .filter(d => d.fonte.toUpperCase() === 'DOI' && d.tipo === 'adquirente')
                                .map((d, i) => Object.assign(d, {id: i}))
    }
}
