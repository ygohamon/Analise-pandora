import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { UtilsService } from './../../services/common/utils.service';
import { AuthService } from './../../services/auth/auth.service';
import { UsuarioService } from './../../services/usuario/usuario.service';
import { environment } from '../../../environments/environment';

import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('conteudo', { static: true }) conteudo: ElementRef;

  mostraAviso:  boolean   = false;
  errorMessage: string;

  // Armazena os dados do usuário
  formLogin: string;
  formSenha: string;

  constructor(private auth: AuthService,
              private usuario: UsuarioService,
              private messageService: MessageService,
              public utils: UtilsService,
              private router: Router) { }

  ngOnInit() {
      this.mostraAviso = false;

      if (this.auth.isAuthenticated()) {
        const r = this.router.navigate(['dashboard']);
      } else {
        this.auth.limpaStorage();
        this.auth.limpaCookies();
      }
  }

  getHeight() {
    if (this.utils.isMobile()) {
      return (this.conteudo.nativeElement.clientHeight > window.innerHeight) ? 'null' : `${window.innerHeight}px`;
    } else {
      return 'null';
    }
  }

  setaDadosUsuario(response) {
    let { status, msg, dados } = response;
    if (status === 'OK') {
      this.auth.setDadoUsuario(dados[0]);
    } else {
      this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
    }
  }

  setaPermissoes(response) {
    let { status, msg, dados } = response;
    if (status === 'OK') {
      this.auth.setPermissoes(dados);
    } else {
      this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
    }
  }

  respostaRecaptcha(captchaResponse) {
    const login = this.formLogin;
    const senha = this.formSenha;

    if ((login && senha && captchaResponse) || !environment.production) {

      const payload = {
        login,
        senha,
        recaptcha: captchaResponse
      }

      this.auth.login(payload)
        .pipe(
          switchMap(response => {
            const { status, msg, dados } = response;

            this.auth.setToken(dados['token']);

            let info = this.usuario.getInfoUsuario();
            let permissoes = this.usuario.getPermissoes();

            return forkJoin(info, permissoes);
          })
        )
        .subscribe(response => {

          this.setaDadosUsuario(response[0]);
          this.setaPermissoes(response[1]);

          if (response[0].status === 'OK' && response[1].status === 'OK') {
            this.auth.finishAuthentication();
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, 'Falha na autenticação do usuário.'));
          }
          this.auth.getPermissoes();
        }, error => {
          this.messageService.add(this.utils.mensagemErro('Erro', 'Ocorreu um erro ao realizar o login.'));
          this.messageService.add(this.utils.mensagemErro('Erro', error.error.msg));
        });
    }
  }

}
