import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { MessageService } from 'primeng/api';

import { PesquisaTCEService } from 'src/app/services/pesquisa/pesquisa.tce.service';

@Component({
  selector: 'app-tce',
  templateUrl: './tce.component.html',
})
export class TCEComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  // Flags
  buscaFinalizada: boolean;
  buscaSucesso:    boolean;
  buscaErro:       boolean;

  tceEncontrados;

  contasBancarias = {
    codigo:         {nome: 'Codigo'},
    descricao:      {nome: 'Descrição'},
    fonte_recurso:  {nome: 'Fonte de recurso'},
  };

  contaBancariaExpand = {
    descricao:              {nome: 'Descrição'},
    banco:                  {nome: 'Banco'},
    agencia:                {nome: 'Agencia'},
    transferencia_banco:    {nome: 'Transferência Banco'},
    transferencia_agencia:  {nome: 'Transferência Agencia'},
    conta_contabil:         {nome: 'Conta Contábil'},
    data_atualizacao:       {nome: 'Ultima Atualização'},
    fonte_recurso:          {nome: 'Fonte do Recurso'},
  };

  empenhos = {
    credor:                         {nome: 'Credor'},
    credor_cnpj_cpf:                {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome:                    {nome: 'Histórico Credor Nome'},
    historico:                      {nome: 'Histórico'},
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  empenhoExpand = {
    credor:                         {nome: 'Credor'},
    credor_cnpj_cpf:                {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome:                    {nome: 'Histórico Credor Nome'},
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    item_despesa:                   {nome: 'Item Despesa'},
    modalidade_licitacao:           {nome: 'Modalidade Licitação'},
    valor:                          {nome: 'Valor'},
    historico:                      {nome: 'Histórico'},
    dotacao:                        {nome: 'Dotação'},
    tipo_credito:                   {nome: 'Tipo de Crédito'},
    registro_cge:                   {nome: 'Registro CGE'},
    ordenador:                      {nome: 'Ordenador'},
    situacao:                       {nome: 'Situação'},
    reserva:                        {nome: 'Reserva'},
    contra_partida:                 {nome: 'Contra Partida'},
    diaria_data_saida:              {nome: 'Saída da Diária'},
    diaria_data_chegada:            {nome: 'Chegada da Diária'},
    diaria_destino:                 {nome: 'Destino da Diária'},
    diaria_matricula:               {nome: 'Matrícula da Diária'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  empenhosAnulados = {
    historico:                      {nome: 'Histórico'},
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  empenhoAnuladoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    empenho_anulado:                {nome: 'Empenho Anulado'},
    valor:                          {nome: 'Valor'},
    historico:                      {nome: 'Histórico'},
    ordenador:                      {nome: 'Ordenador'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  empenhosSuplementos = {
    historico:                      {nome: 'Histórico'},
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  empenhoSuplementoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    empenho_suplementado:           {nome: 'Empenho Suplementado'},
    modalidade_licitacao:           {nome: 'Modalidade Licitacao'},
    valor:                          {nome: 'Valor'},
    historico:                      {nome: 'Histórico'},
    registro_cge:                   {nome: 'Registro CGE'},
    ordenador:                      {nome: 'Ordenador'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  licitacao = {
    descricao:                      {nome: 'Descrição'},
    exercicio:                      {nome: 'Exercício'},
  }

  licitacaoExpand = {
    exercicio:                      {nome: 'Exercício'},
    codigo:                         {nome: 'Código'},
    descricao:                      {nome: 'Descrição'},
    data_insercao:                  {nome: 'Data Inserção'},
  }

  pagamentos = {
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    banco:                          {nome: 'Banco'},
    agencia:                        {nome: 'Agência'},
    conta_bancaria:                 {nome: 'Conta Bancária'},
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  pagamentosAnulados = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoAnuladoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    pagamento:                      {nome: 'Pagamento'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  pagamentosExtras = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoExtraOrcamentarioExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    numero_pagamento_principal:     {nome: 'Número Pagamento Principal'},
    credor:                         {nome: 'Credor'},
    cpf_cnpj_historico:             {nome: 'Historico Credor CPF/CNPJ'},
    nome_credor_historico:          {nome: 'Historico Credor Nome'},
    conta_contabil_despesa:         {nome: 'Conta de Despesa Contabil'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
    inscricao_resto_pagar_fk:       {nome: 'Inscrição Resto Pagar'}
  }

  pagamentosOrcamentarios = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoOrcamentarioExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    banco:                          {nome: 'Banco'},
    agencia:                        {nome: 'Agência'},
    conta_bancaria:                 {nome: 'Conta Bancária'},
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    unidade_gestora_empenho:        {nome: 'Unidade Gestora do Empenho'},
    empenho:                        {nome: 'Empenho'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  pagamentosOrcamentariosAnulados = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoOrcamentarioAnuladoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    pagamento:                      {nome: 'Pagamento'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  pagamentosRestituidos = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoRestituidoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    banco:                          {nome: 'Banco'},
    agencia:                        {nome: 'Agência'},
    conta_bancaria:                 {nome: 'Conta Bancária'},
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
    receita:                        {nome: 'Receita'},
  }

  pagamentosRestos = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoRestoPagarExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    banco:                          {nome: 'Banco'},
    agencia:                        {nome: 'Agência'},
    conta_bancaria:                 {nome: 'Conta Bancaria'},
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  pagamentosRetencoes = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
  }

  pagamentoRetencaoExpand = {
    exercicio:                      {nome: 'Exercício'},
    gestora:                        {nome: 'Gestora'},
    numero:                         {nome: 'Número'},
    valor:                          {nome: 'Valor'},
    banco:                          {nome: 'Banco'},
    agencia:                        {nome: 'Agência'},
    conta_bancaria:                 {nome: 'Conta Bancária'},
    credor:                         {nome: 'Credor'},
    credor_cpf_cnpj_historico:      {nome: 'Histórico Credor CPF/CNPJ'},
    credor_nome_historico:          {nome: 'Histórico Credor Nome'},
    modalidade:                     {nome: 'Modalidade'},
    grupo_financeiro:               {nome: 'Grupo Financeiro'},
    exercicio_pagamento_principal:  {nome: 'Exercício do Pagamento Principal'},
    retencao:                       {nome: 'Retenção'},
    data_inclusao:                  {nome: 'Inclusão'},
    data_processamento:             {nome: 'Processamento'},
  }

  tiposAnalise = [
    {label: 'Contas Bancarias', value: 'tce_conta_bancaria'},
    {label: 'Empenhos', value: 'tce_empenho'},
    {label: 'Empenhos Anulados', value: 'tce_empenho_anulado'},
    {label: 'Empenhos Suplementacão', value: 'tce_empenho_suplementacao'},
    {label: 'Licitações', value: 'tce_licitacao'},
    {label: 'Pagamentos', value: 'tce_pagamento'},
    {label: 'Pagamentos Anulados', value: 'tce_pagamento_anulado'},
    {label: 'Pagamentos Extra Orçamentarios', value: 'tce_pagamento_extra_orcamentario'},
    {label: 'Pagamentos Orçamentários', value: 'tce_pagamento_orcamentario'},
    {label: 'Pagamentos Orçamentários Anulados', value: 'tce_pagamento_orcamentario_anulado'},
    {label: 'Pagamentos Restituídos Receita', value: 'tce_pagamento_restituicao_receita'},
    {label: 'Pagamentos Restantes à Pagar', value: 'tce_pagamento_restos_a_pagar'},
    {label: 'Pagamentos Retidos', value: 'tce_pagamento_retencao'},
  ];

  tipoAnaliseSelecionada = 'tce_conta_bancaria';

  // Dados para consulta
  tipoAnalise;
  dataAnalise: Date[];

  // Locale pro calendário
  pt_br: any;

  constructor(
    public utils: UtilsService,
    private messageService: MessageService,
    private pesquisa: PesquisaTCEService
  ) {}

  ngOnInit() {
    this.pt_br = this.utils.locale_pt_br;
    this.resetaBusca();
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  resetaBusca() {
    this.tceEncontrados = [];
    this.tipoAnalise = null;
    this.buscaFinalizada = false;
  }

  buscar() {
    const selecionado = this.tipoAnaliseSelecionada;

    if (selecionado == 'tce_conta_bancaria') {
      return this.buscaContaBancaria(this.dataAnalise);
    } else if (selecionado == 'tce_empenho') {
      return this.buscaEmpenho(this.dataAnalise);
    } else if (selecionado == 'tce_empenho_anulado') {
      return this.buscaEmpenhoAnulacao(this.dataAnalise);
    } else if (selecionado == 'tce_empenho_suplementacao') {
      return this.buscaEmpenhoSuplementacao(this.dataAnalise);
    } else if (selecionado == 'tce_licitacao') {
      return this.buscaLicitacao(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento') {
      return this.buscaPagamento(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_anulado') {
      return this.buscaPagamentoAnulado(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_extra_orcamentario') {
      return this.buscaPagamentoExtraOrcamentario(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_orcamentario') {
      return this.buscaPagamentoOrcamentario(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_orcamentario_anulado') {
      return this.buscaPagamentoOrcamentarioAnulado(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_restituicao_receita') {
      return this.buscaPagamentoRestituido(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_restos_a_pagar') {
      return this.buscaPagamentoRestosPagar(this.dataAnalise);
    } else if (selecionado == 'tce_pagamento_retencao') {
      return this.buscaPagamentoRetencao(this.dataAnalise);
    } else {
      return null;
    }
  }

  buscaContaBancaria(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_ContaBancaria(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaEmpenho(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Empenho(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaEmpenhoAnulacao(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_EmpenhoAnulado(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaEmpenhoSuplementacao(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_EmpenhoSuplementacao(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaLicitacao(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Licitacao(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamento(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoAnulado(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Anulado(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoExtraOrcamentario(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Extra_Orcamentario(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoOrcamentario(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Orcamentario(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoOrcamentarioAnulado(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Orcamentario_Anulado(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoRestituido(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Restituicao_Receita(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoRestosPagar(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Restos_Pagar(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

  buscaPagamentoRetencao(data) {

    if (this.utils.formataData(data)) {

      var dataFormat = this.utils.formataData(data, 'YYYY-MM-DD');
      this.pesquisa.pesquisaTCE_Pagamento_Retencao(dataFormat)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {

          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;
          if (resultado) {
            this.buscaSucesso = true;
            this.tceEncontrados = dados.map((d, i) => Object.assign(d, {id: i}));;

            this.messageService.add(this.utils.mensagemSucesso('Sucesso', `Consulta para ${this.utils.formataData(dataFormat)} realizada com sucesso!`));
          } else {
            this.messageService.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => this.messageService.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações para análise.')))
    } else {
      this.messageService.add(this.utils.trataErroRequisicao(null, 'Data inválida.'));
    }

  }

}
