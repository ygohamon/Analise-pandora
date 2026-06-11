import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { range } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { INPService } from '../../../services/inp/inp.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-inp',
  templateUrl: './inp.component.html',
})
export class INPComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  private _requisicaoOrgaoParcial$ = new Subject();

  // Flags
  buscaNepotismoSucesso: boolean;
  buscaNepotismoFalha: boolean;

  // Mensagem
  msgRegistroNaoEncontrado;

  // Autocomplete
  orgao: any;
  orgaosEncontrados: any;

  // Ano de Análise
  opcoesAnoAnalise;
  anoAnalise;
  cpfAnalise;

  tipoAnalise;

  // Nepotismo encontrado
  nepotismoEncontrado;

  constructor(
    private utils: UtilsService,
    private message: MessageService,
    private inp: INPService
  ) {}

  ngOnInit() {
    const anoAtual = (new Date()).getFullYear();

    this.opcoesAnoAnalise = range(2012, anoAtual+1)
      .map(ano => ({label: ano, value: ano}))
      .reverse()

    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.buscaNepotismoFalha   = false;
    this.buscaNepotismoSucesso = false;


    this._requisicaoOrgaoParcial$.pipe(
      filter((text: any) => text.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(orgaoParcial => {
      this.inp.pesquisaUGestoraMunicipalEstadual(orgaoParcial)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          if (status === 'OK') {
            this.orgaosEncontrados = dados;
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        });
    })
  }

  get isMobile () {
    return this.utils.isMobile();
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaBusca() {
    this.buscaNepotismoFalha   = false;
    this.buscaNepotismoSucesso = false;
    this.nepotismoEncontrado   = null;
    this.tipoAnalise           = null;
  }

  selecionaAnalise(tipoanalise) {
    this.tipoAnalise = tipoanalise;
  }

  buscaOrgao(event) {
    const orgaoParcial = event.query;
    this._requisicaoOrgaoParcial$.next(orgaoParcial);
  }

  onGerarAnaliseOrgao() {
    if (this.orgao && this.anoAnalise) {
      this.inp.getNepotismoLotacaoEsferaAno(this.orgao.ugestora, this.orgao.cdUgestora, this.orgao.esfera, this.anoAnalise)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          if (status === 'OK') {
            this.buscaNepotismoSucesso = true;
            this.buscaNepotismoFalha   = false;

            this.nepotismoEncontrado = dados;
            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa realizada com sucesso.'));
          } else {
            if (status !== 'ENOTFOUND') { this.buscaNepotismoFalha = true; }
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          if (status !== 'ENOTFOUND') { this.buscaNepotismoFalha = true; }
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao analisar o órgão.'));
        });
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Escolha um órgão e ano válidos.'));
    }
  }

  onGerarAnaliseCPF() {
    if (this.utils.checaCPF(this.cpfAnalise) && this.anoAnalise) {
      this.inp.getNepotismoCPF(this.cpfAnalise, this.anoAnalise)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          if (status === 'OK') {
            this.buscaNepotismoSucesso = true;
            this.buscaNepotismoFalha   = false;

            this.nepotismoEncontrado = dados;
            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa realizada com sucesso.'));
          } else {
            if (status !== 'ENOTFOUND') { this.buscaNepotismoFalha = true; }
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          if (status !== 'ENOTFOUND') { this.buscaNepotismoFalha = true; }
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao analisar o CPF.'));
        });
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Escolha um CPF e ano válidos.'));
    }
  }

  downloadRelatorio(nodes) {

  }
}
