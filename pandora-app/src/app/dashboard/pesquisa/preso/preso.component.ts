import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaPresoService } from '../../../services/pesquisa/pesquisa.preso.service';
import { RelatorioPresoSisdepenService } from '../../../services/relatorio/preso.sisdepen/preso.sisdepen.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preso',
  templateUrl: './preso.component.html',
})
export class PresoComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso:    boolean = false;
  buscaFinalizada: boolean = false;

  presosEncontrados = [];

  presosEncontradosSDS;
  presosEncontradosPrisional;
  presosEncontradosSISDEPEN;

  nProcesso: string;
  msgRegistroNaoEncontrado: string;

  buscaSISDEPEN;
  buscaPrisional;
  buscaSDS;

  presoDetalhadoCNC;
  mostrapresoDetalhadoCNC;

  campos = [
    {id: 'fCNC',      nome:  'CNC', dica: 'Cadastro Nacional de Custodiados'},
    {id: 'fCPF',      nome:  'CPF'},
    {id: 'fNome',     nome:  'Nome', dica: 'Insira ao menos 2 nomes.'},
    {id: 'fVulgo',    nome:  'Vulgo/Apelido'},
    {id: 'fNomeMae',  nome:  'Nome da Mãe', dica: 'Insira ao menos 2 nomes.'},
    //{id: 'fFaccao',   nome: 'Facção'},
    //{id: 'fNomePai',  nome:   'Nome do Pai'},
  ];

  // Colunas da tabela de resultado
  dicionarioDadosSDS = {
    nome              : { nome: 'Nome' },
    cpf               : { nome: 'CPF' },
    rg                : { nome: 'RG' },
    principalAtividade: { nome: 'Atividade' },
    vulgo             : { nome: 'Vulgo' },
  }

  dicionarioDadosPRS = {
    nome       : {nome: 'Nome' },
    cpf        : {nome: 'CPF' },
    dataEntrada: {nome: 'Data Entrada' },
    status     : {nome: 'Status' },
    vulgo      : {nome: 'Vulgo' },
  }

  dicionarioDadosDEP = {
    cnc     : {nome: 'CNC' },
    nome    : {nome: 'Nome' },
    cpf     : {nome: 'CPF' },
    vulgo   : {nome: 'Vulgo' },
    cadeia  : {nome: 'Cadeia' },
    situacao: {nome: 'Situação' },
  }

  constructor(
    private router: Router,
    private pesquisa: PesquisaPresoService,
    private relatorio: RelatorioPresoSisdepenService,
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

    this.presosEncontrados          = null;
    this.presosEncontradosSDS       = null;
    this.presosEncontradosPrisional = null;
    this.presosEncontradosSISDEPEN  = null;
    this.presoDetalhadoCNC          = null;
  }

  onPesquisa(pesquisaForm: FormGroup) {
    this.resetaComponente();

    this.chamaService(pesquisaForm.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados}: any = resultado;
        this.buscaFinalizada = true;

        if (status === 'OK') {
          this.buscaSucesso               = true;
          this.presosEncontrados          = dados;

          this.presosEncontradosSDS       = dados.filter(dado => dado.fonte === 'SDS');
          this.presosEncontradosPrisional = dados.filter(dado => dado.fonte === 'PRS');
          this.presosEncontradosSISDEPEN  = dados.filter(dado => dado.fonte === 'DEP');

          this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  chamaService(dados) {
    if (dados.fCPF) {
      this.buscaSDS       = true;
      this.buscaPrisional = true;
      this.buscaSISDEPEN  = true;

      return this.pesquisa.pesquisaPresoCPF(dados.fCPF, this.nProcesso);
    } else if (dados.fNome) {
      this.buscaSDS       = true;
      this.buscaPrisional = true;
      this.buscaSISDEPEN  = true;

      return this.pesquisa.pesquisaPresoNome(dados.fNome, this.nProcesso);
    } else if (dados.fVulgo) {
      this.buscaSDS       = true;
      this.buscaPrisional = true;
      this.buscaSISDEPEN  = true;

      return this.pesquisa.pesquisaPresoVulgo(dados.fVulgo, this.nProcesso);
    } else if (dados.fNomeMae) {
      this.buscaSDS       = true;
      this.buscaPrisional = true;
      this.buscaSISDEPEN  = true;

      return this.pesquisa.pesquisaPresoNomeMae(dados.fNomeMae, this.nProcesso);
    } else if (dados.fCNC) {
      this.buscaSDS       = false;
      this.buscaPrisional = false;
      this.buscaSISDEPEN  = true;

      return this.pesquisa.pesquisaPresoCNC(dados.fCNC, this.nProcesso);
    }
  }

  getDetalhesCNC(cnc) {
    this.pesquisa.pesquisaDetalhadaPresoCNC(cnc, this.nProcesso)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados}: any = resultado;

        if (status === 'OK') {
          this.mostrapresoDetalhadoCNC = true;
          this.presoDetalhadoCNC = dados[0];
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      },
      error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
    });
  }

  geraRelatorioPresoDetalhado() {
    const preso = this.presoDetalhadoCNC;

    const fileName = `Relatório Preso - ${this.utils.formataDado(preso.cnc, '############-##')}.pdf`;
    const grupo = null;
    const url = location.origin + this.router.url;

    this.relatorio.relatorioPresoDetalhadoSisdepen(preso, grupo, fileName, url);
  }
}
