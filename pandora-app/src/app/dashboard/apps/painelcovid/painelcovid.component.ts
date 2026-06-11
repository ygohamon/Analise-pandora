import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PainelCovidService } from './painelcovid.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-painelcovid',
  templateUrl: 'painelcovid.component.html',
})
export class PainelCovidComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso: boolean;
  ufSelecionado: string = 'PB';
  ufs;

  dados;


  constructor(
    private covid         : PainelCovidService,
    private messageService: MessageService,
    public utils          : UtilsService
  ) {}

  ngOnInit() {
    this.buscaSucesso = false;
    this.ufs = this.utils.opcoesUF;
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  get isMobile () {
    return this.utils.isMobile();
  }

  get nomeEstado () {
    return this.utils.opcoesUF.filter(uf => uf.label === this.ufSelecionado)[0].descricao;
  }

  resetaBusca() {
    this.buscaSucesso = false;
    this.dados = null;
  }

  geraPainel() {
    this.covid.getTabelaGeral(this.ufSelecionado)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {

          this.buscaSucesso = true;
          this.dados = Object.assign.apply(Object, dados);
          this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Informações de ${this.ufSelecionado} adquiridas com sucesso.`));
        } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
    }, err => {
        // this.buscaDnaSucesso = false;
        // if (status !== 'ENOTFOUND') { this.buscaDnaErro = true; }

        this.messageService.add(this.utils.trataErroRequisicao(err, 'Ocorreu um erro ao buscar as informações do painel.'));
    });
  }


}
