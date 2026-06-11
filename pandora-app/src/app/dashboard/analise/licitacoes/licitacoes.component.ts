import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaLicitacaoService } from '../../../services/pesquisa/pesquisa.licitacao.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-analise-licitacoes',
  templateUrl: './licitacoes.component.html',
})
export class LicitacoesComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso    = false;
  buscaFalha      = false;
  buscaFinalizada = false;
  nProcesso:        string;

  // Resultados da busca
  licitacoesMunicipais;
  licitacoesEstaduais;

  campos = [
    {id: 'fCNPJ', nome: 'CNPJ'},
    {id: 'fCPF',  nome: 'CPF'},
    {id: 'fLicitacao',  nome: 'Dados da Licitação', dica: 'Insira o código da Unidade Gestora, número da licitação e modalidade. Separar com o "|". Ex: 340101 | 70001/2018 | 2' },
  ];

  // Colunas da tabela de resultado

  dicionarioDados = {
    dtAno            : {nome: 'Ano'},
    dtHomologacao    : {nome: 'Data Homologação', fn: (x) => this.utils.formataData(x)},
    uGestora         : {nome: 'Unidade Gestora'},
    nuLicitacao      : {nome: 'Número Licitação'},
    mdLicitacao      : {nome: 'Modalidade'},
    tpObjeto         : {nome: 'Tipo Objeto'},
    vlHomologacao    : {nome: 'Valor Homologação', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
    vlEstimado       : {nome: 'Valor Estimado', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
    vlProposta       : {nome: 'Valor Proposta', fn: (x) => `R$ ${this.utils.converteEmDinheiro(x)}`},
    nuProtocolo      : {nome: 'Número Protocolo'},
    situacaoProposta : {nome: 'Situação Proposta'},
  }

  dicionarioDadosExpand = {
    objeto: {nome: 'Objeto'},
    cdGestora: {nome: 'Código Unidade Gestora'},
    cdMdLicitacao: {nome: 'Código Modalidade da Licitação'},
  }

  constructor(
    public utils: UtilsService,
    private message: MessageService,
    private pesquisa: PesquisaLicitacaoService
  ) {}

  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
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
    this.licitacoesEstaduais  = null;
    this.licitacoesMunicipais = null;

    this.buscaSucesso         = false;
    this.buscaFalha           = false;
    this.buscaFinalizada      = false;
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
            this.licitacoesMunicipais = dados.filter((d:any) => d.esfera === 'm').map((d, idx) => Object.assign(d, {id: idx}));
            this.licitacoesEstaduais = dados.filter((d:any) => d.esfera === 'e').map((d, idx) => Object.assign(d, {id: idx}));

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
      return this.pesquisa.pesquisaLicitacoesCNPJ(this.utils.checaCNPJ(dados.fCNPJ), this.nProcesso);
    } else if (dados.fCPF) {
      return this.pesquisa.pesquisaLicitacoesCPF(this.utils.checaCPF(dados.fCPF), this.nProcesso);
    } else if (dados.fLicitacao) {
      return this.pesquisa.pesquisaLicitacoesDadosLicitacao(dados.fLicitacao, this.nProcesso);
    }
  }

}
