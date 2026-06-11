import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';
import { OndeAndeiService } from 'src/app/services/mapaconsumo/ondeandei.service';

declare var google: any;

@Component({
  selector: 'app-mapaconsumo',
  templateUrl: 'mapaconsumo.component.html',
  styleUrls: ['mapaconsumo.component.css']
})
export class MapaConsumoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  // Flags
  buscaMapaFinalizada: boolean;
  buscaMapaSucesso:    boolean;
  buscaMapaErro:       boolean;
  mostraMapa        = false;

  dadosMapa;
  movimentacoesPessoa;
  movimentacoesVeiculo;

  // Dados para consulta
  cpfAnalise;
  placaAnalise;
  intervaloAnalise: Date[];

  // Locale pro calendário
  pt_br: any;

  constructor(
    public utils: UtilsService,
    private messageService: MessageService,
    private ondeAndei: OndeAndeiService
  ) {}

  ngOnInit() {
    this.pt_br = this.utils.locale_pt_br;
    this.resetaBusca();
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
    this.mostraMapa = false;
    this.dadosMapa = [];
    this.movimentacoesPessoa = [];
    this.movimentacoesVeiculo = [];

    this.cpfAnalise = null;
    this.placaAnalise = null;
  }

  buscar() {
    if (this.cpfAnalise){
      this.buscaMovimentacaoPessoa(this.cpfAnalise);
    }
    if (this.placaAnalise) {
      this.buscaMovimentacaoVeiculo(this.placaAnalise);
    }
  }

  buscaMovimentacaoPessoa(cpf) {
    console.log('buscaMovimentacaoPessoa', cpf)

    if (this.utils.checaCPF(cpf)) {
      const _cpf = this.utils.checaCPF(cpf);
      let dtinicio;
      let dtfim;

      if (this.intervaloAnalise) {
        dtinicio = this.utils.formataData(this.intervaloAnalise[0], 'YYYYMMDD');
        dtfim    = this.utils.formataData(this.intervaloAnalise[1], 'YYYYMMDD');
      }

      this.ondeAndei.getMovimentacoesPessoa(_cpf, dtinicio, dtfim)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          this.buscaMapaFinalizada = true;

          if (status === 'OK') {
            this.buscaMapaSucesso = true;

            this.movimentacoesPessoa = dados;
            this.dadosMapa = this.dadosMapa.concat(dados.map(this.converteDados));

            this.mostraMapa = true;
            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Geolocalização dos registros de ${cpf} feita com sucesso.`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'CPF inválido.'));
    }

  }

  buscaMovimentacaoVeiculo(placa) {

    if (!!placa) {
      let dataInicial;
      let dataFinal;

      if (this.intervaloAnalise) {
        dataInicial = this.utils.formataData(this.intervaloAnalise[0], 'YYYY-MM-DDTHH:mm:ss');
        dataFinal   = this.utils.formataData(this.intervaloAnalise[1], 'YYYY-MM-DDTHH:mm:ss');
      }

      this.ondeAndei.getMovimentacoesVeiculo(placa, dataInicial, dataFinal)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;

          this.buscaMapaFinalizada = true;

          if (status === 'OK') {
            this.buscaMapaSucesso = true;

            this.movimentacoesVeiculo = dados;
            this.dadosMapa = this.dadosMapa.concat(dados.map(this.converteDados));

            this.mostraMapa = true;
            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Geolocalização dos registros de ${placa} feita com sucesso.`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Placa inválida.'));
    }

  }

  converteDados(d) {
    return {
      tipo: (d.lat) ? 'p' : 'v',
      geo: new google.maps.LatLng(d.lat || d.latitude, d.lng || d.longitude),
      data: new Date(d.dataEmissao || d.dataPassagem)
    };
  }

}
