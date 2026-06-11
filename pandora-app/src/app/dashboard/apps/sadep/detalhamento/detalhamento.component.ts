import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { EEXIST } from "constants";
import { MessageService } from "primeng/api";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UtilsService } from "src/app/services/common/utils.service";
import { SadepService } from "../sadep.service";

@Component({
  selector: 'app-detalhamento-sadep',
  templateUrl: 'detalhamento.component.html',
})
export class DetalhamentoComponent implements OnInit, OnChanges, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  @Input() dados;

  nProcesso : string;
  nrCpf     : string;

  mandadoPrisao;
  pessoaObjetoMandado;
  vinculosEmpregaticios;
  enderecosEncontrados;
  geocoordenadasEndereco;
  mapaOverlays;
  mapaOptions;

  dicionarioDadosEnderecos = {
    logradouro : { nome: 'Logradouro' },
    bairro     : { nome: 'Bairro' },
    municipio  : { nome: 'Município' },
    uf         : { nome: 'UF' }
  }

  dicionarioDadosEmpregadores = {
    cnpj           : { nome: 'CNPJ' },
    razaoSocial    : { nome: 'Razão Social' },
    logradouro     : { nome: 'Logradouro' },
    municipio      : { nome: 'Município' },
    uf             : { nome: 'UF' },
    cargo          : { nome: 'Cargo' },
    dtAdmissao     : { nome: 'Data de Admissão' },
    dtDesligamento : { nome: 'Data de Desligamento' }
  }

  constructor(
    private route: ActivatedRoute,
    private sadepService: SadepService,
    private message: MessageService,
    public utils: UtilsService
  ){}

  ngOnInit(): void {
    this.nProcesso = this.utils.getProcesso();

    this.route.queryParams
      .subscribe((params: Params) => {
        this.nrCpf = this.utils.decodificaDado(params['cpf']);

        if (this.utils.validarCPF(this.nrCpf)) {
          // this.itemNFValido = true;

          this.buscaIntegradaSADEP(this.nrCpf);
        } else {
          // this.buscaFalha = true;

          this.message.add(this.utils.mensagemErro('Erro', 'Número de CPF inválido'));
        }
      });
  }

  ngOnDestroy(): void {
    this.dados = {};

    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnChanges(): void {

  }

  buscaIntegradaSADEP(nrCpf: string) {
    this.sadepService.getDetalhamentoParadeiros(nrCpf)
    .pipe(takeUntil(this._destroy$))
    .subscribe(resultado => {
      let { status, msg, dados } = resultado;

      if (status === 'OK') {
        this.dados = dados;

        let tempMandado = this.dados.filter(r => Object.keys(r)[0] === 'sadep');
        this.mandadoPrisao = (tempMandado.length) ? tempMandado[0].sadep[0] : tempMandado;

        let tempVinculosEmpregaticios = this.dados.filter(r => Object.keys(r)[0] === 'empregador');
        this.vinculosEmpregaticios = (tempVinculosEmpregaticios) ? tempVinculosEmpregaticios[0].empregador : tempVinculosEmpregaticios;

        let tempEnderecos = this.dados.filter(r => Object.keys(r)[0] === 'geocoordenadas_endereco');
        this.enderecosEncontrados = (tempEnderecos) ? Object.assign(tempEnderecos.map(enderecos => enderecos.geocoordenadas_endereco.map(e => e.endereco))).shift() : tempEnderecos;

        this.geocoordenadasEndereco = Object.assign(tempEnderecos.map(end => end.geocoordenadas_endereco.map(e => { return {lat: e.lat, lng: e.lng}; }))).shift();
        this.setaGeoCoordenadas();
      }
    });
  }

  setaGeoCoordenadas() {
    this.mapaOptions = {
      center: new google.maps.LatLng(this.geocoordenadasEndereco[0].lat, this.geocoordenadasEndereco[0].lng),
      zoom: 5
    };

    const localizacao = new google.maps.Marker({ title: this.mandadoPrisao.nome });

    this.mapaOverlays = [localizacao].concat(this.geocoordenadasEndereco.map(d => {
      return new google.maps.Marker({
        position: { lat: d.lat, lng: d.lng },
        title: this.enderecosEncontrados.logradouro,
        icon: 'https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_red.png'
      })
    }));
  }
}
