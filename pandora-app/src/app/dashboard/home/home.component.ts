import { Component, OnInit } from '@angular/core';

import { UtilsService } from './../../services/common/utils.service';
import { AuthService } from './../../services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  necessitaProcesso: boolean   = false;

  constructor(private utils: UtilsService,
              private message: MessageService,
              private auth: AuthService) { }

  ngOnInit() {
      this.necessitaProcesso = this.auth.getNecessitaProcesso();
  }

  onSetaProcesso(processo) {
    this.message.add(this.utils.mensagemInfo('Informação', `Processo ${processo} foi setado com sucesso.`));
    this.utils.setaProcesso(processo);
  }
}
