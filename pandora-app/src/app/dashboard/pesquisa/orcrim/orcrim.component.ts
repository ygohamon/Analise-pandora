import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaOrcrimService } from 'src/app/services/pesquisa/pesquisa.orcrim.service';

@Component({
  selector: 'app-orcrim',
  templateUrl: './orcrim.component.html',
})
export class OrcrimComponent implements OnInit, OnDestroy {
  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaSucesso               : boolean = false;
  buscaFinalizada            : boolean = false;
  nProcesso                  : string;

  organizacoesCriminosasList;
  organizacaoSelecionada;

  dadosOrganizacaCriminosa;

  constructor(
    private pesquisa: PesquisaOrcrimService,
    private message: MessageService,
    public utils: UtilsService
  ) {}

  /**
   *
   */
  get isMobile () {
    return this.utils.isMobile();
  }

  /**
   *
   */
  ngOnInit() {
    this.nProcesso = this.utils.getProcesso();
    this.listaOrganizacoesCriminosas();
  }

  /**
   *
   */
  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   *
   */
  resetaBusca() {
    this.buscaFinalizada = false;
    this.buscaSucesso = false;
    this.organizacaoSelecionada = null;
  }

  /**
   * Retorna a lista das Organizações Criminosas(Facções)
   * @returns
   */
  listaOrganizacoesCriminosas() {
    return this.pesquisa.listaOrganizacoesCriminosas(this.nProcesso)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;
        let temp = Object.assign(dados.filter(r => Object.keys(r)[0] === 'hiri'));

        if (status === 'OK') {
          this.organizacoesCriminosasList = temp[0].hiri.map(
            dado => Object.assign({
              value: dado.sigla,
              label: dado.organizacao
            })
          );
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
     });
  }

  /**
   *
   */
  onPesquisarOrganizacao() {
    if (this.organizacaoSelecionada) {
      this.chamaService()
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;
          this.buscaFinalizada = true;

          if (status === 'OK') {
            this.buscaSucesso = true;
            this.dadosOrganizacaCriminosa = dados;

            this.message.add(this.utils.mensagemSucesso('Sucesso', 'Pesquisa concluída com sucesso!'));
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro!'));
        });
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Escolha uma Organização Criminosa!'));
    }
  }

  chamaService() {
    return this.pesquisa.pesquisaOrcrim(this.organizacaoSelecionada, this.nProcesso);
  }
}
