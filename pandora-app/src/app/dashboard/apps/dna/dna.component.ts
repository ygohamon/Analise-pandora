import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import {DNAService} from '../../../services/dna/dna.service';
import { MessageService } from 'primeng/api';

declare var google: any;

@Component({
  selector: 'app-dna',
  templateUrl: 'dna.component.html',
  styleUrls: ['./dna.component.css'],
})
export class DNAComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  msgRegistroNaoEncontrado: string;

  buscaDnaSucesso: boolean;
  buscaDnaErro: boolean;
  buscaDnaFinalizada: boolean;

  inputCnpj: string;

  dnaInformacoes;

  constructor(
    private messageService: MessageService,
    private dna:            DNAService,
    public utils:           UtilsService
  ) {}

  ngOnInit() {
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.buscaDnaSucesso          = false;
    this.buscaDnaErro             = false;
    this.buscaDnaFinalizada       = false;
  }

  get isMobile () {
      return this.utils.isMobile();
  }

  ngOnDestroy() {
    this.dnaInformacoes = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  buscaDNA() {
    const cnpj = this.inputCnpj.replace(/[^0-9]/g, '');

    if (cnpj.length === 14 && this.utils.checaCNPJ(cnpj)) {

        this.dna.getInformacoesDNA(cnpj)
          .pipe(takeUntil(this._destroy$))
          .subscribe(resultado => {
            const { status, msg, dados } = resultado;
            this.buscaDnaFinalizada = true;

            if (status === 'OK') {
                this.buscaDnaSucesso = true;
                this.buscaDnaErro    = false;

                this.dnaInformacoes = dados;
                this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Informações de ${cnpj} adquiridas com sucesso.`));
            } else {
                this.buscaDnaSucesso = false;
                if (status !== 'ENOTFOUND') { this.buscaDnaErro = true; }

                this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
            }

        }, err => {
            this.buscaDnaSucesso = false;
            if (status !== 'ENOTFOUND') { this.buscaDnaErro = true; }

            this.messageService.add(this.utils.trataErroRequisicao(err, 'Ocorreu um erro ao buscar as informações da empresa.'));
        });
    } else {
        this.buscaDnaSucesso = false;
        this.messageService.add(this.utils.mensagemWarning('Atenção', 'CNPJ inválido.'));
    }
  }

  resetaBusca() {
      this.buscaDnaSucesso = false;
      this.dnaInformacoes  = null;
      this.inputCnpj       = null;
  }
}
