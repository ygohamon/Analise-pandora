import { Component, Input, OnChanges } from '@angular/core';

import { UtilsService } from '../../../services/common/utils.service';

@Component({
  selector: 'app-pessoa-vizinhos-table',
  template: `
    <div class="ui-g">

      <ng-container *ngIf="dadosRF.length > 0">

        <div class="ui-g-12 pb-2">
          <pandora-table
            caption="Vizinhos - Fonte: RF"
            exportFilename="tabela_vizinhos_rf"
            [value]="dadosRF"
            [dicionarioDados]="dicionarioDadosRF">

            <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
              <tr>
                  <td *ngFor="let col of columns" [ngSwitch]="col.field">
                    <span class="ui-column-title">{{col.header}}</span>

                    <span *ngSwitchCase="'cpf'">
                      <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                    </span>
                    <span *ngSwitchCase="'dataNascimento'">{{utils.formataData(rowData.dataNascimento)}}</span>
                    <span *ngSwitchDefault>{{rowData[col.field]}}</span>
                  </td>
                </tr>
            </ng-template>
          </pandora-table>
        </div>
      </ng-container>

      <ng-container *ngIf="dadosCredilink.length > 0">

        <div class="ui-g-12 pb-2">
          <pandora-table
            caption="Vizinhos - Fonte: CDLK"
            exportFilename="tabela_vizinhos_credilink"
            [value]="dadosCredilink"
            [dicionarioDados]="dicionarioDadosCredilink">

            <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
              <tr>
                  <td *ngFor="let col of columns" [ngSwitch]="col.field">
                    <span class="ui-column-title">{{col.header}}</span>

                    <span *ngSwitchCase="'cpf'">
                      <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                    </span>
                    <span *ngSwitchCase="'dataNascimento'">{{utils.formataData(rowData.dataNascimento)}}</span>
                    <span *ngSwitchDefault>{{rowData[col.field]}}</span>
                  </td>
                </tr>
            </ng-template>
          </pandora-table>
        </div>
      </ng-container>

      <ng-container *ngIf="dadosEnergisa.length > 0">

        <div class="ui-g-12 my-2 pl-3 font-weight-bold text-justify">
          Os dados abaixo utilizam dados georeferenciados encontrados em nossas bases de dados.
        </div>

        <div class="ui-g-12 pb-2">
          <p-gmap
            [options]="mapaOptions"
            [overlays]="mapaOverlays"
            [style]="{'width':'100%','height':'320px'}">
          </p-gmap>
        </div>

        <div class="ui-g-12 pb-2">
          <pandora-table
            caption="Vizinhos - Geocoordenadas"
            exportFilename="tabela_vizinhos"
            [value]="dadosEnergisa"
            [dicionarioDados]="dicionarioDadosEnergisa">

            <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
              <tr>
                  <td *ngFor="let col of columns" [ngSwitch]="col.field">
                    <span class="ui-column-title">{{col.header}}</span>

                    <span *ngSwitchCase="'cpf'">
                      <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                    </span>
                    <span *ngSwitchCase="'dataNascimento'">{{utils.formataData(rowData.dataNascimento)}}</span>
                    <span *ngSwitchDefault>{{rowData[col.field]}}</span>
                  </td>
                </tr>
            </ng-template>
          </pandora-table>
        </div>
      </ng-container>
    </div>
    `
})
export class VizinhosTableComponent implements OnChanges {

  @Input() data;

  dadosRF;

  // Energisa
  alvoEnergisa;
  dadosEnergisa;
  mapaOptions;
  mapaOverlays;

  dadosCredilink;

  dicionarioDadosRF = {
    nome          : {nome: 'Nome' },
    cpf           : {nome: 'CPF' },
    dataNascimento: {nome: 'Data Nascimento' },
    logradouro    : {nome: 'Logradouro' },
    numero        : {nome: 'Número' },
    complemento   : {nome: 'Complemento' },
    fonte         : {nome: 'Fonte' },
  }

  dicionarioDadosEnergisa = {
    nome          : {nome: 'Nome' },
    cpf           : {nome: 'CPF' },
    logradouro    : {nome: 'Logradouro' },
    numero        : {nome: 'Número' },
    complemento   : {nome: 'Complemento' },
    distancia     : {nome: 'Distância' },
    fonte         : {nome: 'Fonte' },
  }

  dicionarioDadosCredilink = {
    nome          : {nome: 'Nome' },
    cpf           : {nome: 'CPF' },
    logradouro    : {nome: 'Logradouro' },
    numero        : {nome: 'Número' },
    complemento   : {nome: 'Complemento' },
    municipio     : {nome: 'Município' },
    fonte         : {nome: 'Fonte' },
  }

  constructor(
    public utils: UtilsService
  ) {}

  ngOnChanges() {
    this.dadosRF = this.data.filter(d => d.fonte.startsWith('RF'));
    this.dadosEnergisa = this.data.filter(d => d.fonte.startsWith('EN'));
    this.dadosCredilink = this.data.filter(d => d.fonte.startsWith('CDLK'));

    if (this.dadosEnergisa.length) {
      this.alvoEnergisa = this.dadosEnergisa.filter(d => !!d.alvo)[0];
      this.setaGeoCoordenadas();
    }
  }

  setaGeoCoordenadas() {
    const alvo = (!!this.alvoEnergisa) ?
      { lat: this.alvoEnergisa.lat, lng: this.alvoEnergisa.lng } :
      { lat: this.dadosEnergisa[0].lat, lng: this.dadosEnergisa[0].lng};

    const localizacao = new google.maps.Marker({ position: alvo, title: 'Localização' })

    this.mapaOptions = { center: alvo, zoom: 16 };
    this.mapaOverlays = [localizacao].concat(this.dadosEnergisa.map(d => {
      return new google.maps.Marker({ position: { lat: d.lat, lng: d.lng }, title: d.nome, icon: 'https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_orange.png' })
    }));
  }
}
