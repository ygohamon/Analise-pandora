import { Component, OnInit, OnDestroy } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UtilsService } from './../../../../services/common/utils.service';
import { SistemaService } from './.././../../../services/sistema/sistema.service';

@Component({
  selector: 'app-limitesacessoporip-historico',
  template: `
      <pandora-table
        [value]="dados"
        [dicionarioDados]="dicionarioDados"
        [mostraFiltroColunas]='true'>
      </pandora-table>
    `
})
export class LimitesAcessoPorIPHistoricoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  dicionarioDados = {
    ip        : { nome: 'IP' },
    usuario   : { nome: 'Usuário' },
    url       : { nome: 'URL' },
    os        : { nome: 'OS' },
    browser   : { nome: 'Browser' },
    device    : { nome: 'Device' },
    data_hora : { nome: 'Horário', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY [as] HH:mm:ss') },
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
    this.sistema.getLimitesAcessoPorIPHistorico(null)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.dados = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        console.error('error');
        console.error(error);
      });
  }

}
