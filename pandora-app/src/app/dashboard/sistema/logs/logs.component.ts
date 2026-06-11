import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SistemaService } from './../../../services/sistema/sistema.service';
import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  logsEncontrados;
  buscaUltimosLogsFinalizada = false;
  buscaSucesso               = false;
  buscaFalha                 = false;

  tokensValidos;

  msgRegistroNaoEncontrado: string;

  constructor(private sistema: SistemaService,
              private message: MessageService,
              public utils: UtilsService) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.getUltimosLogs();
  }

  ngOnDestroy() {
    this.logsEncontrados = null;
    this.tokensValidos   = null;
    this.buscaSucesso    = null;
    this.buscaFalha      = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  onTabChange(event) {
    if (event.index === 0) {
      this.getUltimosLogs();
    } else if (event.index === 1) {
      this.getTokensValidos();
    }
  }

  getUltimosLogs() {
    this.sistema.getLogs()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const { status, msg, dados } = resultado;
        this.buscaUltimosLogsFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.buscaFalha = false;

          this.logsEncontrados = dados;
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Registros de log foram buscados com sucesso.'))
        } else {
          this.buscaSucesso = false;
          this.buscaFalha = true;

          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os logs.'));
      });
  }

  getTokensValidos() {
    this.sistema.getTokensValidos()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.tokensValidos = dados;
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Tokens adquiridos com sucesso.'))
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os tokens.'));
      });
  }
}
