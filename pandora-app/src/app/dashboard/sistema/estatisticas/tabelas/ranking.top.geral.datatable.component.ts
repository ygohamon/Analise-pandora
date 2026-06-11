import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { UtilsService } from 'src/app/services/common/utils.service';
import { SistemaService } from 'src/app/services/sistema/sistema.service';

@Component({
    selector: 'app-log-ranking-top-geral',
    template: `
      <pandora-table
        caption=" "
        exportFilename="mais_procurados"
        selectionMode="single"
        [(selection)]="recursoGeralSelecionado"
        (onRowSelect)="onRowSelect($event)"
        [value]="data"
        [mostraFiltroColunas]="true"
        [dicionarioDados]="dicionarioDados">

        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr [pandoraSelectableRow]="rowData">
            <td *ngFor="let col of columns" [ngSwitch]="col.field">
              <span class="ui-column-title">{{col.header}}</span>
              <span *ngSwitchDefault>{{rowData[col.field]}}</span>
            </td>
          </tr>
        </ng-template>

      </pandora-table>

      <p-dialog
        *ngIf="mostraTelaDetalhes"
        header="Detalhes"
        [(visible)]="mostraTelaDetalhes"
        [modal]="true"
        [style]="utils.getDialogStyle()">

          <pandora-table
            caption="Usuários que Pesquisaram"
            exportFilename="pesquisa_usuarios"
            [value]="usuariosQuePesquisaram"
            [dicionarioDados]="dicionarioDadosUsuario">
          </pandora-table>

        <p-footer>
          <div class="ui-dialog-buttonpane ui-helper-clearfix">
            <button type="button" pButton icon="pi pi-times" (click)="mostraTelaDetalhes=false" label="Fechar"></button>
          </div>
        </p-footer>
      </p-dialog>
    `
})
export class LogRankingTopGeralTableComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  @Input() data;

  recursoGeralSelecionado;
  mostraTelaDetalhes;
  usuariosQuePesquisaram;

  dicionarioDados = {
    chave: {nome: 'Parâmetro' },
    valor: {nome: 'Valor' },
    qtd  : {nome: 'QTD' },
  }

  dicionarioDadosUsuario = {
    usuario: {nome: 'Usuário' },
    qtd    : {nome: 'QTD' },
  }

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) {}

  ngOnInit() {
    this.usuariosQuePesquisaram = null;
    this.mostraTelaDetalhes = false;
  }

  ngOnDestroy() {
    this.usuariosQuePesquisaram = null;
    this.recursoGeralSelecionado = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  requisicaoUsuariosQuePesquisaram(duracao, chave, valor) {
    this.sistema.getUsuariosQuePesquisaramValores(duracao, chave, valor)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          if (status === 'OK') {
            this.usuariosQuePesquisaram = dados;
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }

      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  onRowSelect(event) {
    this.mostraTelaDetalhes = true;
    this.recursoGeralSelecionado = event.data;

    this.requisicaoUsuariosQuePesquisaram(null, this.recursoGeralSelecionado.chave, this.recursoGeralSelecionado.valor);
  }
}
