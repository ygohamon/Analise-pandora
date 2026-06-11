import { Component, OnInit, ViewChild, QueryList, AfterViewInit, DoCheck, OnDestroy} from '@angular/core';
import {FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaImovelService } from '../../../services/pesquisa/pesquisa.imovel.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-imovel',
  templateUrl: './imovel.component.html',
})
export class ImovelComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;
  nProcesso:       string;

  // Resultado da consulta
  imoveisEncontrados;

  // Periodo de analise
  opcoesAnoAnalise;
  opcoesMesAnalise;
  anoAnalise;
  mesAnalise;


  campos = [
    {id: 'fCPF',            nome: 'CPF'},
    {id: 'fCNPJ',           nome: 'CNPJ'},
  ];

  constructor(
    private pesquisa: PesquisaImovelService,
    private message: MessageService,
    public utils: UtilsService
    ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaBusca() {
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.imoveisEncontrados = null;
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaBusca();

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaService(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const {status, msg, dados} = resultado;
          this.buscaFinalizada       = true;

          if (status === 'OK') {
            this.buscaSucesso       = true;
            this.imoveisEncontrados = dados;

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
        error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
        });
    } else {
      this.message.add(invalido[0]);
    }
  }

  chamaService(dados) {
    if (dados.fCPF) {
      return this.pesquisa.pesquisaImovelCPF(this.utils.checaCPF(dados.fCPF));
    } else if (dados.fCNPJ) {
      return this.pesquisa.pesquisaImovelCNPJ(dados.fCNPJ);
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      return null;
    }
  }
}
