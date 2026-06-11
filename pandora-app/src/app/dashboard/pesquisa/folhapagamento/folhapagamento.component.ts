import { Component, OnInit, OnDestroy} from '@angular/core';

import { range } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaFolhaService } from '../../../services/pesquisa/pesquisa.folha.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-folhapagamento',
  templateUrl: './folhapagamento.component.html',
})
export class FolhaPagamentoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  private _requisicaoOrgaoParcial$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;
  nProcesso:       string;

  // Resultado da consulta
  folhaEncontrada;

  // Autocomplete
  orgao: any;
  orgaosEncontrados: any;

  // Periodo de analise
  opcoesAnoAnalise;
  opcoesMesAnalise;
  anoAnalise;
  mesAnalise;

  dicionarioDados = {
    nome:       {nome: 'Nome'},
    cpf:        {nome: 'CPF'},
    matricula:  {nome: 'Matrícula'},
    cargo:      {nome: 'Cargo'},
    poder:      {nome: 'Poder'},
    vinculo:    {nome: 'Vínculo'},
    dtAdmissao: {nome: 'Data Admissão'},
    vlBruto:    {nome: 'V. Bruto'}
  }

  constructor(
    private pesquisa: PesquisaFolhaService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();

    const anoAtual = (new Date()).getFullYear();

    this.opcoesAnoAnalise = range(2012, anoAtual+1)
      .map(ano => ({label: ano, value: ano}))
      .reverse()

    this.opcoesMesAnalise = [
      { label: 'Janeiro',   value: '01' },
      { label: 'Fevereiro', value: '02' },
      { label: 'Março',     value: '03' },
      { label: 'Abril',     value: '04' },
      { label: 'Maio',      value: '05' },
      { label: 'Junho',     value: '06' },
      { label: 'Julho',     value: '07' },
      { label: 'Agosto',    value: '08' },
      { label: 'Setembro',  value: '09' },
      { label: 'Outubro',   value: '10' },
      { label: 'Novembro',  value: '11' },
      { label: 'Dezembro',  value: '12' },
    ];

    this._requisicaoOrgaoParcial$.pipe(
      filter((text: any) => text.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(orgaoParcial => {
      this.pesquisa.pesquisaOrgaoMunicipalEstadual(orgaoParcial)
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

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  get isMobile () {
    return this.utils.isMobile();
  }

  resetaBusca() {
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.orgao             = null;
    this.orgaosEncontrados = null;
    this.folhaEncontrada   = null;
  }

  buscaOrgao(event) {
    const orgaoParcial = event.query;
    this._requisicaoOrgaoParcial$.next(orgaoParcial);
  }

  onGerarFolhaOrgao() {
    if (this.orgao && this.anoAnalise && this.mesAnalise) {
      this.chamaService()
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.folhaEncontrada = dados;

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
        error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
        });
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Escolha um órgão, mês e ano válidos.'));
    }
  }

  /**
   *
   * @param dados
   */
  chamaService() {
    if (this.orgao.esfera.toUpperCase() === 'M') {
      return this.pesquisa.pesquisaFolhaMunicipalCdOrgao(this.orgao.cdOrgao, this.orgao.orgao, this.mesAnalise, this.anoAnalise, this.nProcesso);
    } else if (this.orgao.esfera.toUpperCase() === 'E') {
      return this.pesquisa.pesquisaFolhaEstadualCdOrgao(this.orgao.cdOrgao, this.orgao.orgao, this.mesAnalise, this.anoAnalise, this.nProcesso);
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      return null;
    }
  }

}
