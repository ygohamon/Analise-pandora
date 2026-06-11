import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FileUploader, FileSelectDirective } from 'ng2-file-upload';
import { FileUploaderCustom } from '../../../shared/fileuploader.class';

import { UtilsService } from '../../../services/common/utils.service';
import {UsuarioService} from '../../../services/usuario/usuario.service';
import {AuthService} from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { PesquisaMiscService } from '../../../services/pesquisa/pesquisa.misc.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-integra',
  templateUrl: 'integra.component.html',
  styleUrls: ['integra.component.css']
})
export class IntegraComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  URL = environment.API_URL + '/integra';
  uploader: FileUploaderCustom = new FileUploaderCustom({
                                              url: this.URL,
                                              authToken: 'Bearer ' + this.auth.getToken() });
  detalhesResumoDosFatos:   string = '';
  detalhesFatoresAdversos:  string = '';
  detalhesFinalidade:       string = '';
  config;

  campos = [
    {id: 'fCPF',            nome: 'CPF'},
    {id: 'fCNPJ',           nome: 'CNPJ'},
  ];

  info;
  infoFinalizado = false;

  referencias = [
    {label: 'Processo',     value: 'processo'},
    {label: 'Procedimento', value: 'procedimento'},
    {label: 'PIC',          value: 'pic'}
  ];
  referenciaSelecionada = 'processo';

  areas = [
    {label: 'Penal',  value: 'penal'},
    {label: 'Cível',  value: 'cível'},
  ];
  areaSelecionada = 'penal';

  grupos = [
    {label: 'Patrimônio',             value: 'patrimonio'},
    {label: 'Terceiro Setor',         value: 'terceiroSetor'},
    {label: 'Cidadão',                value: 'cidadao'},
    {label: 'Meio Ambiente',          value: 'meioAmbiente'},
    {label: 'Idoso',                  value: 'idoso'},
    {label: 'Infância e Juventude',   value: 'infanciaJuventude'},
    {label: 'Educação',               value: 'educacao'},
    {label: 'Consumidor',             value: 'consumidor'},
    {label: 'Saúde',                  value: 'saude'},
  ];
  grupoSelecionado = 'patrimonio';

  tempoInfoUtil = [
    {label: '10 dias',  value: '10'},
    {label: '15 dias',  value: '15'},
    {label: '30 dias',  value: '30'},
  ];
  tempoInfoUtilSelecionado = '15';

  mostraFormularioPF:      boolean;
  mostraFormularioPJ:      boolean;
  mostraFormularioImovel:  boolean;
  mostraFormularioVeiculo: boolean;

  listaPF       = [];
  listaPJ       = [];
  listaImovel   = [];
  listaVeiculo  = [];

  isMobile: boolean;

  promotoria: any;
  promotoriasEncontradas: any;

  constructor(private router:   Router,
              private auth:     AuthService,
              private pesquisa: PesquisaMiscService,
              private usuario:  UsuarioService,
              private message:  MessageService,
              public  utils:    UtilsService) {}

  ngOnInit() {
    this.mostraFormularioPF      = false;
    this.mostraFormularioPJ      = false;
    this.mostraFormularioImovel  = false;
    this.mostraFormularioVeiculo = false;

    this.isMobile                = this.utils.isMobile();


    this.getInfoUsuario();
  }

  /**
   *
   * @param event
   */
  buscaPromotoria(event) {
    const promotoriaParcial = event.query;

    this.pesquisa.pesquisaPromotoriasMPPB(promotoriaParcial)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.promotoriasEncontradas = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
    });
  }

  getInfoUsuario() {

    this.usuario.getInfoUsuario()
    .subscribe(resultado => {
      const {status, msg, dados} = resultado;
      this.infoFinalizado = true;

      if (status === 'OK') {
        this.info = dados[0];
      } else {
        this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
      }
    }, error => {
      this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações do usuário.'));
    });
  }

  onSubmit(integraForm) {
    if (this.promotoria) {
      integraForm.value.nome         = this.info.nome;
      integraForm.value.email        = this.info.email;
      integraForm.value.idPromotoria = this.promotoria.id;

      integraForm.value.detalhesResumoDosFatos  = this.detalhesResumoDosFatos;
      integraForm.value.detalhesFatoresAdversos = this.detalhesFatoresAdversos;
      integraForm.value.detalhesFinalidade      = this.detalhesFinalidade;

      integraForm.value.listaPF       = JSON.stringify(this.listaPF, null, 2);
      integraForm.value.listaPJ       = JSON.stringify(this.listaPJ, null, 2);
      integraForm.value.listaImovel   = JSON.stringify(this.listaImovel, null, 2);
      integraForm.value.listaVeiculo  = JSON.stringify(this.listaVeiculo, null, 2);

      this.uploader.onBuildItemForm = (item, form) => {
        Object.keys(integraForm.value).forEach(atr => {
          form.append(atr, integraForm.value[atr]);
        });
      };

      this.uploader.onBeforeUploadItem = (item) => {
        item.withCredentials = false;
      };

      const cabecalho = this.auth.criaCabecalhoSeguranca(null);
      this.uploader.options.headers = [
        { name: 'hs', value: cabecalho.headers.get('hs') }
      ];

      this.uploader.uploadAllFiles();

      this.message.add(this.utils.mensagemSucesso('Sucesso', 'Sua requisição foi enviada.'));
    }
  }

  formularioPF() {
    this.mostraFormularioPF = true;
  }
  adicionarPF(pf) {
    this.mostraFormularioPF = false;
    pf.value.cpf = pf.value.cpf.replace(/[^0-9]/g, '').slice(0, 11);

    this.listaPF.push(pf.value);
  }
  removePF(i: number) {
    this.listaPF = this.listaPF.filter((el, index) => index !== i);
  }

  formularioPJ() {
    this.mostraFormularioPJ = true;
  }
  adicionarPJ(pj) {
    this.mostraFormularioPJ = false;
    pj.value.cnpj = pj.value.cnpj.replace(/[^0-9]/g, '').slice(0, 14);

    this.listaPJ.push(pj.value);
  }
  removePJ(i: number) {
    this.listaPJ = this.listaPJ.filter((el, index) => index !== i);
  }

  formularioImovel() {
    this.mostraFormularioImovel = true;
  }
  adicionarImovel(imovel) {
    this.mostraFormularioImovel = false;
    this.listaImovel.push(imovel.value);
  }
  removeImovel(i: number) {
    this.listaImovel = this.listaImovel.filter((el, index) => index !== i);
  }

  formularioVeiculo() {
    this.mostraFormularioVeiculo = true;
  }
  adicionarVeiculo(veiculo) {
    this.mostraFormularioVeiculo = false;
    veiculo.value.cpf = veiculo.value.cpf.replace(/[^0-9]/g, '').slice(0, 11);

    this.listaVeiculo.push(veiculo.value);
  }
  removeVeiculo(i: number) {
    this.listaVeiculo = this.listaVeiculo.filter((el, index) => index !== i);
  }
}
