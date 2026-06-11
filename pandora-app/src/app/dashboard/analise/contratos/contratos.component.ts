import {Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaContratoService } from 'src/app/services/pesquisa/pesquisa.contratos.service';

@Component({
  selector: 'app-analise-contratos',
  templateUrl: './contratos.component.html',
})
export class ContratosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso    = false;
  buscaFalha      = false;
  buscaFinalizada = false;
  nProcesso:        string;

  // Resultados da busca
  contratosMunicipais;
  contratosEstaduais;

  campos = [
    {id: 'fCNPJ', nome: 'CNPJ'},
    {id: 'fCPF',  nome: 'CPF'},
  ];

  // Colunas da tabela de resultado
  dicionarioDados = {
    uGestora         : {nome: 'Unidade Gestora'},
    mdLicitacao      : {nome: 'Modalidade'},
    nuLicitacao      : {nome: 'Número Licitação'},
    nuContrato       : {nome: 'Número Contrato'},
    nuRegcge         : {nome: 'Número Registro CGE'},

    dtAssinatura     : {nome: 'Data Assinatura', fn: (x) => this.utils.formataData(x)},
    dtPublicacao     : {nome: 'Data Publicação', fn: (x) => this.utils.formataData(x)},
    dtFinalizacao    : {nome: 'Data Finalização', fn: (x) => this.utils.formataData(x)},

    vlContratado     : {nome: 'Vl Contratado', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
    vlProposta       : {nome: 'Vl Proposta', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
  }

  dicionarioDadosExpand = {
    cdGestora       : {nome: 'Código Unidade Gestora'},
    cdMdLicitacao   : {nome: 'Código Modalidade da Licitação'},

    nuProtContrato  : {nome: 'Número Protocolo Contrato'},
    nuProtLicitacao : {nome: 'Número Protocolo Licitação'},
    descricao       : {nome: 'Descrição'}
  }

  constructor(
    public utils: UtilsService,
    private message: MessageService,
    private pesquisa: PesquisaContratoService
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
    this.contratosEstaduais    = null;
    this.contratosMunicipais   = null;

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

            this.contratosMunicipais = dados
              .filter((d:any) => d.esfera === 'm')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.contratosEstaduais = dados
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
      return this.pesquisa.pesquisaContratoCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fCPF) {
      return this.pesquisa.pesquisaContratoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    }
  }

}
