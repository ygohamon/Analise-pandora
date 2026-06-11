import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { uniqWith, isEqual } from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';
import { SimbaService } from 'src/app/services/simba/simba.service';

@Component({
  selector: 'app-simba',
  templateUrl: 'simba.component.html'
})
export class SimbaComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  msgRegistroNaoEncontrado: string;

  buscaSucesso   : boolean = false;
  buscaFinalizada: boolean = false;
  buscaFalha     : boolean = false;

  dados;

  input;

  constructor(
    private pesquisa: SimbaService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  resetaBusca() {
    this.buscaSucesso    = false;
    this.buscaFalha      = false;
    this.buscaFinalizada = false;
    this.dados           = null;
    this.input           = null;
  }

  busca() {
    this.chamaService()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const {status, msg, dados} = resultado;
        this.buscaFinalizada       = true;

        if (status === 'OK') {
          this.buscaSucesso = true;
          this.dados        = this.formataDados(dados);

          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'))

        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os registros do SIMBA.'));
      });
  }

  chamaService() {
    if (this.utils.checaCPF(this.input)) {
      return this.pesquisa.pesquisaTopDadosBancariosCPF(this.utils.checaCPF(this.input));
    } else if (this.utils.checaCNPJ(this.input)) {
      return this.pesquisa.pesquisaTopDadosBancariosCNPJ(this.utils.checaCNPJ(this.input));
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Insira um CPF ou CNPJ dados válidos.'));
      return null;
    }
  }

  formataDados(dados) {
    return uniqWith(dados.map(d => {
      let cpf_cnpj = (d.TIPO_PESSOA == 1) ?
        ('00000000000' + d.CPF_CNPJ_PESSOA).slice(-11) :
        ('00000000000' + d.CPF_CNPJ_PESSOA).slice(-14);

      return {
        'REGRA' : d.REGRA,
        'CPF_CNPJ_PESSOA': cpf_cnpj,
        'NOME_PESSOA': d.NOME_PESSOA,
        'RESULTADO': d.RESULTADO,
        'TIPO_PESSOA': d.TIPO_PESSOA
      };
    }), isEqual)
  }

}
