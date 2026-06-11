import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { SistemaService } from './../../../../services/sistema/sistema.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-sistema-naoencontrados',
  template: `
    <div class="ui-g">
      <div class="ui-g-12 titulo">
        Registros Não Encontrados
      </div>

      <div class="ui-g-6 ui-sm-12">
        <pandora-table
          caption=" "
          exportFilename="cpfs_nao_encontrados"
          [value]="cpfsNaoEncontrados"
          [mostraFiltroColunas]="true"
          [dicionarioDados]="dicionarioDadosPF">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'cpf'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/pessoa']" [queryParams]='{cpf: utils.codificaDado(rowData.cpf)}' style="color: #3984b8;">{{utils.formataDado(rowData.cpf, '###.###.###-##')}}</a>
                </span>
                <span *ngSwitchDefault>{{rowData[col.field]}}</span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>

      <div class="ui-g-6 ui-sm-12">
        <pandora-table
          caption=" "
          exportFilename="cnpjs_nao_encontrados"
          [value]="cnpjsNaoEncontrados"
          [mostraFiltroColunas]="true"
          [dicionarioDados]="dicionarioDadosPJ">

          <ng-template pTemplate="body" let-rowData let-columns="columns">
            <tr>
              <td *ngFor="let col of columns" [ngSwitch]="col.field">
                <span class="ui-column-title">{{col.header}}</span>

                <span *ngSwitchCase="'cnpj'">
                  <a [routerLink]="['/dashboard/pesquisa/integrado/empresa']" [queryParams]='{cnpj: utils.codificaDado(rowData.cnpj)}' style="color: #3984b8;">{{utils.formataDado(rowData.cnpj, '##.###.###/####-##')}}</a>
                </span>
              </td>
            </tr>
          </ng-template>

        </pandora-table>
      </div>

    </div>
  `,
  styleUrls: ['../estatisticas.component.css']
})
export class SistemaNaoEncontradosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  cpfsNaoEncontrados;
  cnpjsNaoEncontrados;

  dicionarioDadosPF = {
    cpf : {nome: 'CPF' },
  }

  dicionarioDadosPJ = {
    cnpj : {nome: 'CNPJ' },
  }

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) { }

  ngOnInit() {
    this.requisicaoNaoEncontrados();
  }

  ngOnDestroy() {
    this.cpfsNaoEncontrados = null;
    this.cnpjsNaoEncontrados = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  requisicaoNaoEncontrados() {
    this.sistema.getRegistrosNaoEncontrados()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.cpfsNaoEncontrados   = dados.filter((r: any) => r.tipo === 'cpf');
          this.cnpjsNaoEncontrados  = dados.filter((r: any) => r.tipo === 'cnpj');
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
    }
}
