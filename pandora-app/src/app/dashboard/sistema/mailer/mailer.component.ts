import { Component, OnInit } from '@angular/core';

import { startCase } from 'lodash-es'
import { MessageService } from 'primeng/api';

import { Email } from '../../../typings/email.typings';

import { UtilsService } from '../../../services/common/utils.service';
import { SistemaService } from './../../../services/sistema/sistema.service';
import { MailerService } from './../../../services/mailer/mailer.service';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-mailer',
  templateUrl: './mailer.component.html'
})
export class MailerComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  private _requisicaoProcuraUsuarios$ = new Subject()

  buscaFalha = false;
  buscaFinalizada = false;
  buscaSucesso = false;
  usuariosEncontrados = [];
  usuariosSelecionados = [];

  email;//: Email;

  constructor(
    private sistema: SistemaService,
    private message: MessageService,
    public utils: UtilsService,
    private mailer: MailerService,
  ) {}

  ngOnInit() {
    this.resetaEmail();
    // this.getListaUsuarios();

    this._requisicaoProcuraUsuarios$.pipe(
      filter((text: any) => text.length > 2),
      debounceTime(100),
      distinctUntilChanged(),
    ).subscribe(loginParcial => {
      this.sistema.getListaUsuariosParcial(loginParcial)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          if (status === 'OK') {
            this.formataListaUsuarios(dados);
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar a lista de usuários.'));
        });
    })
  }

  ngOnDestroy() {
    this.resetaEmail();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaEmail() {
    this.email = {
      to: [{ nome: `Todos os usuários - <broadcast>`, email: 'broadcast'}],
      subject: '[PANDORA]',
      content: null
    };
  }

  formataListaUsuarios(dados) {
    this.usuariosEncontrados = dados.filter(d => !!d.email).map(d => {
      const nomes = d?.nome?.split(' ');
      const nomeAbreviado = (nomes) ? startCase(`${nomes[0]} ${nomes[nomes.length-1]}`.toLowerCase()) : d.login;

      return { nome:`${nomeAbreviado} - <${d.email}>`, email: d.email, login: d.login}
    });
  }

  getListaUsuarios(event) {
    const usuarioParcial = event.query;
    this._requisicaoProcuraUsuarios$.next(usuarioParcial)
  }

  enviarEmail() {
    this.mailer
      .enviaEmail(this.email)
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Email enviado com sucesso'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao enviar emails aos usuários.'));
      });
  }

}
