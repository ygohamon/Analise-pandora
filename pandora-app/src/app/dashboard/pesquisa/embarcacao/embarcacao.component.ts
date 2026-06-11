import { Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaEmbarcacaoService } from 'src/app/services/pesquisa/pesquisa.embarcacao.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-embarcacao',
  templateUrl: './embarcacao.component.html',
})
export class EmbarcacaoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;
  nProcesso:       string;

  // Resultado da consulta
  embarcacoesEncontradas;

  // Colunas da tabela de resultado
  dicionarioDados = {
    embarcacao    : {nome : 'Nome Embarcação'},
    inscricao     : {nome : 'Inscrição'},
    cpfCnpj       : {nome : 'CPF/CNPJ'},
    valor         : {nome : 'Valor'},
    dataAquisicao : {nome : 'Dt Aquisição'},
    dataValidade  : {nome : 'Dt Validade'},
    fonte         : {nome : 'Fonte'}
  }

  dicionarioDadosExpand = {
    cpfCnpj       : {nome: 'CPF/CNPJ'},
    nome          : {nome: 'Nome'},
    tipoPessoa    : {nome: 'Tipo'},
    embarcacao    : {nome: 'Nome Embarcação'},
    inscricao     : {nome: 'Número de Inscrição'},
    dataInscricao : {nome: 'Data de Inscrição'},
    orgaoInscricao: {nome: 'Órgão de Inscrição'},
    cidadeOrgao   : {nome: 'Cidade de Inscrição'},
    situacao      : {nome: 'Situação'},
    anoConstrucao : {nome: 'Ano'},
    constCasco    : {nome: 'Casco'},
    descricao     : {nome: 'Descrição'},
    comprimento   : {nome: 'Comprimento'},
    localAquisicao: {nome: 'Local'},
    valor         : {nome: 'Valor'},
    dataAquisicao : {nome: 'Data de Aquisição'},
    dataValidade  : {nome: 'Data de Validade'},
    fonte         : {nome: 'Fonte'}
  }

  campos = [
    {id: 'fEmbarcacao', nome: 'Embarcação'},
    {id: 'fInscricao',  nome: 'Inscrição'},
    {id: 'fCPF',        nome: 'CPF'},
    {id: 'fCNPJ',       nome: 'CNPJ'},
  ]

  constructor(
    private pesquisa: PesquisaEmbarcacaoService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
  }

  ngOnDestroy() {
    this.resetaComponente();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaComponente() {
    this.buscaSucesso      = false;
    this.buscaFinalizada   = false;

    this.embarcacoesEncontradas = null;
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaComponente();

    const invalido = this.utils.entradaPesquisaInvalida(pesquisaForm.value);
    if (!invalido) {
      this.chamaService(pesquisaForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const {status, msg, dados} = resultado;
          this.buscaFinalizada       = true;

          if (status === 'OK') {
            this.buscaSucesso           = true;
            this.embarcacoesEncontradas = dados.map((d, i) => Object.assign(d, {id: i}));

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

  /**
   *
   * @param dados
   */
  chamaService(dados) {
    if (dados.fEmbarcacao){
      return this.pesquisa.pesquisaEmbarcacaoNome(dados.fEmbarcacao);

    } else if (dados.fInscricao){
      return this.pesquisa.pesquisaEmbarcacaoInscricao(dados.fInscricao);

    } else if (dados.fCPF) {
      return this.pesquisa.pesquisaEmbarcacaoCPF(this.utils.checaCPF(dados.fCPF));

    } else if (dados.fCNPJ) {
      return this.pesquisa.pesquisaEmbarcacaoCNPJ(this.utils.checaCNPJ(dados.fCNPJ));

    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Preencha algum campo.'));
      return null;
    }
  }


}
