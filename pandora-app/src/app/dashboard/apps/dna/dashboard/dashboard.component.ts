import { Component, OnInit, Input } from '@angular/core';

import {uniq} from 'lodash-es';
import { UtilsService } from 'src/app/services/common/utils.service';

@Component({
  selector: 'app-dna-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  @Input() dados;

  modalidadesBarChartData;
  valoresBarChartData;

  dnaInformacoesEndereco;

  dadosGeoCoordenadas;

  dnaInformacoesTotalEmpenhoMunicipal;
  dnaInformacoesTotalEmpenhoEstadual;

  dnaGraficoModalidadesMunicipal;
  dnaGraficoModalidadesEstadual;

  dnaGraficoValoresMunicipal;
  dnaGraficoValoresEstadual;

  graficoBarrasModalidadesOptions;
  graficoBarrasValoresOptions;

  mapaOptions;
  mapaOverlays;

  constructor(
    public utils: UtilsService
  ) { }

  ngOnInit() {
    this.dadosGeoCoordenadas = this.utils.first(this.utils.first(this.dados.filter(x => Object.keys(x)[0] === 'geocoordenadas'))?.geocoordenadas);

    this.graficoBarrasModalidadesOptions = {
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      },
      legend: {
        position: 'top'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      }
    };

    this.graficoBarrasValoresOptions = JSON.parse(JSON.stringify(this.graficoBarrasModalidadesOptions));
    this.graficoBarrasValoresOptions.tooltips.callbacks = {
      label: (tooltipItem, data) => {
        let label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
                label += ': ';
              }
              label += 'R$ ' + this.utils.converteEmDinheiro(tooltipItem.yLabel);
              return label;
            }
          };


    this.divideDados();
  }

  ngOnDestroy() {
    this.dnaInformacoesEndereco                       = null;

    this.dnaInformacoesTotalEmpenhoMunicipal          = null;
    this.dnaInformacoesTotalEmpenhoEstadual           = null;

    this.dnaGraficoModalidadesMunicipal               = null;
    this.dnaGraficoModalidadesEstadual                = null;

    this.dnaGraficoValoresMunicipal                   = null;
    this.dnaGraficoValoresEstadual                    = null;
  }

  get msgRegistroNaoEncontrado() {
    return this.utils.registroNaoEncontrado;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  divideDados() {

    let temp;

    temp = this.dados.filter(r => Object.keys(r)[0] === 'endereco');
    this.dnaInformacoesEndereco = (temp.length) ? temp[0].endereco[0] : temp;

    temp = this.dados.filter(r => Object.keys(r)[0] === 'totalempenhomunicipal');
    this.dnaInformacoesTotalEmpenhoMunicipal = (temp.length) ? temp[0].totalempenhomunicipal[0] : temp;

    temp = this.dados.filter(r => Object.keys(r)[0] === 'totalempenhoestadual');
    this.dnaInformacoesTotalEmpenhoEstadual = (temp.length) ? temp[0].totalempenhoestadual[0] : temp;

    this.setaGeoCoordenadas();
    this.setaMapaModalidades();
    this.setaMapaValores();
  }

  setaGeoCoordenadas() {

    this.mapaOptions = {
      // center: { lat: this.dadosGeoCoordenadas.lat, lng: this.dadosGeoCoordenadas.lng },
      center: new google.maps.LatLng(this.dadosGeoCoordenadas.lat, this.dadosGeoCoordenadas.lng),
      zoom: 15
    };

    this.mapaOverlays = [
      new google.maps.Marker({
        position: new google.maps.LatLng(this.dadosGeoCoordenadas.lat, this.dadosGeoCoordenadas.lng),
        title: 'Empresa'
      })
    ];
  }

  setaMapaModalidades() {
    let temp = this.dados.filter(r => Object.keys(r)[0] === 'modalidadesmunicipal');
    const modalMunicipal = (temp.length) ? temp[0].modalidadesmunicipal : temp;

    let anos        = uniq(modalMunicipal.map(m => m.dataAno));
    let modalidades = uniq(modalMunicipal.map(m => m.deLicitacao));
    this.dnaGraficoModalidadesMunicipal = {
        labels: anos,
        datasets: modalidades.map((modal, idx) => {
            return {
                label: modal,
                backgroundColor: this.utils.retornaCor(idx),
                borderColor: '#8c8c21',
                data: anos.map(ano => {
                    const value = modalMunicipal.filter(d => d.dataAno === ano && d.deLicitacao === modal);
                    if (value.length) { return value[0].qtd; }
                    else { return 0; }
                })
            };
        })
    };

    temp = this.dados.filter(r => Object.keys(r)[0] === 'modalidadesestadual');
    const modalEstadual = (temp.length) ? temp[0].modalidadesestadual : temp;

    anos        = uniq(modalEstadual.map(m => m.dataAno));
    modalidades = uniq(modalEstadual.map(m => m.deLicitacao));
    this.dnaGraficoModalidadesEstadual = {
        labels: anos,
        datasets: modalidades.map((modal, idx) => {
            return {
                label: modal,
                backgroundColor: this.utils.retornaCor(idx),
                borderColor: '#8c8c21',
                data: anos.map(ano => {
                    const value = modalEstadual.filter(d => d.dataAno === ano && d.deLicitacao === modal);
                    if (value.length) { return value[0].qtd; }
                    else { return 0; }
                })
            };
        })
    };
  }

  setaMapaValores() {
    let temp = this.dados.filter(r => Object.keys(r)[0] === 'valoresmunicipal');
    const valoresMunicipal = (temp.length) ? temp[0].valoresmunicipal : temp;

    let anos        = uniq(valoresMunicipal.map(m => m.dataAno));
    let modalidades = uniq(valoresMunicipal.map(m => m.deLicitacao));
    this.dnaGraficoValoresMunicipal = {
        labels: anos,
        datasets: modalidades.map((modal, idx) => {
            return {
                label: modal,
                backgroundColor: this.utils.retornaCor(idx),
                borderColor: '#8c8c21',
                data: anos.map(ano => {
                    const value = valoresMunicipal.filter(d => d.dataAno === ano && d.deLicitacao === modal);
                    if (value.length) { return value[0].vlPagamento; }
                    else { return 0; }
                })
            };
        })
    };

    temp = this.dados.filter(r => Object.keys(r)[0] === 'valoresestadual');
    const valoresEstadual = (temp.length) ? temp[0].valoresestadual : temp;

    anos          = uniq(valoresEstadual.map(m => m.dataAno));
    modalidades   = uniq(valoresEstadual.map(m => m.deLicitacao));
    this.dnaGraficoValoresEstadual = {
        labels: anos,
        datasets: modalidades.map((modal, idx) => {
            return {
                label: modal,
                backgroundColor: this.utils.retornaCor(idx),
                borderColor: '#8c8c21',
                data: anos.map(ano => {
                    const value = valoresEstadual.filter(d => d.dataAno === ano && d.deLicitacao === modal);
                    if (value.length) { return value[0].vlPagamento; }
                    else { return 0; }
                })
            };
        })
    };
  }


  formataValores(valor) {
    return (valor) ? this.utils.converteEmDinheiro(valor) : this.utils.converteEmDinheiro(0);
  }

  formataQuantidades(qtd) {
    return (qtd) ? qtd : 0;
  }

  formataSimNao(valor){
      return (valor) ? 'Sim' : '';
  }
}
