
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-inp-analise-cpf',
  // templateUrl: 'analise.cpf.component.html'
  template: `
    <div class="ui-g-12">
      <h3>Informações do gestor</h3>

      <div class="ui-g-3 pandora-atributo">Nome</div>
      <div class="ui-g-9">{{infoGestor.nome | uppercase}}</div>
      <div class="ui-g-3 pandora-atributo">CPF</div>
      <div class="ui-g-9">{{utils.formataDado(infoGestor.cpf, '###.###.###-##')}}</div>
    </div>

    <div class="ui-g-12">
      <pandora-table
        caption="Dados Gestor"
        exportFilename="dadosgestor"
        [value]="cargosGestor"
        [dicionarioDados]="dicionarioDadosGestor">
      </pandora-table>
    </div>

    <div class="ui-g-12">
      <h3>Resultado</h3>

      <pandora-table
        caption="Pessoas Identificadas"
        exportFilename="inp"
        [value]="dados"
        [mostraFiltroColunas]="true"
        [dicionarioDados]="dicionarioDadosPessoas">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>

              <span *ngSwitchCase="'CATEGORIA'">{{rowData.CATEGORIA.split('/').join(' / ')}}</span>
              <span *ngSwitchCase="'CPF'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.CPF)}' class="primary-text">{{utils.formataDado(rowData.CPF, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchCase="'CPF_PARENTE'">
                <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.CPF_PARENTE)}' class="primary-text">{{utils.formataDado(rowData.CPF_PARENTE, '###.###.###-##')}}</a>
              </span>
              <span *ngSwitchDefault>{{rowData[col.field]  | uppercase}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>
    </div>
  `
})
export class INPAnaliseCPFComponent implements OnInit {

  @Input() dados;

  // Colunas da tabela de resultado
  infoGestor;
  cargosGestor;
  dicionarioDadosGestor = {
    cargo   : { nome: 'Cargo', fn: (x) => this.utils.toUpperCase(x)},
    lotacao : { nome: 'Lotação', fn: (x) => this.utils.toUpperCase(x) },
  }

  dicionarioDadosPessoas = {
    NOME_PARENTE  : { nome: 'Nome' },
    CPF_PARENTE   : { nome: 'CPF' },
    CATEGORIA     : { nome: 'Relação' },
    CARGO_PARENTE : { nome: 'Cargo' },
    ULTIMO_MES_ANO: { nome: 'Última Ocorrência' },
    NATUREZA      : { nome: 'Natureza' },
    ORGAO         : { nome: 'Órgão' },
    ESFERA        : { nome: 'Esfera' },
  }

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.geraTabelaGestor();
  }

  geraTabelaGestor() {
    const dado = this.utils.first(this.dados);
    const ocupacoesGestor = dado['CARGO'].split('|');

    this.infoGestor = {
      cpf: dado['CPF'],
      nome: dado['NOME']
    };

    this.cargosGestor = ocupacoesGestor.map(d => {
      const _dados = d.split('/');
      return {
        cargo: _dados[0],
        lotacao: _dados[1]
      };
    });
  }
}
