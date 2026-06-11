import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { UsuarioService } from './../../services/usuario/usuario.service';
import { RelatorioService } from './../../services/relatorio/relatorio.service';
import { UtilsService } from '../../services/common/utils.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {

  recadastramento           : boolean;
  mostraModalRecadastramento: boolean;

  telefoneMask    : string;
  cpfMask         : string;
  ufOrgEmissorMask: string;
  loginUsuario    : string;

  formEnviado  : boolean;
  mostraPreview: boolean;

  captchaResponse;
  dadosCadastro;

  constructor(private route: ActivatedRoute,
              private usuarioService: UsuarioService,
              private relatorio: RelatorioService,
              private messageService: MessageService,
              public utils: UtilsService,
              private auth: AuthService,
              private router: Router) { }


  ngOnInit() {
    this.formEnviado                = false;
    this.mostraPreview              = false;
    this.mostraModalRecadastramento = false;
    this.loginUsuario = this.auth.getLogin();

    this.route.queryParams
      .subscribe((params: Params) => {
        const funcao = params['q'];
        if (funcao === 'recadastramento') { this.recadastramento = true; this.mostraModalRecadastramento = true; }
    });
  }

  enviarDados(cadastroForm) {
    this.mostraPreview = false;

    if (this.recadastramento) {
      this.atualizacaoCadastral(cadastroForm);
    } else {
      this.cadastroPessoaUsuario(cadastroForm);
    }
  }

  respostaRecaptcha(captchaResponse, cadastroForm) {
    // Formata os dados enviados
    this.dadosCadastro = cadastroForm.value;

    this.dadosCadastro.ufOrgEmissor = this.ufOrgEmissorMask.toUpperCase();
    this.dadosCadastro.telefone     = this.telefoneMask.replace(/[^0-9]/g, '');
    this.dadosCadastro.cpf          = this.cpfMask.replace(/[^0-9]/g, '');
    this.dadosCadastro.dataCadastro = (new Date()).toISOString();

    this.mostraPreview = true;
    this.captchaResponse = captchaResponse;
  }

  cadastroPessoaUsuario(cadastroForm) {

    if (cadastroForm.valid && this.captchaResponse) {
      this.dadosCadastro.recaptcha = this.captchaResponse;

      this.usuarioService.cadastroPessoaUsuario(this.dadosCadastro)
        .subscribe(resultado => {

          this.formEnviado  = true;
          if (resultado.status === 'OK') {
            this.messageService.add(this.utils.mensagemSucesso('Sucesso', resultado.msg));

            const fileName = `Cadastro - ${this.dadosCadastro.nome}.pdf`;
            this.relatorio.relatorioCadastro(JSON.parse(JSON.stringify(this.dadosCadastro)), fileName);

            setTimeout(() => this.router.navigate(['/']), 3000);
          } else {
            this.messageService.add(this.utils.mensagemErro('Erro', resultado.msg));
          }
        }, error => {
          this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao realizar o cadastro.'));
        });
    }
  }

  atualizacaoCadastral(cadastroForm) {
    if (cadastroForm.valid  && this.captchaResponse) {
      this.dadosCadastro.recaptcha = this.captchaResponse;

      this.usuarioService.recadastramentoPessoaUsuario(this.dadosCadastro)
        .subscribe(resultado => {
          this.formEnviado  = true;
          if (resultado.status === 'OK') {
            this.messageService.add(this.utils.mensagemSucesso('Sucesso', resultado.msg));
            setTimeout(() => this.auth.logout(), 5000);

          } else {
            this.messageService.add(this.utils.mensagemErro('Erro', resultado.msg));
          }
        }, error => {
          this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao realizar o recadastramento.'));
        });
    }
  }
}
