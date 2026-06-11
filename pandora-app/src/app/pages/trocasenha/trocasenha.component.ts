import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-trocasenha',
  templateUrl: './trocasenha.component.html',
})
export class TrocaSenhaComponent implements OnInit {

  errorMessage: string;

  constructor(private auth: AuthService,
              private message: MessageService,
              private utils: UtilsService,
              private router: Router) { }

  ngOnInit() { }

  onTrocaSenhaSubmit(formData) {
    if (this.validaTrocaSenha(formData.value)){
      this.auth.trocasenha(formData.value)
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          if (status === 'OK') {
            this.message.add(this.utils.mensagemSucesso('Sucesso', msg));

            setTimeout(() => {
              this.auth.logout();
            }, 3000);

          } else {
            if (status === 'EPASSWORDNOTVALID') {
              this.message.add(this.utils.mensagemErro('Erro', msg));
            } else {
              this.message.add(this.utils.mensagemErro('Erro', 'Ocorreu um erro no servidor.'));
            }
          }
        }, error => {
          this.message.add(this.utils.mensagemErro('Erro', 'Ocorreu um erro no servidor.'));
        });
    }
  }

  validaTrocaSenha(dados) {
    if (dados.senhanova !== dados.senhanova2) {
      this.message.add(this.utils.mensagemErro('Erro', 'Os valores da senha nova precisam ser iguais.'));
      return false;
    } else if (dados.senhaantiga === dados.senhanova) {
      this.message.add(this.utils.mensagemErro('Erro', 'A senha nova não pode ser igual a senha atual.'));
      return false;
    } else if ( !this.validaForcaSenha(dados.senhanova) ) {
      this.message.add(this.utils.mensagemErro('Erro', 'A senha nova deve conter ao menos 8 caracteres, os quais devem ser pelo menos: um caractere maiúsculo, um minúsculo, um número e um caractere especial.'));
      return false;
    } else {
      return true;
    }
  }

  validaForcaSenha(senha) {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(senha);
  }
}
