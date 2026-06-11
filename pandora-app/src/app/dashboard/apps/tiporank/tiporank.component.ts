import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tiporank',
  templateUrl: 'tiporank.component.html'
})
export class TipoRankComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();
  private _requisicaoMunicipioParcial$ = new Subject()

  ufs;
  ufSelecionado = 'PB';

  municipio: any;
  municipiosEncontrados: any;

  buscaTipologiasFinalizada        = false;
  buscaTipologiasFinalizadaSucesso = false;
  buscaTipologiasFinalizadaFalha   = false;
  tipologias;

  filtroPeso;
  filtroPesoTimeout;

  filtroOcorrencias;
  filtroOcorrenciasTimeout;

  filtroDoacoes;
  filtroDoacoesTimeout;

  filtroTCS;
  filtroTCSTimeout;

  // Colunas da tabela de resultado
  dicionarioDados = {
    razaoSocial:      {nome: 'Razão Social' },
    cnpj:             {nome: 'CNPJ' },
    nomeFantasia:     {nome: 'Nome Fantasia' },
    totalPeso:        {nome: 'Peso' },
    totalOcorrencias: {nome: 'Ocorrências' },
    doacaoEleitoral:  {nome: 'Doação Eleitoral' },
    totalTCS:         {nome: 'TCS' },
  }

  constructor(
    private pesquisa: PesquisaMiscService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.ufs = this.utils.opcoesUF.filter(uf => uf.value === 'PB');

    this._requisicaoMunicipioParcial$.pipe(
      filter((text: any) => text.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(municipioParcial => {
      this.pesquisa.pesquisaMunicipioUF(this.ufSelecionado, municipioParcial)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          if (status === 'OK') {
            this.municipiosEncontrados = dados;
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

  get isMobile() {
    return this.utils.isMobile();
  }

  resetaBusca() {
    this.buscaTipologiasFinalizada        = false;
    this.buscaTipologiasFinalizadaSucesso = false;
    this.buscaTipologiasFinalizadaFalha   = false;

    this.municipio                        = null;
    this.municipiosEncontrados            = null;
    this.tipologias                       = null;
  }

  pesquisaMunicipio(event) {
    const municipioParcial = event.query;
    this._requisicaoMunicipioParcial$.next(municipioParcial)
  }

  onGerar() {
    if (this.municipio) {
      this.pesquisa.pesquisaTipologiaUFMunicipio(this.ufSelecionado, this.municipio.municipio)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;
          this.buscaTipologiasFinalizada = true;

          if (status === 'OK') {
            this.buscaTipologiasFinalizadaSucesso = true;
            this.buscaTipologiasFinalizadaFalha   = false;

            this.tipologias = dados[0];
            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Tipologias geradas com sucesso.'));
        } else {
            this.buscaTipologiasFinalizadaSucesso = false;
            if (status !== 'ENOTFOUND') { this.buscaTipologiasFinalizadaFalha = true; }

            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          if (status !== 'ENOTFOUND') { this.buscaTipologiasFinalizadaFalha = true; }

          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as tipologias do município.'));
        });
    }
  }

  calculaTaxaDoacao(taxaDoacao) {
    return `${(100 * Number(taxaDoacao)).toFixed(2)} %`;
  }

  onPesoChange(event, dt) {
    if (this.filtroPesoTimeout) {
      clearTimeout(this.filtroPesoTimeout);
    }

    this.filtroPesoTimeout = setTimeout(() => {
      dt.filter(event.value, 'totalPeso', 'gt');
    }, 250);
  }

  onOcorrenciasChange(event, dt) {
    if (this.filtroOcorrenciasTimeout) {
      clearTimeout(this.filtroOcorrenciasTimeout);
    }

    this.filtroOcorrenciasTimeout = setTimeout(() => {
      dt.filter(event.value, 'totalOcorrencias', 'gt');
    }, 250);
  }

  onDoacoesChange(event, dt) {
    if (this.filtroDoacoesTimeout) {
      clearTimeout(this.filtroDoacoesTimeout);
    }

    this.filtroDoacoesTimeout = setTimeout(() => {
      dt.filter(event.value, 'doacaoEleitoral', 'gt');
    }, 250);
  }

  onTCSChange(event, dt) {
    if (this.filtroTCSTimeout) {
      clearTimeout(this.filtroTCSTimeout);
    }

    this.filtroTCSTimeout = setTimeout(() => {
      dt.filter(event.value, 'totalTCS', 'gt');
    }, 250);
  }

  getInformacaoDinheiro(dado) {
    return (dado) ? 'R$ ' + this.utils.converteEmDinheiro(dado) : '-';
  }
}
