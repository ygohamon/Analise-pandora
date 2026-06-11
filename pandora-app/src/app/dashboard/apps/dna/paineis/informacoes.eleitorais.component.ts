
import { Component, OnInit, Input } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-dna-informacoes-eleitorais',
  template: `
  <div class="ui-g-12">
    <pandora-table
      caption="Doações para candidatos políticos"
      exportFilename="doacoes_feitas"
      [value]="dadosDoacoesFeitas"
      [dicionarioDados]="dicionarioDadosDoacoesFeitas">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchCase="'valor'">R$ {{utils.converteEmDinheiro(rowData.valor)}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  </div>

  <div class="ui-g-12">
    <pandora-table
      caption="Fornecimento feito para candidatos políticos"
      exportFilename="fornecimento_feito"
      [value]="dadosFornecimentosFeitos"
      [dicionarioDados]="dicionarioDadosFornecimentosFeitos">

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'cpf'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' class="primary-text">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchCase="'valor'">R$ {{utils.converteEmDinheiro(rowData.valor)}}</span>
              <span *ngSwitchCase="'maior'">R$ {{utils.converteEmDinheiro(rowData.maior)}}</span>
              <span *ngSwitchCase="'menor'">R$ {{utils.converteEmDinheiro(rowData.menor)}}</span>
              <span *ngSwitchCase="'media'">R$ {{utils.converteEmDinheiro(rowData.media)}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
          </td>
        </tr>
      </ng-template>
    </pandora-table>
  </div>
  `
})
export class DNAInformacoesEleitoraisComponent implements OnInit {

  @Input() dados;

  dadosDoacoesFeitas;
  dadosFornecimentosFeitos;

  dicionarioDadosDoacoesFeitas = {
    ano              : {nome: 'Ano'},
    cargo            : {nome: 'Cargo'},
    numeroCandidato  : {nome: 'Número'},
    partido          : {nome: 'Partido'},
    ue               : {nome: 'UE'},
    cpf              : {nome: 'CPF'},
    nome             : {nome: 'Nome'},
    qtd              : {nome: 'Quantidade'},
    valor            : {nome: 'Total'},
  }

  dicionarioDadosFornecimentosFeitos = {
    ano              : {nome: 'Ano'},
    cargo            : {nome: 'Cargo'},
    numeroCandidato  : {nome: 'Número'},
    partido          : {nome: 'Partido'},
    ue               : {nome: 'UE'},
    cpf              : {nome: 'CPF'},
    nome             : {nome: 'Nome'},

    qtd         : {nome: 'Quantidade'},
    maior       : {nome: 'Maior'},
    menor       : {nome: 'Menor'},
    media       : {nome: 'Média'},
    valor       : {nome: 'Total'},
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    const dados = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'eleitoral'))?.eleitoral;

    this.dadosDoacoesFeitas = (!dados) ? [] : dados.filter(x => x.tipo === 'doacao');
    this.dadosFornecimentosFeitos = (!dados) ? [] : dados.filter(x => x.tipo === 'forneceu');
  }
}
