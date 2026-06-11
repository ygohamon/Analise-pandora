import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-yellowpages',
  templateUrl: 'yellowpages.component.html'
})
export class YellowPagesComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  private _requisicaoServico$ = new Subject();

  iCnpj;
  iServico;
  servicosEncontrados;

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;
  buscaFalha:      boolean = false;

  dicionarioDados = {
    nome                            : {nome: 'Serviço' },
    razaoSocial                     : {nome: 'Razão Social' },
    cnpj                            : {nome: 'CNPJ' , cnpj: true},
    endereco                        : {nome: 'Endereço' },
    telefone                        : {nome: 'Telefone' },
    email                           : {nome: 'Email' },
    sistemaSolicitacaoJudicical     : {nome: 'Sistema Solicitação', url: true },
    obs                             : {nome: 'Obs' },
    procedimentoSolicitacaoJudicial : {nome: 'Procedimento' },
    contatoTecnicoJuridico          : {nome: 'Contato Técnico' },
    dataRegistro                    : {nome: 'Data Registro', fn: (x) => this.utils.formataData(x, 'DD/MM/YYYY') },
  }

  constructor(
    private pesquisa: PesquisaMiscService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {

    this._requisicaoServico$.pipe(
      filter((text: any) => text.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(servicoParcial => {
      this.pesquisa.pesquisaYellowPagesRazaoSocial(servicoParcial)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.buscaFalha   = false;

            this.servicosEncontrados = dados;
          } else {
            this.buscaSucesso = false;
            this.buscaFalha   = true;
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.buscaFinalizada = true;
          this.buscaFalha = true;
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os registros.'));
        });
    })
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  pesquisaServico(event) {
    const servicoParcial = event.query;
    this._requisicaoServico$.next(servicoParcial)
  }

  resetaBusca() {

  }
}
