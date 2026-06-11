import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilsService } from '../../../services/common/utils.service';
import { SefazMLService } from '../../../services/sefazML/sefazML.service';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { MessageService } from 'primeng/api';
import { uniq, uniqBy } from 'lodash-es';
import { TableRowHeightAttributes } from 'docx';

interface classeProduto{
  nome:string,
  tipo:string
}
interface periodo{
  meses:string,
  desc:string
}

@Component({
  selector: 'app-sefazRank',
  templateUrl: 'sefazRank.component.html'
})
export class SefazRankComponent implements OnInit, OnDestroy {
  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  msgRegistroNaoEncontrado: string;

  intervaloAnalise: Date[];
  pt_br: any;
  topRank : string;
  cnpjDestinatario : string;
  municipiosEncontrados: any;
  produtosEncontrados: any;
  municipioDestinatario: any;
  produtoSelecionado: any;
  classesProduto: classeProduto[];
  classesSelecionada:classeProduto[];
  periodos: periodo[];
  periodoSelecionado:periodo;
  itensSuspeitos:boolean = false;
  dtInicio:Date;
  dtFim:Date;
  dtI:any;
  dtF:any;
  periodo:any;
  chartOptionLine:any = {}
  buscaFinalizada        = false;
  buscaFinalizadaSucesso = false;
  buscaFinalizadaFalha   = false;
  topFornecedores;  

  // Colunas da tabela de resultado

  dicionarioBase = [
    { field: 'NomeEmitente', header: 'Nome Emitente'},    
    { field: 'CNPJEmitente', header: 'CNPJ Emitente'},    
    { field: 'NomeDestinatario', header: 'Nome Destinatário'},    
    { field: 'CNPJDestinatario', header: 'CNPJ Destinatário'}, 
    { field: 'MunicipioDestinatario', header: 'Municipio Destinatário'}, 
    { field: 'OcorrenciaMaisRecente', header: 'Ocorrência mais recente'},    
    { field: 'OcorrenciaMaisAntiga', header: 'Ocorrências mais antiga'},
    { field: 'SomaTotalItens', header: 'Total'}  
  ]

  constructor(private router: Router,
              private pesquisa: SefazMLService,
              private pesquisaMiscService: PesquisaMiscService,
              private message: MessageService,
              public utils: UtilsService) {}
  
  ngOnInit() {
    this.iniciar()
  }

  iniciar(){    
    this.pt_br = this.utils.locale_pt_br;
    this.msgRegistroNaoEncontrado = this.utils.registroNaoEncontrado; 
    this.classesProduto = [
      {nome:'Alimento', tipo:'A'},
      {nome:'Vestuário', tipo:'V'},
      {nome:'Medicamento', tipo:'M'}
    ]
    this.periodos = [
      {meses:'12', desc:'12 meses'},
      {meses:'24', desc:'24 meses'},
      {meses:'36', desc:'36 meses'},
      {meses:'48', desc:'48 meses'},
      {meses:'60', desc:'60 meses'}
    ]   
    this.resetaBusca();
    this.topRank = "100";
    this.Buscar(false);
  }

  pesquisaMunicipio(event) {
    const municipioParcial = event.query;
    this.pesquisaMiscService.pesquisaMunicipioUF('ES', municipioParcial)
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

  ngOnDestroy() {
    this.resetaBusca();
    this._destroy$.next();
    this._destroy$.complete();
    this.Buscar(false); 
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
    this.LimparBusca();
    this.cnpjDestinatario       = null;
    this.periodoSelecionado     = this.periodos[0];
    this.topFornecedores        = null;
    this.classesSelecionada     = null;
    this.municipioDestinatario  = null;
    this.produtoSelecionado     = null;
    this.intervaloAnalise       = null;
    this.itensSuspeitos         = false;
    this.resetarCamposFiltroComputados();
  }  
  onChange(){    
    if (this.dtFim || this.dtInicio)
      this.periodoSelecionado = null;
  }

  onKeyDate(event){
    this.utils.onKeyDate(event)
    if (this.dtInicio || this.dtFim)    
      this.periodoSelecionado = null;
    else
      this.periodoSelecionado = this.periodos[0]
  }
  onChangePeriodo(event){    
    if (this.periodoSelecionado)
    {
      this.dtInicio = null;
      this.dtFim = null;  
    }
  }
  resetarCamposFiltroComputados(){
    this.dtI      = null;
    this.dtF      = null;
    this.periodo  = null;
    this.chartOptionLine = {};
  }
  computaCamposFiltro(){
    this.periodo = null;
    if (this.periodoSelecionado)
      this.periodo = this.periodoSelecionado.meses;
    else{
      if (this.dtInicio){
        this.dtI = this.utils.formataData(this.dtInicio, 'YYYYMMDD');
      }
      if (this.dtFim){
        this.dtF = this.utils.formataData(this.dtFim, 'YYYYMMDD');
      }
    } 
  }

  dtIniParam : string;
  dtFimParam : string;

  getDtIniParam(){
    this.dtIniParam = this.dtI;
    if (this.periodo)
      this.dtIniParam = this.utils.subtraiMesDataAtualFormatado(this.periodo, 'YYYYMMDD');
    this.dtIniParam = this.utils.codificaDado(this.dtIniParam);
  }

  getMunicipioDestinatario()
  {
    let municipio = null;
    if (this.municipioDestinatario)
      municipio = this.municipioDestinatario.municipio;
    return this.utils.codificaDado(municipio);
  }

  getProdutoSelecionado(){
    let produto = null;
    if (this.produtoSelecionado)
      produto = this.produtoSelecionado.NomeProduto;
    return this.utils.codificaDado(produto);
  }

  getDtFimParam(){
    this.dtFimParam = this.dtF;
    if (this.periodo)
     this.dtFimParam = this.utils.getDataAtualFormatado('YYYYMMDD');
    this.dtFimParam = this.utils.codificaDado(this.dtFimParam);
  }

  getDtParams(){
    this.getDtIniParam();
    this.getDtFimParam();
  }

  showLinePlot(datasEmissao, valores){    
    return this.chartOptionLine = {
      title: [
        {
            text: 'Evolução histórica (no período) das aquisições por data de emissão e valor da NF',
            left: 'center'
        }        
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        },
        formatter: (params) => {
          return (            
            params[0].name + "<br/><b>" +  this.utils.converteEmDinheiroFormatoBrasileiro(params[0].data) + "</b>"
          );
        },
      },
      toolbox: {
          show: true,
          feature: {
              saveAsImage: {}
          }
      },

      xAxis: {
        type: 'category',
        data: datasEmissao,
        name: 'Data emissão'
      },
      yAxis: {
          type: 'value',
          name: 'Valor (R$)',
          formatter: (params) => {
            return (            
              params[0].name + "<br/><b>" +  this.utils.converteEmDinheiroFormatoBrasileiro(params[0].data) + "</b>"
            );
          },
      },
      series: [{
          data: valores,
          type: 'line'
      }]
      }
  }

  graficoTopVendas(data){    
      if (!data.vendasFornecedor)
      this.pesquisa.pesquisaVendasFornecedor(this.classesSelecionada, this.dtI, this.dtF, this.periodo, data.CNPJDestinatario, data.CNPJEmitente, this.itensSuspeitos, this.produtoSelecionado)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;
          this.buscaFinalizada = true;
          if (status === 'OK') {
            this.buscaFinalizadaSucesso = true;
            this.buscaFinalizadaFalha   = false;
            var vendasFornecedor : any = dados[0];          
            vendasFornecedor =  vendasFornecedor.top_fornecedores;
            data.vendasFornecedor = 
            this.showLinePlot(vendasFornecedor.map(item => this.utils.formataData(item.DataEmissao)), 
              vendasFornecedor.map(item => item.SomaTotalItens));
            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Gráfico de vendas gerado.'));
        } else {
            this.buscaFinalizadaSucesso = false;
            if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }          

            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }

          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao gerar o gráfico.'));
        });
  }

  LimparBusca(){
    this.buscaFinalizada        = false;
    this.buscaFinalizadaSucesso = false;
    this.buscaFinalizadaFalha   = false;
  }
  
  Buscar(suspeitos:any) {
    this.LimparBusca();
    this.computaCamposFiltro();
    this.getDtParams();
    var cnpj = this.utils.checaCNPJ(this.cnpjDestinatario);
    this.pesquisa.pesquisaTopFornecedores(this.topRank, this.classesSelecionada, this.dtI, this.dtF, this.periodo, cnpj, this.municipioDestinatario, suspeitos, this.produtoSelecionado)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaFinalizadaSucesso = true;
          this.buscaFinalizadaFalha   = false;
          this.itensSuspeitos = suspeitos;

          this.topFornecedores =  dados[0];
          this.topFornecedores =  this.topFornecedores.top_fornecedores.map((d, i) => Object.assign(d, {key: i}));
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Top fornecedores encontradas.'));
      } else {
          this.buscaFinalizadaSucesso = false;
          if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }          

          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        if (status !== 'ENOTFOUND') { this.buscaFinalizadaFalha = true; }

        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao encontrar os top fornecedores.'));
      });
  }
}
