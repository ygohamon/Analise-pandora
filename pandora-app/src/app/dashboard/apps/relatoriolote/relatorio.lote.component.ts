import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {uniq, startCase} from 'lodash-es';

import { UtilsService } from '../../../services/common/utils.service';
import { PesquisaPessoaService } from 'src/app/services/pesquisa/pesquisa.pessoa.service';
import { RelatorioService } from 'src/app/services/relatorio/relatorio.service';
import { PesquisaEmpresaService } from 'src/app/services/pesquisa/pesquisa.empresa.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-relatorio-lote',
  templateUrl: 'relatorio.lote.component.html'
})
export class RelatorioLoteComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  dadosEncontrados;
  categoriasEncontradas;
  dadosPessoaAgrupado;

  // Campo textarea que contem os dados de cpfs e cnpjs a serem buscados
  campoTexto = '';

  constructor(
    private router: Router,
    private pesquisaPessoa: PesquisaPessoaService,
    private pesquisaEmpresa: PesquisaEmpresaService,
    private relatorio: RelatorioService,
    private message: MessageService,
    private utils: UtilsService
  ) {}

  ngOnInit() {}

  reset() {
    this.dadosEncontrados = null;
    this.categoriasEncontradas = null;
    this.dadosPessoaAgrupado = null;
  }

  loop(dado: string, lista_restante) {

    this.reset();

    if (this.utils.checaCPF(dado)) {
      this.buscaIntegradaCPF(this.utils.checaCPF(dado), lista_restante);
    } else if (this.utils.checaCNPJ(dado)) {
      this.buscaIntegradaCNPJ(this.utils.checaCNPJ(dado), lista_restante);
    } else {
      this.message.add(this.utils.mensagemWarning('Atenção', `Dado inválido. - ${dado}`));
      this.loop(lista_restante.shift(), lista_restante);
    }
  }

  onClick() {
    const lista = this.campoTexto.split('\n').join('|').split(',').join('|').split('|');
    this.loop(lista.shift(), lista);
  }

  /**
   *  Insere dados novos aos dados existentes
   *
   * @param colecaoNova
   */
   appendDados(colecaoNova) {
    let dadosExistentes = this.dadosEncontrados;

    if (!dadosExistentes) {
      dadosExistentes = colecaoNova;
    } else {
      const categoriasColecaoNova = Object.keys(colecaoNova);

      categoriasColecaoNova.forEach(categoriaColecaoNova => {
        if (categoriaColecaoNova in dadosExistentes) {
          dadosExistentes[categoriaColecaoNova] = dadosExistentes[categoriaColecaoNova].concat(colecaoNova[categoriaColecaoNova])
        } else {
          dadosExistentes[categoriaColecaoNova] = colecaoNova[categoriaColecaoNova]
        }
      })
    }

    this.adicionaIndices(dadosExistentes);

    this.dadosEncontrados = Object.assign({}, dadosExistentes);
    this.categoriasEncontradas = Object.keys(dadosExistentes);
  }

  buscaIntegradaCPF(cpf: string, lista_restante) {

    forkJoin([
      this.pesquisaPessoa.pesquisaIntegradaCPF(cpf, null, 'local'),
      this.pesquisaPessoa.pesquisaIntegradaCPF(cpf, null, 'externo', {crawlers: 'false'})
    ])
      .subscribe(resultado => {
        const resultadoLocal   = resultado[0];
        const resultadoExterno = resultado[1];

        if (resultadoLocal?.status === 'OK' || resultadoExterno?.status === 'OK') {

          // Adiciona dados das bases locais
          const colecaoLocal = Object.assign.apply(Object, resultadoLocal?.dados);
          this.appendDados(colecaoLocal);
          this.agrupaDadosPessoa();

          // Adiciona dados das bases externas
          const colecaoExterna = Object.assign.apply(Object, resultadoExterno?.dados);
          this.appendDados(colecaoExterna);
          this.agrupaDadosPessoa();

          const nome = this.geraNome(this.dadosEncontrados);
          this.gerarPDFCompletoCPF(nome, cpf, false);

          this.message.add(this.utils.mensagemSucesso('Sucesso', `Relatório gerado para ${this.utils.formataDado(cpf, '###.###.###-##')}`));

          if(lista_restante.length) {
            this.loop(lista_restante.shift(), lista_restante);
          }
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, resultadoLocal?.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      })
  }

  geraNome(dadosEncontrados){
    let pessoa_rf = dadosEncontrados.pessoa.filter(p => p.fonte.startsWith('RF') || p.fonte.startsWith('CTX'));

    let nome = '';
    if (pessoa_rf.length > 0) {
      const nomes = this.utils.first(pessoa_rf)?.nome?.split(' ');
      nome = startCase(`${this.utils.first(nomes)} ${this.utils.last(nomes)}`.toLowerCase());
    }

    return nome;
  }

  adicionaIndices(dadosEncontrados) {
    return Object.keys(dadosEncontrados).reduce((acc, categoria) => {
      acc[categoria] = dadosEncontrados[categoria].map((dado, i) => {
        dado['index'] = i;
        return dado;
      });
      return acc;
    }, {});
  }

  agrupaDadosPessoa() {
    const dadosPessoa = this.dadosEncontrados.pessoa;
    const atributosValidosEncontrados = dadosPessoa.map(registro => {
        const atributos = Object.keys(registro);
        return atributos.filter(atributo => (registro[atributo]) ? true : false)
    });
    const flatAtributos = [].concat.apply([], atributosValidosEncontrados);
    const atributosUnicos = uniq(flatAtributos);

    const dadosAgrupados = {};

    atributosUnicos.forEach(atributo => {
          const registroAtributos = dadosPessoa.reduce((acc, registro) => {
            if (registro[atributo]) {
                return acc.concat(registro[atributo]);
            } else {
                return acc;
            }
        }, []);
        dadosAgrupados[atributo] = uniq(registroAtributos);
    });
    this.dadosPessoaAgrupado = dadosAgrupados;
    if (this.categoriasEncontradas.indexOf('foto') !== -1){
        this.dadosPessoaAgrupado.foto = [this.dadosEncontrados.foto[0].img];
    }
  }

  gerarPDFCompletoCPF(nome, cpf, grupo: boolean = false) {
    const fileName = `Relatório Completo - ${nome} - ${cpf}.pdf`;

    const clone_dadosPessoaAgrupado = JSON.parse(JSON.stringify(this.dadosPessoaAgrupado));
    const clone_dadosEncontrados = JSON.parse(JSON.stringify(this.dadosEncontrados));

    const url = location.origin;

    this.relatorio.relatorioIntegradoCompletoPessoa(clone_dadosPessoaAgrupado, clone_dadosEncontrados, grupo, fileName, url);
  }


  buscaIntegradaCNPJ(cnpj: string, lista_restante) {

    forkJoin([
      this.pesquisaEmpresa.pesquisaIntegradaCNPJ(cnpj, null, 'local'),
      this.pesquisaEmpresa.pesquisaIntegradaCNPJ(cnpj, null, 'externo', {crawlers: 'false'})
    ])
      .subscribe(resultado => {
        const resultadoLocal   = resultado[0];
        const resultadoExterno = resultado[1];

        if (resultadoLocal?.status === 'OK' || resultadoExterno?.status === 'OK') {

          // Adiciona dados das bases locais
          const colecaoLocal = Object.assign.apply(Object, resultadoLocal?.dados);
          this.appendDados(colecaoLocal);

          // Adiciona dados das bases externas
          const colecaoExterna = Object.assign.apply(Object, resultadoExterno?.dados);
          this.appendDados(colecaoExterna);

          const razaosocial = this.getRazaoSocial(this.dadosEncontrados);
          this.gerarPDFCompletoCNPJ(cnpj, razaosocial, false);

          this.message.add(this.utils.mensagemSucesso('Sucesso', `Relatório gerado para ${this.utils.formataDado(cnpj, '##.###.###/####-##')}`))

          if(lista_restante.length) {
            this.loop(lista_restante.shift(), lista_restante);
          }
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, resultadoLocal?.msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar o registro.'));
      })
  }

  gerarPDFCompletoCNPJ(cnpj, razaosocial, grupo: boolean = false) {
      const fileName = `Relatório Completo - ${razaosocial} - ${cnpj}.pdf`;

      const url = location.origin;

      this.relatorio.relatorioIntegradoCompletoEmpresa(JSON.parse(JSON.stringify(this.dadosEncontrados)), grupo, fileName, url);
  }

  getRazaoSocial(dadosEncontrados){
    let empresa_rf = dadosEncontrados.empresa.filter(p => p.fonte.startsWith('RF') || p.fonte.startsWith('CTX'));

    let razaosocial = '';
    if (empresa_rf.length > 0) {
      const nomes = this.utils.first(empresa_rf)?.razaoSocial?.split(' ');
      razaosocial = startCase(`${this.utils.first(nomes)} ${this.utils.last(nomes)}`.toLowerCase());
    }

    return razaosocial;
  }

}
