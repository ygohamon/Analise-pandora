import { Component, OnInit, ViewChild } from '@angular/core';
import {FormGroup} from '@angular/forms';

import { MessageService } from 'primeng/api';
import { UtilsService } from '../../../services/common/utils.service';

declare var google: any;

@Component({
  selector: 'app-erbtracker',
  templateUrl: 'erbtracker.component.html',
  styles: [`
      p {
        margin: 0px;
        font-family: monospace;
    }`]
})
export class ERBTrackerComponent implements OnInit {

  /**
   * http://www.movable-type.co.uk/scripts/latlong.html
   *
      06S590222; 34W495664
      06S591120; 34W494620
      07S001400; 34W494100
      07S002700; 34W494981
      07S005900; 34W500430
      07S011310; 34W495110
      07S014710; 34W501104
      07S020840; 34W502490
  *
  */

  @ViewChild('gmap', { static: true }) gmap;

  options: any;
  overlays: any[];
  pontosMedios = [];
  trajetoriaMedia= [];

  escondeInformacao = false;
  mostraMapa = false;

  vazio = '';

  separadores = [
    {label: ',', value: ','},
    {label: ';', value: ';'},
    {label: '|', value: '|'},
  ];
  separadorSelecionado = ';';

  intervalos = [
    {label: '2 s', value: 2000},
    {label: '1 s', value: 1000},
    {label: '3 s', value: 3000},
  ];
  intervaloSelecionado = 2000;

  raioDefault = 2000; // 2km
  thetaDefault = 30; // 30 º
  tempoTransicao = 2000; // 2s

  constructor(public utils: UtilsService,
    private message: MessageService) {}

  ngOnInit() {}

  get isMobile() {
    return this.utils.isMobile();
  }

  /**
   *
   * @param dado
   */
  detectaLatLng(dado: string) {
      // 06S123456
      const padraoTelecom = /(\d{2})([nNsSwWeE])(\d{2})(\d{4})/g;
      let decimal = 0;

      const r = padraoTelecom.exec(dado);
      if (!!r) {

        // Latitude
        if (r[2].toUpperCase() === 'S' || r[2].toUpperCase() === 'N'){
          decimal = parseFloat(r[1]) + parseFloat(r[3]) / 60 + parseFloat(r[4]) / 360000;
          decimal = (r[2].toUpperCase() === 'S') ? decimal * -1 : decimal;

        } else if (r[2].toUpperCase() === 'W' || r[2].toUpperCase() === 'E') { // Longitude
          decimal = parseFloat(r[1]) + parseFloat(r[3]) / 60 + parseFloat(r[4]) / 360000;
          decimal = (r[2].toUpperCase() === 'W') ? decimal * -1 : decimal;

        } else {
          decimal = null;
        }
      } else {

        decimal = parseFloat(dado);
      }

      return decimal;
  }

  /**
   *
   * @param ponto
   */
  pontoValido(ponto) {
    if (!!ponto.lat && !!ponto.lng) { return true; }
    return false;
  }

  /**
   *
   * @param valor
   */
  paraRadianos(valor) {
    return Number(valor) * Math.PI / 180;
  }

  /**
   *
   * @param valor
   */
  paraGraus(valor) {
    return Number(valor) * 180 / Math.PI;
  }

  /**
   *
   * @param ponto
   * @param azimute
   * @param r
   */
  calculaPontoDestino(ponto, azimute, r = null) {
    const raioTerra = 6371e3;
    let distAngular = (r) ? r : ponto.r;
    distAngular = distAngular / raioTerra;

    azimute = this.paraRadianos(azimute);

    const latInicial = this.paraRadianos(ponto.lat);
    const lngInicial = this.paraRadianos(ponto.lng);

    const latFinal = Math.asin( Math.sin(latInicial) * Math.cos(distAngular) +
            Math.cos(lngInicial) * Math.sin(distAngular) * Math.cos(azimute));
    const lngFinal = lngInicial + Math.atan2( Math.sin(azimute) * Math.sin(distAngular) * Math.cos(latInicial),
                                              Math.cos(distAngular) - Math.sin(latInicial) * Math.sin(latFinal) );

    return {
      lat: this.paraGraus(latFinal),
      lng: this.paraGraus(lngFinal)
    };
  }

  geraMarcador(ponto, title) {
    return new google.maps.Marker({
      position: { lat: ponto.lat, lng: ponto.lng},
      title: title,
    });
  }

  /**
   *
   * @param ponto
   */
  geraPontosCone(ponto) {
    let pontos = [];
    for (let azi = ponto.azi - ponto.theta ; azi < ponto.azi + ponto.theta ; azi++) {
      pontos = pontos.concat(this.calculaPontoDestino(ponto, azi));
    }
    return pontos;
  }

  /**
   *
   * @param ponto
   */
  geraPoligono(ponto) {
    const pontos = this.geraPontosCone(ponto);
    const pontosPoligono = [{lat: ponto.lat, lng: ponto.lng}].concat(pontos);

    this.pontosMedios.push(this.calculaPontoDestino(ponto, ponto.azi, ponto.r / 2));

    return new google.maps.Polygon({
      paths: pontosPoligono,
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#1976D2',
      fillOpacity: 0.35
    });
  }

  /**
   *
   * @param ponto
   */
  geraCirculo(ponto) {

    this.pontosMedios.push({lat: ponto.lat, lng: ponto.lng});

    return new google.maps.Circle({
      center: {lat: ponto.lat, lng: ponto.lng},
      radius: ponto.r,
      fillColor: '#1976D2',
      fillOpacity: 0.35,
      strokeWeight: 1,
    });
  }

  /**
   *
   */
  geraTrajetoriaMedia() {

    const trajeto = new google.maps.Polyline({
      path: [
          {lat: this.pontosMedios[0].lat, lng: this.pontosMedios[0].lng},
          {lat: this.pontosMedios[1].lat, lng: this.pontosMedios[1].lng},
      ],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    this.pontosMedios.shift();

    return trajeto;
  }

  /**
   *
   * @param ponto
   */
  calculaPontos(ponto) {
    let objetos = (ponto.azi !== null) ? [this.geraPoligono(ponto)] : [this.geraCirculo(ponto)];

    if (this.pontosMedios.length > 1) {
      objetos = objetos.concat(this.geraTrajetoriaMedia());
    }

    return objetos;
  }

  /**
   *
   * @param ponto
   * @param i
   */
  addPonto(ponto, i) {
    setTimeout(() => {
      this.overlays = (!this.overlays) ? this.calculaPontos(ponto) : this.overlays.concat(this.calculaPontos(ponto));
    }, this.intervaloSelecionado * i);
  }

  /**
   *
   * @param pontos
   */
  runPontos(pontos) {
    pontos.forEach((ponto, i, array) => {
      this.addPonto(ponto, i);
    });
  }

  /**
   *
   * @param parametros
   */
  onClick(parametros) {
    const param = parametros.value;
    this.overlays = [];
    this.trajetoriaMedia = [];
    this.pontosMedios = [];
    this.escondeInformacao = true;

    let pontos = param.split('\n').map(linha => {
        const ponto = linha.split(this.separadorSelecionado);
        return {
          lat:    (ponto[0]) ? this.detectaLatLng(ponto[0].trim()) : null,
          lng:    (ponto[1]) ? this.detectaLatLng(ponto[1].trim()) : null,
          r:      (ponto[2]) ? Number(ponto[2].trim()) : this.raioDefault,
          azi:    (ponto[3]) ? Number(ponto[3].trim()) : null,
          theta:  (ponto[4]) ? Number(ponto[4].trim()) : this.thetaDefault,
        };
    });
    pontos = pontos.filter(ponto => this.pontoValido(ponto));

    if (pontos.length) {
      this.options = {
            center: {lat: pontos[0].lat, lng: pontos[0].lng},
            zoom: 12
      };
      this.mostraMapa = true;

      this.runPontos(pontos);
    }
  }

  /**
   *
   * @param event
   */
  handleOverlayClick(event) {
    this.message.add(this.utils.mensagemInfo('', 'Área selecionada'));
  }

  /**
   *
   */
  resetaBusca() {
    this.mostraMapa = false;
  }
}
