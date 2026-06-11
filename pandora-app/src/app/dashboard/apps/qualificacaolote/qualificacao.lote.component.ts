import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { sortBy } from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaPessoaService } from 'src/app/services/pesquisa/pesquisa.pessoa.service';
import { RelatorioService } from 'src/app/services/relatorio/relatorio.service';
import { PesquisaEmpresaService } from 'src/app/services/pesquisa/pesquisa.empresa.service';
import { MessageService } from 'primeng/api';
import { ExportService } from 'src/app/services/common/export.service';
import { QualificacaoService } from 'src/app/services/common/qualificacao.service';

@Component({
  selector: 'app-qualificacao-lote',
  templateUrl: 'qualificacao.lote.component.html',
})
export class QualificacaoLoteComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  // Campo textarea que contem os dados de cpfs e cnpjs a serem buscados
  campoTexto: string;
  dadosEncontrados: any[];
  dadosMontados = [];

  scrollOptions = { autoHide: true };

  constructor(
    private pesquisaPessoa: PesquisaPessoaService,
    private pesquisaEmpresa: PesquisaEmpresaService,
    private relatorio: RelatorioService,
    private message: MessageService,
    private exporta: ExportService,
    public utils: UtilsService,
    public qualificacao: QualificacaoService,
  ) {}

  ngOnInit() {
    this.reset();
    this.campoTexto = '';
  }

  ngOnDestroy() {
    this.resetAll();

    this._destroy$.next();
    this._destroy$.complete();
  }

  reset() {
    this.dadosMontados = [];
    this.dadosEncontrados = [];
  }

  resetAll() {
    this.reset();
    this.campoTexto = '';
  }

  exportDocx() {
    const filename = 'qualificacoes.docx';

    const dadosExportacao = this.dadosMontados.map(d => {
      return {
        destaque: d.nome,
        texto: this.qualificacao.getTemplatePessoa(d),
      }
    })

    this.exporta.exportDocx(dadosExportacao, filename);
  }

  loop(dado: string, lista_restante) {
    console.log('Processando:', dado, ' restantes: ', lista_restante);

    if (this.utils.checaCPF(dado)) {
      this.buscaQualificacaoCPF(this.utils.checaCPF(dado), lista_restante);
    } else if (this.utils.checaRG(dado)) {
      this.buscaQualificacaoRG(this.utils.checaRG(dado), lista_restante);
    } else if (!!dado) {
      this.message.add(this.utils.mensagemWarning('Atenção', `Dado inválido. - ${dado}`));
      this.loop(lista_restante.shift(), lista_restante);
    } else {
      console.log('Caiu')
    }
  }

  onClick() {
    this.reset();

    let lista = this.campoTexto.split('\n').join('|').split(',').join('|').split('|');
    lista = lista.filter(d => !!d?.length);

    this.loop(lista.shift(), lista);
  }

  buscaQualificacaoCPF(cpf: string, lista_restante) {
    if (!cpf) return null;

    this.pesquisaPessoa.pesquisaQualificacaoCPF(cpf, null)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, dados, msg} = resultado;

        if (status === 'OK') {
          const merged          = Object.assign.apply(Object, dados);
          this.dadosEncontrados = merged;
          this.processaPessoa(this.dadosEncontrados);

          if(lista_restante.length) {
            this.loop(lista_restante.shift(), lista_restante);
          } else {
            // this.message.add(this.utils.mensagemSucesso('Sucesso', `Relatório gerado para ${this.utils.formataDado(cpf, '###.###.###-##')}`));
          }
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  buscaQualificacaoRG(rg: string, lista_restante) {
    if (!rg) return null;

    this.pesquisaPessoa.pesquisaQualificacaoRG(rg, null)
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, dados, msg} = resultado;

        if (status === 'OK') {
          const merged          = Object.assign.apply(Object, dados);
          this.dadosEncontrados = merged;
          this.processaPessoa(this.dadosEncontrados);

          if(lista_restante.length) {
            this.loop(lista_restante.shift(), lista_restante);
          } else {
            // this.message.add(this.utils.mensagemSucesso('Sucesso', `Relatório gerado para ${this.utils.formataDado(cpf, '###.###.###-##')}`));
          }
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      });
  }

  adicionaPessoa(pessoa) {
    this.dadosMontados.push(pessoa);
  }

  processaPessoa(dadosEncontrados) {
    if (!dadosEncontrados.pessoa) return null;

    const pessoaResultado = this.qualificacao.processaPessoa(dadosEncontrados);
    this.adicionaPessoa(pessoaResultado);
  }
}
