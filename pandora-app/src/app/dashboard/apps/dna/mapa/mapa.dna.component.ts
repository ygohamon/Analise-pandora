import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { latLng, tileLayer, geoJSON, Layer, Map, point, Browser, Control, DomUtil, marker, icon } from 'leaflet';

import { UtilsService } from './../../../../services/common/utils.service';
import { GeoJSONService } from 'src/app/services/common/geojson.service';

@Component({
  selector: 'app-mapa-dna',
  template: `
    <div style="height: 480px;"
        leaflet
        (leafletMapReady)="onMapReady($event)"
        [leafletLayers]="layers"
        [leafletOptions]="options">
    </div>
  `
})
export class MapaDNAComponent implements OnInit, OnDestroy {

  painelInformacao;
  painelLegenda;
  options;
  layers;

  mapa;
  geoJSON;
  fronteiraUf;

  valores;
  geoEmpresa;

  @Input() dados;
  @Input() uf: string;

  constructor(
    public utils: UtilsService,
    public geo: GeoJSONService,
  ) {}

  ngOnInit() {
    this.valores    = this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'valoresmunicipio'))?.valoresmunicipio;
    this.geoEmpresa = this.utils.first(this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'geocoordenadas'))?.geocoordenadas);

    this.criaTelaInfo();
    this.criaLegenda();

    this.uf = 'PB';

    this.options = {
      layers: [
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      ],
    };

    this.geo.getGeoJSON(this.uf.toLowerCase()).subscribe(dado => {
      this.geoJSON = dado;
      this.criaMapa();
    })
  }

  ngOnDestroy() {
    this.fronteiraUf = null;
    this.mapa = null;
  }

  criaMapa() {
    this.fronteiraUf = geoJSON(this.insereDadosJson(this.geoJSON, this.valores), { style: this.style, onEachFeature: this.onEachFeature});
    this.layers = [this.fronteiraUf, this.retornaMarker()];

    this.mapa.fitBounds(this.fronteiraUf.getBounds(), { animate: true })
  }

  criaTelaInfo() {
    this.painelInformacao = new Control({'position': 'topright'});

    const converteEmDinheiro = this.utils.converteEmDinheiro;

    this.painelInformacao.update = function (properties) {
      this._div.innerHTML = '<h4>Empenhos pagos</h4>';

      if (properties && properties.qtd) {
        this._div.innerHTML += `<b>${properties.name}</b>
        <br/>
        Quantidade: ${properties.qtd}
        <br/>
        Empenhado: R$ ${ converteEmDinheiro(properties.vlEmpenho)}
        <br/>
        Pago: R$${converteEmDinheiro(properties.vlPagamento)}`;
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

  criaLegenda() {
    this.painelLegenda = new Control({'position': 'bottomright'});

    const geraCor = this.geraCor;
    const converteEmDinheiro = this.utils.converteEmDinheiro;

    this.painelLegenda.onAdd = function (map) {
      this._div = DomUtil.create('div', 'info legenda');

      const escala = [0, 10 * 1000, 50 * 1000, 100 * 1000, 5 * 100 * 1000, 1000 * 1000, 5 * 1000 * 1000, 50 * 1000 * 1000];
      let from, to, labels = [];

      for (let i = 0; i < escala.length; i++) {
        from = escala[i];
        to   = escala[i + 1];

        labels.push('<i style="background:' + geraCor(from + 1) + '"></i> ' + converteEmDinheiro(from) + (to ? '&ndash;' + converteEmDinheiro(to) : '+'));
      }

      this._div.innerHTML = labels.join('<br>');
      return this._div;
    };
  }

  retornaMarker() {
    return marker([this.geoEmpresa.lat, this.geoEmpresa.lng], {
      icon: icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    });
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

    const zoomToFeature = (e) => {
      this.mapa.fitBounds(e.target.getBounds());
    };

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  insereDadosJson(geojson, dadosMunicipio) {
    geojson.features = geojson.features.map(municipio => {
      const m = dadosMunicipio?.filter(dado => dado.cdIbge === municipio.properties.id
                                    || dado.municipio?.toUpperCase() === municipio.properties.name?.toUpperCase()) || [];

      if (m.length > 0) {
          const municipioEncontrado        = m[0];
          municipio.properties.qtd         = municipioEncontrado.qtd;
          municipio.properties.vlEmpenho   = municipioEncontrado.vlEmpenho;
          municipio.properties.vlPagamento = municipioEncontrado.vlPagamento;
        }
        return municipio;
      });
      return geojson;
    }

    onMapReady(map: Map) {
      this.mapa = map;

      this.painelInformacao.addTo(this.mapa);
      this.painelLegenda.addTo(this.mapa);
    }

    geraCor(d){
      //if (d > 100*1000*1000 )     { return '#440014'; }
      //else if (d > 50*1000*1000)  { return '#800026'; }
      if (d > 5 * 1000 * 1000)        { return '#BD0026'; }
      else if (d > 1000 * 1000)     { return '#E31A1C'; }
      else if (d > 5 * 100 * 1000)    { return '#FC4E2A'; }
      else if (d > 100 * 1000)      { return '#FD8D3C'; }
      else if (d > 50 * 1000)       { return '#FEB24C'; }
      else if (d > 10 * 1000)       { return '#FED976'; }
      else if (d > 0)             { return '#FFEDA0'; }
      else                        { return '#FCF9EA'; }
    };

    style(dado) {

      const geraCor = (d) => {
        if (d > 5 * 1000 * 1000)        { return '#BD0026'; }
        else if (d > 1000 * 1000)     { return '#E31A1C'; }
        else if (d > 5 * 100 * 1000)    { return '#FC4E2A'; }
        else if (d > 100 * 1000)      { return '#FD8D3C'; }
        else if (d > 50 * 1000)       { return '#FEB24C'; }
        else if (d > 10 * 1000)       { return '#FED976'; }
        else if (d > 0)             { return '#FFEDA0'; }
        else                        { return '#FCF9EA'; }
      };

      return {
        fillColor: geraCor(dado.properties.vlPagamento),
        weight: 2,
        opacity: 1,
        color: '#abb9d1',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }

  }
