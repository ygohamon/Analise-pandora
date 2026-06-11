import {Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaAditivoService } from '../../../services/pesquisa/pesquisa.aditivos.service';

@Component({
  selector: 'app-analise-aditivos',
  templateUrl: './aditivos.component.html',
})
export class AditivosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso    = false;
  buscaFalha      = false;
  buscaFinalizada = false;
  nProcesso:        string;

  // Resultados da busca
  aditivosMunicipais;
  aditivosEstaduais;

  campos = [
    {id: 'fCNPJ', nome: 'CNPJ'},
    {id: 'fCPF',  nome: 'CPF'},
  ];

  // Colunas da tabela de resultado
  dicionarioDados = {
    uGestora         : {nome: 'Unidade Gestora'},
    mdLicitacao      : {nome: 'Modalidade'},
    nuLicitacao      : {nome: 'N. Licitação'},
    tpAditivo        : {nome: 'Tipo Aditivo'},
    nuContrato       : {nome: 'N. Contrato'},

    dtAssinatura     : {nome: 'Data Assinatura', fn: (x) => this.utils.formataData(x)},
    dtPublicacao     : {nome: 'Data Publicação', fn: (x) => this.utils.formataData(x)},
    dtVigencia       : {nome: 'Data Vigência', fn: (x) => this.utils.formataData(x)},

    vlAditivo        : {nome: 'Vl Aditivo', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`, dica: 'Valor do Aditivo'},
    vlContrato       : {nome: 'Vl Contrato', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`, dica: 'Valor do Contrato'},
    vlHomologado     : {nome: 'Vl Homologado', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`, dica: 'Valor Homologado'},
    vlProposta       : {nome: 'Vl Proposta', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`, dica: 'Valor da Proposta'},
    acrescimo        : {nome: 'Acréscimo', fn: (x) => `${this.utils.round(100*x)}%`, dica: 'Acréscimo do aditivo em relação ao valor de contrato'},
  }

  dicionarioDadosExpand = {
    cdGestora       : {nome: 'Código Unidade Gestora'},
    cdMdLicitacao   : {nome: 'Código Modalidade da Licitação'},
    nuProtAditivo   : {nome: 'Número Protocolo Aditivo'},
    nuProtContrato  : {nome: 'Número Protocolo Contrato'},
    nuProtLicitacao : {nome: 'Número Protocolo Licitação'},
    justificativa   : {nome: 'Justificativa'}
  }

  constructor(
    public utils: UtilsService,
    private message: MessageService,
    private pesquisa: PesquisaAditivoService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaBusca () {
    this.aditivosEstaduais    = null;
    this.aditivosMunicipais   = null;

    this.buscaSucesso         = false;
    this.buscaFalha           = false;
    this.buscaFinalizada      = false;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaBusca();

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaService(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, dados, msg} = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;

            this.aditivosMunicipais = dados
              .filter((d:any) => d.esfera === 'm')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.aditivosEstaduais = dados
              .filter((d:any) => d.esfera === 'e')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        },
        error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
        });
    } else {
      this.message.add(invalido[0]);
    }
  }

  chamaService(dados) {
    if (dados.fCNPJ) {
      return this.pesquisa.pesquisaAditivoCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fCPF) {
      return this.pesquisa.pesquisaAditivoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    }
  }

}
