import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {MenuItem, MessageService} from 'primeng/api';

import {uniq, startCase} from 'lodash-es';

import { LoadingBarService } from '@ngx-loading-bar/core';

import { RelatorioService } from './../../../../services/relatorio/relatorio.service';
import { UtilsService } from './../../../../services/common/utils.service';
import { AuthService } from './../../../../services/auth/auth.service';
import { SefazMLService } from '../../../../services/sefazML/sefazML.service';

@Component({
    selector: 'app-dashboard-sefazML',
    templateUrl: 'dashboard.component.html'
})

export class DashboardSefazMLComponent implements OnInit, OnDestroy {

  chartOption: any = {

  };

  chartOptionLine:any = {}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public utils: UtilsService,
    public auth: AuthService,
    private loadingBar: LoadingBarService,
    private pesquisa: SefazMLService,
    private message: MessageService,
    private relatorio: RelatorioService
  ) {}

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  tituloNome: string;
  tituloItemNF: string;

  // Para o layout
  itemNF:        string;
  itemNFValido:  boolean = false;

  buscaFinalizada: boolean = false;
  buscaSucesso:    boolean = false;
  buscaFalha:      boolean = false;

  nProcesso: string;

  categoriasEncontradas = [];
  dadosEncontrados;
  outrosItensNF;
  itensMesmoProduto;
  itensDiscrepantesEmpresaDestinataria;
  itemDetalhado;

  dadosItemAgrupado;
  dadosItemAgrupadoBool: boolean = false;
  mapaOptions;
  mapaOverlays;

  activeState: boolean[] = [false];

  onTabClose(event) {
    //close tab
  }

  onTabOpen(event) {
    //open tab
  }

  toggle(index: number) {
      this.activeState[index] = !this.activeState[index];
  }

  //dadosFotosPessoaBool: boolean = false;

  tituloCategorias = {
      outrosItens:                    { titulo: 'Itens da nota fiscal',                   tooltip: 'Itens da nota fiscal'}
  };

  menuItems: MenuItem[] = [
    {
      label: 'Relatório Resumido',
      icon: 'pi pi-file',
      items: this.criaOpcoesMenu(this.gerarPDFResumido.bind(this))
    },
    { separator:true },
    {
      label: 'Relatório Completo',
      icon: 'pi pi-file',
      items: this.criaOpcoesMenu(this.gerarPDFCompleto.bind(this))
    },
  ]

  dicionarioBaseItensNF = [
    { field: 'nomeProduto', header: 'Produto'},
    { field: 'unidadeAquisicao', header: 'Unidade de Aquisição'},
    { field: 'dataEmissao', header: 'Data de Emissão'},
    { field: 'faixaPreco', header: 'Preço esperado'},
    { field: 'ValorUnitario', header: 'Preço do Item'}
  ]

  dicionarioBaseOutrasOcorrenciasProduto = [
    { field: 'nomeProduto', header: 'Produto'},
    { field: 'unidadeAquisicao', header: 'Unidade de Aquisição'},
    { field: 'dataEmissao', header: 'Data de Emissão'},
    { field: 'faixaPreco', header: 'Preço esperado'},
    { field: 'ValorUnitario', header: 'Preço do Item'},
    { field: 'CNPJEmitente', header: 'CNPJ Emitente'},
    { field: 'NomeEmitente', header: 'Nome Emitente'},
    { field: 'endMunicipioEmitente', header: 'Município Emitente'},
    { field: 'NomeDestinatario', header: 'Nome Destinatário'},
    { field: 'CNPJDestinatario', header: 'CNPJ Destinatário'},
    { field: 'endMunicipioDestinatario', header: 'Município Destinatário'},
  ]

  dicionarioBaseOutrasOcorrenciasEntePublicoNF = [
    { field: 'nomeProduto', header: 'Produto'},
    { field: 'unidadeAquisicao', header: 'Unidade de Aquisição'},
    { field: 'dataEmissao', header: 'Data de Emissão'},
    { field: 'faixaPreco', header: 'Preço esperado'},
    { field: 'ValorUnitario', header: 'Preço do Item'},
    { field: 'CNPJEmitente', header: 'CNPJ Emitente'},
    { field: 'NomeEmitente', header: 'Nome Emitente'},
    { field: 'endMunicipioEmitente', header: 'Município Emitente'}
  ]

  alerts:string[] = [];

  public detalhePreco(itemDetalhado){
    if (itemDetalhado.anomalo)
      this.alerts.push('Preço unitário do produto suspeito.');
    if (itemDetalhado.ValorTotalItem != (itemDetalhado.ValorUnitario * itemDetalhado.QuantidadeItem).toFixed(2))
      this.alerts.push('Produto com um preço total que não corresponde com o seu preço unitário multiplicado pela sua quantidade vendida.');
    if (itemDetalhado.ValorTotalItem > itemDetalhado.vTotalNota)
      this.alerts.push('Preço total do produto maior que o preço da NF.');
  }

  public copiar(){

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.textOficio;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    document.execCommand("copy");
    this.message.add(this.utils.mensagemSucesso('Sucesso', 'Texto copiado.'));
  }

  textOficio = 'Os valores suspeitos decorrem do uso da técnica estatística de Desvio Padrão, que de forma simplificada, representa uma distância discrepante entre um determinado valor e a média de todos os valores encontrados.';
  public makeTextOficio(itemDetalhado){
    let calcPercent;
    this.textOficio = `${this.textOficio} O preço considerado "suspeito", ${this.utils.converteEmDinheiroFormatoBrasileiro(itemDetalhado.ValorUnitario)},`

    if (itemDetalhado.anomalo){
      if (itemDetalhado.ValorUnitario > itemDetalhado.upperLimit){
        if (itemDetalhado.ValorUnitario - itemDetalhado.upperLimit == 0)
          this.textOficio = `${this.textOficio} está quase a 0% acima do seu preço unitário esperado.`
        else{
          calcPercent = (((itemDetalhado.ValorUnitario / itemDetalhado.upperLimit)-1) * 100).toFixed(2);
          this.textOficio = `${this.textOficio} está ${this.utils.converteEmDinheiro(calcPercent)}% acima do seu preço unitário esperado.`
        }
      }else if (itemDetalhado.ValorUnitario < itemDetalhado.lowerLimit) {
        if (itemDetalhado.ValorUnitario - itemDetalhado.lowerLimit)
          this.textOficio = `${this.textOficio} está quase a 0% abaixo do seu preço unitário esperado.`
        else{
          calcPercent = ((1 - (itemDetalhado.ValorUnitario / itemDetalhado.lowerLimit)) * 100).toFixed(2);
          this.textOficio = `${this.textOficio} está ${this.utils.converteEmDinheiro(calcPercent)}% abaixo do seu preço unitário esperado.`
        }
      }
    }
  }

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();

    this.route.queryParams
      .subscribe((params: Params) => {
        this.itemNF = this.utils.decodificaDado(params['idItem']);

        if (this.itemNF) {
          this.itemNFValido = true;

          this.buscaIntegrada(this.itemNF);
        } else {
          this.buscaFalha = true;

          this.message.add(this.utils.mensagemErro('Erro', 'Item de nota fiscal Inválido'));
        }
    });
  }

  criaOpcoesMenu(fn) {
    const items = this.auth.getGrupos().map(g => {
      return {
        label: `Como ${g}`, icon: 'pi pi-globe', command: () => { fn(g); }
      }
    })

    return [{
      label: 'Download', icon: 'pi pi-download', command: () => fn()
    }].concat(items);
  }

  reset() {
    this.dadosEncontrados      = null;
    this.outrosItensNF         = null;
    this.itensMesmoProduto     = null;
    this.itensDiscrepantesEmpresaDestinataria = null;
    this.itemDetalhado         = null;
    this.dadosItemAgrupado     = null;
    this.categoriasEncontradas = null;

    this.tituloNome            = null;
    this.tituloItemNF          = null;

    this.buscaSucesso          = false;
    this.buscaFalha            = false;
    this.buscaFinalizada       = false;
    this.chartOption           = {};
    this.chartOptionLine       = {};
  }

  ngOnDestroy() {
    this.reset();

    this._destroy$.next();
    this._destroy$.complete();
  }

  public format(data)
  {
      return this.utils.converteEmDinheiroFormatoBrasileiro(data);
  }

  showLinePlot(datasEmissao, valores){

    this.chartOptionLine = {
      title: [
        {
            text: 'Diagrama de evolução do preço unitário do produto pelas datas de emissões das NFs, para todos os fornecedores',
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

  showBoxPlot(valores){
    this.chartOption = {
      title: [
        {
            text: 'Diagrama de caixa dos preços unitários do produto',
            left: 'center'
        },
        {
            // text: 'Limite superior: Q3 + 1.5 * IQR \nLimite inferior: Q1 - 1.5 * IQR',
            text: 'Os círculos representam os valores suspeitos',
            borderColor: '#999',
            borderWidth: 1,
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
                lineHeight: 20
            },
            left: '10%',
            top: '85%'
        }
    ],
    dataset: [{
        source: [
            valores
        ]
    }, {
        transform: {
            type: 'boxplot',
            config: { itemNameFormatter: 'R$ {value}' }
        }
    }, {
        fromDatasetIndex: 1,
        fromTransformResult: 1
    }],
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'cross'
        },
        formatter: (params) => {
          return (
            this.utils.converteEmDinheiroFormatoBrasileiro(params.data[1])
          );
        },

    },
    toolbox: {
      show: true,
      feature: {
          saveAsImage: {}
      }
    },
    grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
            show: false
        },
        splitLine: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        name: 'Valor (R$)',
        splitArea: {
            show: true
        }
    },
    series: [
        {
            name: 'boxplot',
            type: 'boxplot',
            datasetIndex: 1
        },
        {
            name: 'Valor discrepante',
            type: 'scatter',
            datasetIndex: 2
        }
    ]
    }
  }

  getDistanceFromLatLonInKm(position1, position2) {
    "use strict";
    var deg2rad = function (deg) { return deg * (Math.PI / 180); },
        R = 6371,
        dLat = deg2rad(position2.lat - position1.lat),
        dLng = deg2rad(position2.lng - position1.lng),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(deg2rad(position1.lat))
            * Math.cos(deg2rad(position1.lat))
            * Math.sin(dLng / 2) * Math.sin(dLng / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return ((R * c *1000).toFixed());
  }

  checkItemDiscrepantePorDistancia(itemDetalhado, destinatarios){
    var mediaDistancia = (destinatarios.reduce((t, n) => n + t.distanciaForncedor, 0)/destinatarios.length).toFixed()
    var destinatario = destinatarios.filter(f => f.cnpj == itemDetalhado.cnpjDestinatario)[0]
    if (itemDetalhado.anomalo && destinatario){
      if (itemDetalhado.ValorUnitario >= itemDetalhado.upperLimit && destinatario.distanciaForncedor < mediaDistancia){
        this.alerts.push(`O produto está com o preço maior que o preço esperado e a distância de entrega (${mediaDistancia}) entre esse fornecedor e o destinatário está menor que a média (${destinatario.distanciaForncedor}) entre as distâncias de entrega desse fornecedor/produto`)
      }else if (itemDetalhado.ValorUnitario <= itemDetalhado.lowerLimit && destinatario.distanciaForncedor > mediaDistancia){
        this.alerts.push(`O produto está com o preço menor que o preço esperado e a distância de entrega (${mediaDistancia}) entre esse fornecedor e o destinatário está maior que a média (${destinatario.distanciaForncedor}) entre as distâncias de entrega desse fornecedor/produto`)
      }
    }
  }

  alertsGeoCoordenadas:string[] = [];
  mapaCarregado:boolean = false;

  setaGeoCoordenadas(emitente, destinatarios) {
    var info;
    if (emitente && destinatarios){
      var emit = emitente[0];
      destinatarios = destinatarios.map(dest => {
        dest.distanciaForncedor = this.getDistanceFromLatLonInKm({lat: emit.lat, lng: emit.lng},{lat: dest.lat, lng: dest.lng})
        info = null;
        var cnpj = this.utils.formataDado(dest.cnpj, '##.###.###/####-##')
        if (dest.resultados == 0)
        {
          info = `Endereço do destinatário ${dest.nome} - ${cnpj} não plotado no mapa.`
        }
        else if (dest.resultados > 1){
          info = `Endereço do destinatário ${dest.nome} - ${cnpj} muito impreciso. Ele não será marcado no mapa.`
        }
        if (info)
          this.alertsGeoCoordenadas.push(info);
        return dest;
      })
      this.mapaOptions = {
        center: { lat: emit.lat, lng: emit.lng },
        zoom: 8
      };
      this.mapaOverlays = [
          new google.maps.Marker({
              position: { lat: emit.lat, lng: emit.lng },
              title: emit.nome
            })
      ];

      var passo;
      for (passo = 0; passo < destinatarios.length; passo++) {
        var destinatario = destinatarios[passo];
        if (destinatario.resultados == 1)
          this.mapaOverlays.push(
            new google.maps.Marker({
              position: { lat: destinatario.lat, lng: destinatario.lng },
              title: destinatario.nome + " (" + this.utils.formataDado(destinatario.cnpj, '##.###.###/####-##') + "). " + "Distância do fornecedor: " + destinatario.distanciaForncedor +"m",
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              }
            })
          )
      }
      this.mapaCarregado = true;
      this.checkItemDiscrepantePorDistancia(this.itemDetalhado, destinatarios);

    }else{
      this.mapaCarregado = false;
    }
  }

  buscaIntegrada(itemNf: any) {
    this.reset();

    this.loadingBar.start(10);
    this.pesquisa.pesquisaItemNFDetalhado(itemNf)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        this.loadingBar.complete();


        const {status, dados, msg} = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
            this.buscaSucesso = true;
            this.buscaFalha   = false;
            const merged          = Object.assign.apply(Object, dados);
            this.dadosEncontrados = merged;

            // this.dadosEncontrados = dados;
            this.outrosItensNF = this.dadosEncontrados.outros_itens_nf;
            this.itensMesmoProduto = this.dadosEncontrados.itens_mesmo_produto;
            this.itensDiscrepantesEmpresaDestinataria = this.dadosEncontrados.itens_discrepantes_mesma_empresa_destinatario_item;
            this.itemDetalhado = this.dadosEncontrados.item_detalhado[0];
            this.showBoxPlot(this.itensMesmoProduto.map(item => item.ValorUnitario));
            this.showLinePlot(this.itensMesmoProduto.map(item => this.utils.formataData(item.dataEmissao)),
              this.itensMesmoProduto.map(item => item.ValorUnitario))
            this.detalhePreco(this.itemDetalhado);
            this.makeTextOficio(this.itemDetalhado);
            this.setaGeoCoordenadas(this.dadosEncontrados.geocoordenadas_fornecedor, this.dadosEncontrados.geocoordenadas_destinatarios);

            // this.adicionaIndices(this.dadosEncontrados);

            // // Só permite as categorias cadastradas em tituloCategorias
            // this.categoriasEncontradas = Object.keys(this.tituloCategorias).filter(categoria => !!merged[categoria]);
            // // this.categoriasEncontradas = Object.keys(merged).filter(categoria => !!this.tituloCategorias[categoria]);

            // this.agrupaDadosItemNF();
            // this.geraTitulo();

            this.message.add(this.utils.mensagemSucesso('Sucesso', `Pesquisa de ${itemNf} concluída com sucesso!`));

        } else {
            this.buscaSucesso = false;
            this.buscaFalha   = true;
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.loadingBar.complete();
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  adicionaIndices(dadosEncontrados) {
      return Object.keys(dadosEncontrados).reduce((acc, categoria) => {
          acc[categoria] = dadosEncontrados[categoria].map((dado, i) => {
              dado['index'] = i;
              return dado;
          });
          return acc;
      }, {});
  }

  agrupaDadosItemNF() {
      const dadosPessoa = this.dadosEncontrados.pessoa;
      const atributosValidosEncontrados = dadosPessoa.map(registro => Object.keys(registro).filter(atributo => !!registro[atributo]));
      const flatAtributos = [].concat.apply([], atributosValidosEncontrados);
      const atributosUnicos = uniq(flatAtributos);

      const dadosAgrupados = {};

      atributosUnicos.forEach(atributo => {
        dadosAgrupados[atributo] = uniq(dadosPessoa
          .reduce((acc, registro) => (registro[atributo]) ? acc.concat(registro[atributo]) : acc, [])
          .map(d => this.utils.removerAcentos(d)));
      });

      this.dadosItemAgrupado = dadosAgrupados;
      this.dadosItemAgrupadoBool = true;
  }

  gerarPDFResumido(grupo: string = '') {
    const fileName = `Relatório - ${this.tituloNome} - ${this.itemNF}.pdf`;

    const clone_dadosItemAgrupado = JSON.parse(JSON.stringify(this.dadosItemAgrupado));
    const clone_dadosEncontrados = JSON.parse(JSON.stringify(this.dadosEncontrados));

    // this.relatorio.relatorioIntegradoResumidoItemNF(clone_dadosItemAgrupado, clone_dadosEncontrados, grupo, fileName)
  }

  gerarPDFCompleto(grupo: string = '') {
    const fileName = `Relatório Completo - ${this.tituloNome} - ${this.itemNF}.pdf`;

    const clone_dadosItemAgrupado = JSON.parse(JSON.stringify(this.dadosItemAgrupado));
    const clone_dadosEncontrados = JSON.parse(JSON.stringify(this.dadosEncontrados));

    // this.relatorio.relatorioIntegradoCompletoItemNF(clone_dadosItemAgrupado, clone_dadosEncontrados, grupo, fileName);
  }

  criaNome(nome: string){
    const nomes = nome.split(' ');
    this.tituloNome = startCase(`${nomes[0]} ${nomes[nomes.length-1]}`.toLowerCase());
  }

  getNomePessoa(){
    let pessoa_rf = this.dadosEncontrados.pessoa.filter(p => p.fonte === 'RF5');
    if (pessoa_rf.length === 0) { pessoa_rf = this.dadosEncontrados.pessoa.filter(p => p.fonte === 'RF4'); }

    if (pessoa_rf.length > 0) {
      this.criaNome(pessoa_rf[0].nome);
    }
  }

  geraTitulo(){
    this.getNomePessoa();
    this.tituloItemNF = ` - ${this.utils.formataDado(this.itemNF, '###.###.###-##')}`;
  }

  fecharAba(e){
    if (e.index >= 2) {
      const propriedade = this.categoriasEncontradas[e.index-2];
      delete this.dadosEncontrados[propriedade];
    }

    e.close();
  }
}
