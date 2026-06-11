import { Component, OnInit, Input } from '@angular/core';

import { latLng, tileLayer, geoJSON, Layer, Map, point, Browser, Control, DomUtil, marker, icon } from 'leaflet';

import { UtilsService } from 'src/app/services/common/utils.service';
import { GeoJSONService } from 'src/app/services/common/geojson.service';

@Component({
  selector: 'app-painelcovid-dashboard-mapa',
  template: `
    <div style="height: 480px; z-index: 0;"
      leaflet
      (leafletMapReady)="onMapReady($event)"
      [leafletLayers]="leafletLayers"
      [leafletOptions]="leafletOptions">
    </div>
  `
})
export class DashboardPainelCovidMapaComponent implements OnInit {

  @Input() dados;
  @Input() uf: string;

  // Atributos do Leaflet
  leafletOptions;
  leafletLayers;

  // Atributos do mapa
  mapa;
  painelInformacao;
  dadosMapa;
  percentis;
  fronteiraUf;
  geoJSON;

  constructor(
    public utils: UtilsService,
    public geo: GeoJSONService,
  ) {}

  ngOnInit() {
    this.criaTelaInfo();

    this.dadosMapa = this.dados['valoresmunicipio'];
    const valoresPagos = this.utils.sortNum(this.dadosMapa.map(d => d.total));

    // Criando distribuicao dos dados para criação da paleta de cores
    // Primeiro calcula os decis, depois 95 e 99 percentil
    this.percentis = Array(10).fill(0).map((x,i) => this.utils.quartil(valoresPagos, i/10));
    this.percentis = this.percentis.concat(this.utils.quartil(valoresPagos, .95));
    this.percentis = this.percentis.concat(this.utils.quartil(valoresPagos, .99));

    this.leafletOptions = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      ],
    };

    this.geo.getGeoJSON(this.uf.toLowerCase()).subscribe(dado => {
      this.geoJSON = dado;
      this.criaMapa();
    })
  }

  ngOnDestroy() {
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  criaMapa() {
    this.fronteiraUf = geoJSON(this.addDados(this.geoJSON, this.dadosMapa), { onEachFeature: this.onEachFeature, style: this.style.bind(this)});
    this.leafletLayers = [this.fronteiraUf];

    this.mapa.fitBounds(this.fronteiraUf.getBounds(), { animate: true })
  }

  onMapReady(map: Map) {
    this.mapa = map;
    this.painelInformacao.addTo(this.mapa);
    // this.painelLegenda.addTo(this.mapaParaiba);
  }

  addDados(geojson, dadosMunicipio) {
    geojson.features = geojson.features.map(municipio => {
      const m = dadosMunicipio.filter(dado => dado.cdIbge === municipio.properties.id || dado.municipio.toUpperCase() === municipio.properties.name.toUpperCase());

      if (m.length > 0) {
        municipio.properties.qtd   = m[0]?.qtd;
        municipio.properties.total = m[0]?.total;
      }

      return municipio;
    });

    return geojson;
  }

  criaTelaInfo() {
    this.painelInformacao = new Control({'position': 'topright'});
    const converteEmDinheiro = this.utils.converteEmDinheiro;

    this.painelInformacao.update = function (d) {
      this._div.innerHTML = '<h4>Valores pagos</h4>';
      if (d?.qtd) {
        this._div.innerHTML += `<b>${d.name}</b>
          <br/>
          Quantidade: ${d.qtd}
          <br/>
          Pago: R$${converteEmDinheiro(d.total)}`;
      } else {
        this._div.innerHTML += 'Escolha um município';
      }
    };

    this.painelInformacao.onAdd = function (map) {
      this._div = DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
  }

  onEachFeature = (feature, layer) => {

    const highlightFeature = (e) => {
      const _layer = e.target;

      _layer.setStyle({
        weight: 3,
        color: '#2b4e87',
        dashArray: '',
        fillOpacity: 0.7
      });

      if (!Browser.ie && !Browser.opera12 && !Browser.edge) {
        _layer.bringToFront();
      }

      this.painelInformacao.update(_layer.feature.properties);
    };

    const resetHighlight = (e) => {
      this.fronteiraUf.resetStyle(e.target);
      this.painelInformacao.update();
    };
    const zoomToFeature = (e) => { this.mapa.fitBounds(e.target.getBounds())};

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  geraCor = (valor) => {

    // Paleta criada em https://gka.github.io/palettes
    const paleta = ['#fcf9ea', '#f9e7d7', '#f5d5c3', '#f0c2b0', '#ebb19e', '#e59f8c', '#de8d7a', '#d77b69', '#cf6858', '#c65547', '#bd4137', '#b32a28', '#a90019'];
    const idx = this.percentis.filter(p => valor >= p).length;

    // console.log(valor, idx, paleta[idx], this.percentis);

    return paleta[idx];
  };

  style(dado) {
    return {
      fillColor: this.geraCor(dado.properties.total),
      weight: 2,
      opacity: 1,
      color: '#abb9d1',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
}
