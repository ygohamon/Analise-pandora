import {Component, OnInit, OnDestroy} from '@angular/core';
import { FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaEmpenhoService } from '../../../services/pesquisa/pesquisa.empenho.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-analise-empenhos',
  templateUrl: './empenhos.component.html',
})
export class EmpenhosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso    = false;
  buscaFalha      = false;
  buscaFinalizada = false;
  nProcesso:        string;

  // Resultados da busca
  empenhosMunicipais;
  pagamentosMunicipais;
  empenhosEstaduais;
  pagamentosEstaduais;

  campos = [
    {id: 'fCNPJ', nome: 'CNPJ'},
    {id: 'fCPF',  nome: 'CPF'},
  ];

  // Colunas da tabela de resultado
  dicionarioDadosEmpenhos = {
    anoEmpenho       : {nome: 'Ano'},
    dtEmpenho        : {nome: 'Data Empenho', fn: (x) => this.utils.formataData(x)},
    uGestora         : {nome: 'Unidade Gestora'},
    uOrcamentaria    : {nome: 'Unidade Orçamentária'},
    mdLicitacao      : {nome: 'Modalidade'},
    nuLicitacao      : {nome: 'Número Licitação'},
    clFuncao         : {nome: 'Função'},
    clSubFuncao      : {nome: 'SubFunção'},
    nuEmpenho        : {nome: 'Número Empenho'},
    vlEmpenho        : {nome: 'Valor Empenho', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
  }

  dicionarioDadosExpand = {
    descricao           : {nome: 'Descrição'},
    clFuncao            : {nome: 'Função'},
    clSubFuncao         : {nome: 'SubFunção'},
    clCategoriaEconomica: {nome: 'Categoria Econômica'},
    elDespesa           : {nome: 'Elemento de Despesa'},
    subelDespesa        : {nome: 'SubElemento de Despesa'},
  }

  dicionarioDadosEmpenhosPagamentos = {
    ...this.dicionarioDadosEmpenhos,
    dtPagto : {nome: 'Data Pagamento', fn: (x) => this.utils.formataData(x)},
    vlPago  : {nome: 'Valor Pagamento', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
  }

  dicionarioDadosExpandPagamentos = {
    descricao           : {nome: 'Descrição'},
    clFuncao            : {nome: 'Função'},
    clSubFuncao         : {nome: 'SubFunção'},
    clCategoriaEconomica: {nome: 'Categoria Econômica'},
    elDespesa           : {nome: 'Elemento de Despesa'},
    subelDespesa        : {nome: 'SubElemento de Despesa'},
    fonteRecurso        : {nome: 'Fonte do Recurso'},
    cheque              : {nome: 'Cheque Emitido'},
    agencia             : {nome: 'Agência'},
    numConta            : {nome: 'Número da Conta'},
  }

  constructor(
    public utils: UtilsService,
    private message: MessageService,
    private pesquisa: PesquisaEmpenhoService
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
    this.empenhosEstaduais    = null;
    this.empenhosMunicipais   = null;
    this.pagamentosMunicipais = null;
    this.pagamentosEstaduais  = null;

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

            this.empenhosMunicipais = dados
              .filter((d:any) => d.esfera === 'm' && d.tipo === 'em')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.empenhosEstaduais = dados
              .filter((d:any) => d.esfera === 'e' && d.tipo === 'em')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.pagamentosMunicipais = dados
              .filter((d:any) => d.esfera === 'm' && d.tipo === 'pg')
              .map((d, idx) => Object.assign(d, {id: idx}));

            this.pagamentosEstaduais = dados
              .filter((d:any) => d.esfera === 'e' && d.tipo === 'pg')
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
      return this.pesquisa.pesquisaEmpenhoCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fCPF) {
      return this.pesquisa.pesquisaEmpenhoCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    }
  }

}
