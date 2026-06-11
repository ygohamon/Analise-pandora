import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { SistemaService } from './../../../../services/sistema/sistema.service';
import { UtilsService } from '../../../../services/common/utils.service';

@Component({
  selector: 'app-sistema-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['../estatisticas.component.css']
})
export class SistemaRankingsComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  periodosAnalise = [
    {periodo: '-1', descricao: 'Desde início'},
    {periodo: '30', descricao: 'Últimos 30 dias'},
    {periodo: '7',  descricao: 'Últimos 7 dias'},
  ]
  dadosPeriodo = {};
  dadosParametro = {};

  dicionarioDados = {
    usuario: {nome: 'Usuário' },
    qtd    : {nome: 'QTD' },
  }

  usuariosQuePesquisaram;
  recursoGeralSelecionado;
  mostraTelaDetalhes;

  constructor(
    public utils: UtilsService,
    private sistema: SistemaService,
    private message: MessageService,
  ) { }

  ngOnInit() {
    this.mostraTelaDetalhes = false;

    this.requisicaoPeriodo(null, '100');
    this.requisicaoPeriodo('30', '100');
    this.requisicaoPeriodo('7', '100');

    this.requisicaoParametro(null, '100', 'cpf');
    this.requisicaoParametro(null, '100', 'cnpj');
    this.requisicaoParametro(null, '100', 'geral');
  }

  ngOnDestroy() {
    this.usuariosQuePesquisaram = null;
    this.recursoGeralSelecionado = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  requisicaoPeriodo(periodoBusca, top) {
    this.sistema.getRanking('uso', periodoBusca, top, null)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          if (!periodoBusca) {periodoBusca = '-1'}
          this.dadosPeriodo[periodoBusca] = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  requisicaoParametro(periodoBusca, top, parametro) {
    this.sistema.getRanking('pesquisa', periodoBusca, top, parametro)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {

        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.dadosParametro[parametro] = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  requisicaoUsuariosQuePesquisaram(duracao, chave, valor) {
    this.sistema.getUsuariosQuePesquisaramValores(duracao, chave, valor)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.usuariosQuePesquisaram = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }

      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os recursos do sistema.'));
      });
  }

  onRowSelect(event) {
    this.mostraTelaDetalhes = true;
    this.recursoGeralSelecionado = event.data;

    this.requisicaoUsuariosQuePesquisaram(null, this.recursoGeralSelecionado.chave, this.recursoGeralSelecionado.valor);
  }
}
