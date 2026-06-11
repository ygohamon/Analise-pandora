import { Component, OnInit, ViewChild, Input, OnDestroy, ElementRef, Output, EventEmitter, OnChanges } from '@angular/core';

import Plotly from 'plotly.js-cartesian-dist';
import { UtilsService } from 'src/app/services/common/utils.service';

declare var google: any;

@Component({
  selector: 'app-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.css']
})
export class GmapComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('gmap', { static: true }) gmap;
  @ViewChild('histogramatemporal', { static: true }) histogramaTemporal : ElementRef;

  mapaCalor;
  escondeConfig;
  mostraAddCpf = false;

  @Input() dados;
  dadosViewPort;

  @Output() onBuscaCpf = new EventEmitter;

  options;

  intervaloFiltro: Date[];
  dimensoesMapa;
  rangeHorarios: number[] = [0, 23];

  diasSemana;
  diasSelecionados = [0, 1, 2, 3, 4, 5, 6];
  diasSelecionadosMultiSelect;

  // Usado para buscas extras de CPF
  cpfExtra;

  constructor(private utils: UtilsService) { }

  ngOnInit() {
    this.dadosViewPort = this.dados;
    this.diasSemana = [
      { label: 'S', value: 1 },
      { label: 'T', value: 2 },
      { label: 'Q', value: 3 },
      { label: 'Q', value: 4 },
      { label: 'S', value: 5 },
      { label: 'S', value: 6 },
      { label: 'D', value: 0 },
    ];
    this.diasSelecionadosMultiSelect = [0, 1, 2, 3, 4, 5, 6];

    this.inicializaMapa();
    this.recalculaMapa();
  }

  ngOnChanges(changes) {
    // Se não for a primeira iteracao de 'dados' ele recalcula o mapa
    if(!changes['dados'].isFirstChange()) {
      this.dadosViewPort = this.dados;
      this.recalculaMapa();
    }
  }

  ngOnDestroy() {
    this.gmap = null;
    this.mapaCalor = null;
    this.histogramaTemporal = null;
  }

  inicializaMapa() {
    if (this.utils.isMobile()) {
      this.dimensoesMapa = {'width':'100%','height':'70vh'}
    } else {
      this.dimensoesMapa = {'width':'100%','height':'75vh'}
    }

    this.options = {
      center: {
        lat: this.dadosViewPort[0].geo.lat(),
        lng: this.dadosViewPort[0].geo.lng()
      },
      mapTypeId: 'satellite',
      zoom: 13
    };

    setTimeout(() => this.criaMapaCalor(this.dadosViewPort), 0)
  }

  buscaDadosCpf () {
    this.onBuscaCpf.emit(this.cpfExtra);

    this.mostraAddCpf = false;
    this.cpfExtra     = null ;
  }

  onMapDragEnd(map) {
    this.dadosViewPort = this.filtraPontosNaTela(this.dados, map);
    this.recalculaMapa();
  }

  onMapClick(event) {
  }

  onZoomChanged(map) {
    this.dadosViewPort = this.filtraPontosNaTela(this.dados, map);
    this.recalculaMapa();
  }

  onPeriodoChange() {
    this.recalculaMapa();
  }

  criaMapaCalor(dados) {
    // Se já tiver um mapa de calor reinicializa
    if (this.mapaCalor) this.mapaCalor.setMap(null);

    this.mapaCalor = new google.maps.visualization.HeatmapLayer({
      data: dados.map(d => d.geo),
      map: this.gmap.map
    });
  }

  toggleBarraConfig() {
    this.escondeConfig = !this.escondeConfig;
  }

  mudaGradiente() {
    const gradient = [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(0, 0, 223, 1)',
      'rgba(0, 0, 191, 1)',
      'rgba(0, 0, 159, 1)',
      'rgba(0, 0, 127, 1)',
      'rgba(63, 0, 91, 1)',
      'rgba(127, 0, 63, 1)',
      'rgba(191, 0, 31, 1)',
      'rgba(255, 0, 0, 1)'
    ];

    this.mapaCalor.set('gradient', this.mapaCalor.get('gradient') ? null : gradient);
  }

  mudaRaio() {
    this.mapaCalor.set('radius', this.mapaCalor.get('radius') ? null : 20);
  }

  recalculaMapa() {
    const inicio = this.rangeHorarios[0];
    const fim    = this.rangeHorarios[1];
    const dias   = (this.diasSelecionados) ? this.diasSelecionados : [0, 1, 2, 3, 4, 5, 6];

    const novosDados = this.dadosViewPort.filter(d => (d.data.getHours() >= inicio && d.data.getHours() <= fim) && dias.includes(d.data.getDay()));

    this.calculaHistograma(novosDados);
    this.criaMapaCalor(novosDados);
  }

  calculaHistograma(dados) {
    const dadosHistograma = dados.map(d => d.data.getHours());
    const data = [
      {
        x: dadosHistograma,
        type: 'histogram',
      }
    ];

    const layout = {
      autosize: true,
      width: 225,
      height: 250,
      margin: {
        l: 25,
        r: 20,
        b: 25,
        t: 30,
        pad: 4
      },
      // paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    }

    Plotly.newPlot(this.histogramaTemporal.nativeElement, data, layout, { responsive: true })
  }

  filtraPontosNaTela(dados, map) {
    return dados.filter(d => map.getBounds().contains(d.geo));
  }

  rodaVideoMapaCalor() {
    const inicio = this.rangeHorarios[0];
    const fim    = this.rangeHorarios[1];
    const delta = fim - inicio;

    for(let i = 0; i <= delta; i = i+1) {
      setTimeout(() => {
        this.rangeHorarios[0] = inicio + i;
        this.rangeHorarios[1] = inicio + i;

        console.log('Recalcula hora: ' , inicio+i)
        this.recalculaMapa();
      }, 1000 * i);
    }

    this.rangeHorarios[0] = inicio;
    this.rangeHorarios[1] = fim;
    this.recalculaMapa();
  }

  reseta() {
    this.diasSelecionados = [0, 1, 2, 3, 4, 5, 6];
    this.rangeHorarios = [0, 23];

    this.recalculaMapa();
  }

  onDiasSelecionados(event) {
    this.diasSelecionados = event.value;
    this.recalculaMapa();
  }
}
