import { Component, OnInit } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UtilsService } from '../../../services/common/utils.service';
import { SistemaService } from './../../../services/sistema/sistema.service';
import { MailerService } from './../../../services/mailer/mailer.service';

@Component({
  selector: 'app-limitesacesso',
  templateUrl: './limitesacesso.component.html'
})
export class LimitesAcessoComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  buscaFalha: boolean;

  constructor(
    private sistema: SistemaService,
    private message: MessageService,
    public utils: UtilsService,
    private mailer: MailerService,
  ) {}

  ngOnInit() {
    this.buscaFalha = false;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onTabChange(event) {

  }

}
