import { Component, OnInit, OnDestroy } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UtilsService } from './../../../../services/common/utils.service';
import { SistemaService } from './.././../../../services/sistema/sistema.service';

@Component({
  selector: 'app-limitesacessoporusuario',
  template: `
      <pandora-table
        #dt
        [value]="dados"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngFor="let col of columns" [pandoraSortableColumn]="col.field"> {{col.header}} <p-sortIcon [field]="col.field"></p-sortIcon></th>
            <th style="width: 3.25em">Resetar</th>
          </tr>
          <tr>
            <th *ngFor="let col of columns" [ngSwitch]="col.field">
              <input *ngSwitchDefault placeholder="Busca" pInputText type="text" style="width:100%" (input)="dt.filter($event.target.value, col.field, 'contains')">
            </th>
            <th style="width: 3.25em"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData let-expanded="expanded" let-columns="columns">
          <tr>
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>
              <span *ngSwitchCase="'proporcaoUso'">{{100 * rowData.proporcaoUso}} %</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
            <td>
              <i class="pointer fa fa-times" (click)="resetaQuotas(rowData)"></i>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage" let-columns>
          <tr>
              <td class="text-center font-weight-bold fs-3" [attr.colspan]="columns.length+1">{{utils.registroNaoEncontrado}}</td>
          </tr>
        </ng-template>
      </pandora-table>
    `
})
export class LimitesAcessoPorUsuarioComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  dicionarioDados = {
    usuario :     { nome: 'Usuário' },
    id :          { nome: 'ID' },
    pontosUsados: { nome: 'Pontos Usados' },
    proporcaoUso: { nome: 'Total', fn: (x) => x*100 + '%' },
  }

  dados;

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService
  ) {}

  ngOnInit() {
    this.getLimiteAcesso();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getLimiteAcesso() {
    this.sistema.getLimitesAcessoPorUsuario(null)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.dados = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => this.message.add(this.utils.trataErroRequisicao(error, `Ocorreu um erro ao pegar as quotas de acesso`)));
  }

  resetaQuotas(data) {
    this.sistema.removeLimitesAcessoPorUsuario(data.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.dados = this.dados.filter(d => d.usuario !== data.usuario);
          this.message.add(this.utils.mensagemSucesso(null, `Quotas do login ${data.usuario} resetadas com sucesso`));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => this.message.add(this.utils.trataErroRequisicao(error, `Ocorreu um erro ao resetar as quotas do login ${data.usuario}`)));
  }

}
