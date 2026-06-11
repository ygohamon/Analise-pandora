import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsService } from '../../../services/common/utils.service';
import { SefazMLService } from '../../../services/sefazML/sefazML.service';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { MessageService } from 'primeng/api';
import { uniq, uniqBy } from 'lodash-es';

@Component({
  selector: 'app-sefazML',
  templateUrl: 'sefazML.component.html'
})
export class SefazMLComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  msgRegistroNaoEncontrado: string;

  intervaloAnalise: Date[];
  dtInicio:Date;
  dtFim:Date;
  pt_br: any;
  cnpjEmitente : string;
  cnpjDestinatario: string;
  municipiosEncontrados: any;
  municipioDestinatario: any;
  produtosEncontrados: any;
  produtoSelecionado: any;
  buscaFinalizada        = false;
  buscaFinalizadaSucesso = false;
  buscaFinalizadaFalha   = false;
  itensAnomalos;

  // Colunas da tabela de resultado

  dicionarioBase = [
    { field: 'nomeProduto', header: 'Produto'},
    { field: 'unidadeAquisicao', header: 'Unidade de Aquisição'},
    { field: 'dataEmissao', header: 'Data de Emissão'},
    { field: 'faixaPreco', header: 'Preço esperado'},
    { field: 'ValorUnitario', header: 'Valor do Item'},
    { field: 'NomeDestinatario', header: 'Nome Destinatário'},
    { field: 'CNPJDestinatario', header: 'CNPJ Destinatário'},
    { field: 'endMunicipioDestinatario', header: 'Município Destinatário'},
    { field: 'CNPJEmitente', header: 'CNPJ Emitente'},
    { field: 'NomeEmitente', header: 'Nome Emitente'},
    { field: 'endMunicipioEmitente', header: 'Município Emitente'},
  ]

  constructor(private route: ActivatedRoute,
              private router: Router,
              private pesquisa: SefazMLService,
              private pesquisaMiscService: PesquisaMiscService,
              private message: MessageService,
              public utils: UtilsService) {}

  ngOnInit() {
    this.iniciar()
  }

  pesquisaProduto(event) {
    const produtoParcial = event.query;
    this.pesquisaMiscService.pesquisaProduto(produtoParcial)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        if (status === 'OK') {
          this.produtosEncontrados = dados[0];
          this.produtosEncontrados = this.produtosEncontrados.nome_produtos_nf;
        } else {
          this.produtosEncontrados = null;
        }
    });
  }

  iniciar(){
    this.pt_br = this.utils.locale_pt_br;
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado;
    this.resetaBusca();
    this.DecodeParams();
  }

  DecodeParams(){
    this.route.queryParams
      .subscribe((params: Params) => {
        this.cnpjEmitente = this.utils.decodificaDado(params['cnpjEmitente']);
        this.cnpjDestinatario = this.utils.decodificaDado(params['cnpjDestinatario']);
        let municipio = this.utils.decodificaDado(params['municipioDestinatario']);
        let produto = this.utils.decodificaDado(params['produto']);
        if (municipio)
          this.municipioDestinatario = {municipio:municipio}
        if (params['dtIni'])
          this.dtInicio = this.utils.toDate(this.utils.decodificaDado(params['dtIni']), 'YYYYMMDD');
        if (params['dtFim'])
          this.dtFim = this.utils.toDate(this.utils.decodificaDado(params['dtFim']), 'YYYYMMDD');
        if (produto)
          this.produtoSelecionado = {NomeProduto:produto}
        this.Buscar();
    });
  }

  pesquisaMunicipio(event) {
    const municipioParcial = event.query;
    this.pesquisaMiscService.pesquisaMunicipioUF('PB', municipioParcial)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        if (status === 'OK') {
          this.municipiosEncontrados = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
    });
  }

  ngOnDestroy() {
    this.resetaBusca();
    this._destroy$.next();
    this._destroy$.complete();
    this.Buscar();
  }

  openNewWindow(url){
    if (url)
      return window.open(url, '_blank');
    else
      alert('Link não cadastrado');
}

  get isMobile() {
    return this.utils.isMobile();
  }

  resetaBusca() {
    this.buscaFinalizada        = false;
    this.buscaFinalizadaSucesso = false;
    this.buscaFinalizadaFalha   = false;
    this.cnpjEmitente           = null;
    this.cnpjDestinatario       = null;
    this.municipioDestinatario  = null;
    this.intervaloAnalise       = null
    this.dtInicio               = null;
    this.dtFim                  = null;
    this.produtoSelecionado     = null;
  }

  Buscar() {
    let dtinicio;
    let dtfim;

    if (this.dtInicio){
      dtinicio = this.utils.formataData(this.dtInicio, 'YYYYMMDD');
    }

    if (this.dtFim){
      dtfim = this.utils.formataData(this.dtFim, 'YYYYMMDD');
    }

    var cnpjEmitente = this.utils.checaCNPJ(this.cnpjEmitente);
    var cnpjDestinatario = this.utils.checaCNPJ(this.cnpjDestinatario);

    this.pesquisa.pesquisaItensAnomalos(this.municipioDestinatario, cnpjEmitente, cnpjDestinatario, dtinicio, dtfim, this.produtoSelecionado)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaFinalizadaSucesso = true;
          this.buscaFinalizadaFalha   = false;

          this.itensAnomalos = dados[0];
          this.itensAnomalos = this.itensAnomalos.sefaz;
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Itens discrepantes encontradas.'));
      } else {
          this.buscaFinalizadaSucesso = false;
          if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }

          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }

        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao encontrar os itens discrepantes.'));
      });
  }
}
