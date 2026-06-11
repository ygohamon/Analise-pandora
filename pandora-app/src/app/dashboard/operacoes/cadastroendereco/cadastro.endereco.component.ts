import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CadastroService } from '../../../services/cadastro/cadastro.service';
import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cadastro-endereco',
  templateUrl: './cadastro.endereco.component.html',
})
export class CadastroEnderecoComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso = false;
  buscaFinalizada = false;

  cepMask  = '';
  cpfMask  = '';
  ufMask  = '';

  constructor(public utils: UtilsService,
              private message: MessageService,
              private cadastro: CadastroService) {}

  ngOnInit() {
  }

  onCadastroSubmit(cadastroForm) {

    cadastroForm.value.cpf = this.cpfMask.replace(/[^0-9]/g, '');
    cadastroForm.value.cep = this.cepMask.replace(/[^0-9]/g, '');
    cadastroForm.value.uf  = this.ufMask.toUpperCase();

    if (cadastroForm.valid) {
      this.cadastro.cadastroEndereco(cadastroForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.message.add(this.utils.mensagemSucesso('Sucesso', msg));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao cadastrar o registro.'));
        });
    }
  }
}
