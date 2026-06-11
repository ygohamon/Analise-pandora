import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {sortBy, uniqBy, clone } from 'lodash-es';
import * as FileSaver from 'file-saver';

import * as cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import cxtmenu from 'cytoscape-cxtmenu';
import nodeHtmlLabel from 'cytoscape-node-html-label';

cytoscape.use(cola);
cytoscape.use(cxtmenu);
if (typeof cytoscape('core', 'nodeHtmlLabel') !== 'function') {
  cytoscape.use(nodeHtmlLabel);
}

import { MessageService } from 'primeng/api';


import { RelatorioRelacionamentosService } from '../../../services/relacionamentos/relatorio.relacionamentos.service';
import { RelacionamentosService } from '../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../services/common/utils.service';
import { DialogPainelBuscasComponent } from './painel/painelbuscas.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

interface Grafo {
  nodes: any[],
  edges: any[]
}

@Component({
  selector: 'app-relacionamentos',
  templateUrl: './relacionamentos.component.html',
  styleUrls: ['./relacionamentos.component.css']
})
export class RelacionamentosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  // Booleans
  buscaRelacionamentosFinalizada: boolean = false;
  buscaRelacionamentosSucesso:    boolean = false;
  buscaRelacionamentosErro:       boolean = false;

  grafoColorido: boolean = false;

  // O tipo de busca inicial
  tipoBusca: string = 'completa';

  // Grafo
  grafo;

  // Campo textarea que contem os dados de cpfs e cnpjs a serem buscados
  campoTexto = '';

  // Ponteiro para o objeto Cytoscape
  cy;

  // Ponteiro para o objeto Menu
  menu;

  // Flag para barra de configuracoes
  escondeConfig: boolean = false;

  // Comprimento das arestas do grafo
  comprimentoArestas: number;

  // Espaçamento dos nós do grafo
  espacamentoNos: number;

  // Alvos contém aqueles explicitamente buscados, usuario fornece o dado
  // Pesquisados são aqueles que foram buscados por expansao dos nós
  idAlvos;
  idExpandidos;

  // Layout
  layout;
  layoutParams;
  layoutSelecionado;

  // Entidade selecionada
  entidade = null;
  entidadeSelecionada = null;

  // Filtro para entidades
  entidadesPermitidas;

  //
  nodesSalvos;
  edgesSalvos;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private relatorio: RelatorioRelacionamentosService,
    private message: MessageService,
    private dialogService: DialogService,
    private relacionamentos: RelacionamentosService
  ) {}

  ngOnInit() {
    this.resetaBusca();
  }

  ngOnDestroy() {
    this.resetaBusca();

    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaBusca() {
    // this.grafo        = null;
    // this.layoutParams = null;
    // this.cy           = null;
    // this.layout       = null;
    // this.menu         = null;
    // this.idAlvos      = null;
    // this.idExpandidos = null;

    this.grafo = [];
    this.idAlvos = [];
    this.idExpandidos = [];
    this.nodesSalvos = [];
    this.edgesSalvos = [];
    this.entidadesPermitidas = ['pessoa', 'empresa', 'telefone', 'endereco', 'orgaopublico'];
    this.layoutSelecionado = 'cola';
    this.grafoColorido = true;
    this.layoutParams = this.relacionamentos.getLayoutParam(this.layoutSelecionado);

    this.buscaRelacionamentosFinalizada = false;
    this.buscaRelacionamentosSucesso    = false;
    this.buscaRelacionamentosErro       = false;
    this.buscaRelacionamentosSucesso    = false;
  }

  /**
   * Métodos de inicialização
   */

   /**
   *  Inicializa o <div> do grafo.
   */
  inicializaCytoscape() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      style: this.relacionamentos.getStyleCytoscape(),
      // minZoom: 0.1,
      // maxZoom: 2,
      // hideEdgesOnViewport: true,
      // zoom: 0.5,
    });

    this.inicializaLabel();
    this.inicializaMenu();
  }

  inicializaLabel() {
    this.cy.nodeHtmlLabel(this.relacionamentos.getHtmlStyle());
  }

  inicializaMenu() {
    this.menuPessoa();
    this.menuEmpresa();
    this.menuTelefone();
    this.menuEndereco();
    // this.menuOrgao();
  }

  /**
   * Métodos para manipular o layout
  */

  criaLayout(params, extra = {}) {
    const _params = Object.assign(params, extra);

    this.layout = this.cy.layout(_params);
  }

  trocaLayout() {

    this.atualizaLayout();
    this.executaLayout();
  }

  /**
   * Atualiza o layout com os parametros setados em layoutSelecionado
   */
  atualizaLayout(extra = {}) {
    const params = this.relacionamentos.getLayoutParam(this.layoutSelecionado);

    if (this.layoutSelecionado === 'breadthfirst') {
      const tmp = {roots: this.idAlvos};
      extra = Object.assign(extra, tmp);
    }

    this.criaLayout(params, extra);
  }

  executaLayout() {
    this.layout.run();
  }

  paraLayout() {
    this.layout.stop();
  }

  zeraGrafo() {
    this.cy.elements().remove();
  }

  atualizaElementosGrafo() {

    // Limpa grafo atual
    this.zeraGrafo();

    const grafo = this.getGrafo();
    // const grafoFiltrado = this.filtraEntidadeGrafo(grafo);
    const cytoGraph = this.toCytoscape(grafo);

    const elementos = cytoGraph.nodes.concat(cytoGraph.edges);

    // Adiciona elementos ao grafo
    this.cy.add(elementos);

    // this.calculaMetricas();
    this.atualizaNodes();
  }

  filtraDadosValidos(): string[] {
    // Aceita separacao por virgulas ou por linha
    const cpfsValidos = this.campoTexto
      .split('\n').join('|').split(',').join('|').split('|')
      .map(d => this.utils.checaCPF(d)).filter(d => d !== null).map(d => d.trim());

    const cnpjsValidos = this.campoTexto
      .split('\n').join('|').split(',').join('|').split('|')
      .map(d => this.utils.checaCNPJ(d)).filter(d => d !== null).map(d => d.trim());

    return this.utils.unique((cpfsValidos.concat(cnpjsValidos)));
  }

  trataConsultaEntidadeErro(err) {
    this.message.add(this.utils.trataErroRequisicao(err, 'Ocorreu um erro ao buscar as informações de relacionamento.'));
  }

  adicionaAlvos(novosAlvos: string[]): string[] {
    const _novosAlvos = novosAlvos.map(n => n.trim());

    this.idAlvos = this.utils.unique(this.idAlvos.concat(_novosAlvos));
    return this.idAlvos;
  }

  adicionaExpandidos(novos: string[]): string[] {
    const _flat = [].concat.apply([], novos);
    const _novos = _flat.map(n => n.trim());

    this.idExpandidos = this.utils.unique(this.idExpandidos.concat(_novos));
    return this.idExpandidos;
  }

  adicionaGrafo(grafo: Grafo): Grafo {
    this.nodesSalvos = this.nodesSalvos.concat(grafo.nodes);
    this.edgesSalvos = this.edgesSalvos.concat(grafo.edges);

    return this.getGrafo();
  }

  getGrafo(): Grafo {
    return {
      nodes: this.nodesSalvos,
      edges: this.edgesSalvos
    }
  }

  removeNode(id: string) {
    // Remove nó
    this.nodesSalvos = this.nodesSalvos.filter(n => n.id !== id);
    // Remove as arestas que ligam até aquele nó
    this.edgesSalvos = this.edgesSalvos.filter(e => e.origem !== id && e.destino !== id);

    // Esconde o label HTML e remove o node do grafo
    this.cy.$id(id).data('hide', true)
    this.cy.$id(id).remove();
  }

  apagaEntidadesNaoPermitidas() {
    this.cy.nodes().forEach(n => {
      if (this.entidadesPermitidas.includes(n.data('entidade'))) {
        n.data('hide', false);
        n.removeClass('hide');
      } else {
        n.data('hide', true);
        n.addClass('hide');
      }
    })
  }

  toggleGrafoColorido() {
    this.cy.nodes().forEach(n => {
      if (this.grafoColorido) {
        n.data('colorido', true);
      } else {
        n.data('colorido', false);
      }
    })
  }

  removeNodesSelecionados() {
    this.cy.nodes(':selected').forEach(n => {
      this.removeNode(n.id());
    });
  }

  /**
   * Primeira requisicao feita ao servidor contendo em 'campoTexto' uma lista de CPFs e CNPJs
   */
  onClick() {
    const alvos = this.filtraDadosValidos();

    if (alvos.length > 0) {
      this.relacionamentos.getRelacionamentosLista(alvos, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;
          this.buscaRelacionamentosFinalizada = true;

          if (status === 'OK') {
            this.buscaRelacionamentosSucesso = true;
            this.buscaRelacionamentosErro    = false;

            const grafoBusca: any = dados;

            this.adicionaGrafo(grafoBusca);
            this.adicionaAlvos(alvos);

            setTimeout(() => {
              this.inicializaCytoscape();
              this.atualizaElementosGrafo();
              this.atualizaLayout();
              this.executaLayout();
            }, 10);

          } else {
            this.buscaRelacionamentosSucesso = false;
            if (status !== 'ENOTFOUND') { this.buscaRelacionamentosErro = true; }

            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, err => {
          if (status !== 'ENOTFOUND') { this.buscaRelacionamentosErro = true; }

          this.message.add(this.utils.trataErroRequisicao(err, 'Ocorreu um erro ao buscar as informações de relacionamento.'));
        });
    } else {
      this.message.add(this.utils.trataErroRequisicao(null, 'Dados de busca inválidos.'));
    }
  }

  consultaEntidade(res, idalvo, alvo=false) {
    const { status, msg, dados } = res;

    if (status === 'OK') {
      const grafoBusca = dados;
      // this.adicionaAlvos(idalvo)
      this.adicionaExpandidos([idalvo]);
      this.adicionaGrafo(grafoBusca);

      this.atualizaElementosGrafo();
      this.atualizaLayout();
      this.executaLayout();
    } else {
      this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
    }
  }


  painelBuscas() {
    const ref = this.dialogService.open(DialogPainelBuscasComponent, {
      header: 'Busca'
    });

    ref.onClose.subscribe((resultado: {recurso: string, dado: string}) => {
      if (resultado) {
          if (resultado.recurso === 'pessoa') {
            this.relacionamentos.getRelacionamentosPessoa(resultado.dado, 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => {
                this.adicionaAlvos([this.utils.checaCPF(resultado.dado)]);
                this.consultaEntidade(r, resultado.dado);

              }, this.trataConsultaEntidadeErro.bind(this));

          } else if (resultado.recurso === 'empresa') {
            this.relacionamentos.getRelacionamentosEmpresa(resultado.dado, 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => {
                this.adicionaAlvos([this.utils.checaCNPJ(resultado.dado)]);
                this.consultaEntidade(r, resultado.dado);

              }, this.trataConsultaEntidadeErro.bind(this));
          } else if (resultado.recurso === 'telefone') {
            this.relacionamentos.getRelacionamentosTelefone(resultado.dado, 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => {
                this.adicionaAlvos([resultado.dado]);
                this.consultaEntidade(r, resultado.dado);

              }, this.trataConsultaEntidadeErro.bind(this));
          }
      }
    });
  }

  menuPessoa() {
    const commandsGeral = [
      {
        content: '<span class="pi pi-users"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'parentesco')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-phone"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'telefones')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-road"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'enderecos')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-university"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'empresasresponsavel')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-sitemap"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'empresassocio')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-globe"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'completa')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.consultaEntidade(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-times"></span>',
        select: (n) => this.removeNode(n.data('id'))
      },
    ];

    const relatorio = [
      {
        content: '<span class="fa fa-file-pdf-o"></span>',
        select: (n) => {
          this.downloadRelatorio(n);
        },
      }
    ];

    const comRelatorio = {
      selector: 'node[entidade="pessoa"][?alvo]',
      commands: commandsGeral.concat(relatorio)
    };

    const semRelatorio = {
      selector: 'node[entidade="pessoa"][^alvo]',
      commands: commandsGeral
    };

    this.cy.cxtmenu(comRelatorio);
    this.cy.cxtmenu(semRelatorio);
  }

  menuEmpresa() {
    const opt = {
      selector: 'node[entidade="empresa"]',
      commands: [
        {
          content: '<span class="pi pi-users"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'socios')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-user"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'responsavel')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="fa fa-phone"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'telefones')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="fa fa-road"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'enderecos')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => this.removeNode(n.data('id'))
        },
      ]
    };

    this.cy.cxtmenu(opt);
  }

  menuTelefone() {
    const opt = {
      selector: 'node[entidade="telefone"]',
      commands: [
        {
          content: '<span title="Parentesco" class="pi pi-users"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosTelefone(n.data('telefone'), 'proprietarios')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosTelefone(n.data('telefone'), 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => this.removeNode(n.data('id'))
        },
      ]
    };

    this.cy.cxtmenu(opt);
  }

  menuEndereco() {
    const opt = {
      selector: 'node[entidade="endereco"]',
      commands: [
        {
          content: '<span title="Pessoas" class="pi pi-users"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEndereco(n.data('logradouro'), n.data('numero'), n.data('municipio'), 'pessoas')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('logradouro') + '-' + n.data('numero')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEndereco(n.data('logradouro'), n.data('numero'), n.data('municipio'), 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('logradouro') + '-' + n.data('numero')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => this.removeNode(n.data('id'))
        },
      ]
    };

    this.cy.cxtmenu(opt);
  }

  menuOrgao() {
    const opt = {
      selector: 'node[entidade="orgaopublico"]',
      commands: [
        {
          content: '<span title="Parentesco" class="pi pi-users"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosTelefone(n.data('telefone'), 'proprietarios')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosOrgaoPublico(n.data('id'), null, null, 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.consultaEntidade(r, n.data('id')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => this.removeNode(n.data('id'))
        },
      ]
    };

    this.cy.cxtmenu(opt);
  }

  /**
   * Remove as entidades filtradas do Grafo
   */
  filtraEntidadeGrafo(grafo: Grafo): Grafo {

    let entidadesRemovidas = [];

    // Remove entidades não permitidas
    const nodes = grafo.nodes.filter(n => {
      // Verifica se a entidade é permitida ou não
      if (!this.entidadesPermitidas.includes(n.entidade)) {
        entidadesRemovidas.push(n.id);
        return false;
      } else {
        return true;
      }
    })

    // Remove edges que ligavam as entidades não permitidas
    const edges = grafo.edges.filter(e => !(entidadesRemovidas.includes(e.origem) || entidadesRemovidas.includes(e.destino)))

    return {nodes, edges};
  }

  toCytoscape(grafo: Grafo) {

    // Gera os nodes no formato do Cytoscape
    const nodes = grafo.nodes.map(n => {
      const node: any = {};

      node.data  = n;
      node.group = 'nodes';
      node.data.label = this.relacionamentos.getNodeLabel(n);

      return node;
    });

    // Gera os edges no formato do Cytoscape
    const edges = grafo.edges.map(e => {
        const edge: any = {data: {}};

        const {id, origem, destino, relacao, ...resto} = e;

        edge.group        = 'edges';
        edge.data.source  = e.origem;
        edge.data.target  = e.destino;
        edge.data.relacao = e.relacao;
        edge.data.id      = (e.id) ? e.id : e.origem + '-' + e.destino;

        // Preenche o edge com os dados restantes
        Object.keys(resto).forEach(v => {
          edge.data[v] = resto[v];
        });

        return edge;
    });

    return {nodes, edges}
  }


  /**
   * Realiza uma iteracao sobre todos os nodes e realiza operações em cima deles
   */
  atualizaNodes() {
    this.cy.nodes().forEach((node) => {
      // Se esse nó estiver na lista de alvos
      if (this.idAlvos.includes(node.data('id'))) {
        node.data('alvo', true);
      }
      // Se esse nó estiver na lista de expandidos
      if (this.idExpandidos.includes(node.data('id'))) {
        node.data('pesquisado', true);
      }

      // Esconde o nó
      if (this.entidadesPermitidas.includes(node.data('entidade'))) {
        node.data('hide', false);
        node.removeClass('hide');
      } else {
        node.data('hide', true);
        node.addClass('hide');
      }

      // Pinta os nós se essa opção estiver habilitada
      if (this.grafoColorido) {
        node.data('colorido', true);
      } else {
        node.data('colorido', false);
      }


      // Só adiciona nos novatos
      // if (node.data('eventos')) {
        const data = node.data();

        node.data('eventos', true);

        node.on('select',   () => { this.entidadeSelecionada = data.entidade; this.entidade = data; } );
        node.on('unselect', () => { this.entidadeSelecionada = null; this.entidade = null; });
        node.on('mouseover',() => this.onMouseOverNode(node));
        node.on('mouseout', () => this.onMouseOutNode(node));
      // }
    });
  }

  /**
   *
   */
  calculaMetricas() {
    const f_pg = this.cy.elements().pageRank();

    this.cy.nodes().forEach((n) => {
        const id = n.data('id');

        // Calcula as metricas
        const pageRank = f_pg.rank(this.cy.$id(`${id}`));
        const degreeCentrality = this.cy.elements().dc({ root: this.cy.$id(`${id}`) }).degree;
        const closenessCentrality = this.cy.elements().cc({ root: this.cy.$id(`${id}`) });

        console.log(`${id} - pr: ${pageRank} - dc: ${degreeCentrality} - cc: ${closenessCentrality}`);

        // Insere no grafo do Cytoscape
        n.data('pageRank', pageRank);
        n.data('degreeCentrality', degreeCentrality);
        n.data('closenessCentrality', closenessCentrality);
    });
  }

  onMouseOverNode(node) {
    node.outgoers().edges().forEach(edge => edge.data('mostra', true));
  }

  onMouseOutNode(node) {
    node.outgoers().edges().forEach(edge => edge.data('mostra', false));
  }

  toggleBarraConfig() {
    this.escondeConfig = !this.escondeConfig;
    this.cy.resize();
  }


  downloadRelatorio(local) {
    const nodes = (local) ? this.cy.nodes(':selected') : this.cy.nodes('node[?alvo]');
    // if (!nodes) { nodes = this.cy.nodes('node[?alvo]'); }

    const lista = nodes.map(node => {
      const alvo = node.data();

      // Aqueles que o alvo se relaciona
      const vinculos = node.outgoers('node').map(n => n.data()).map(d => {
        const vinculo = node.edgesTo(this.cy.$id(`${d.id}`)).data();
        const res = clone(d);

        res.relacao = vinculo.relacao;

        if (res.entidade === 'orgaopublico') { res.pOcorrencia = vinculo.pOcorrencia; res.uOcorrencia = vinculo.uOcorrencia; }
        return res;
      });

      return {alvo, vinculos};
    });

    const l = sortBy(lista, d => d.alvo.entidade);
    const fileName = `Relatório Relacionamentos.pdf`;
    const url = location.origin + this.router.url;

    this.relatorio.relatorioRelacionamento(l, null, fileName, url);
  }

  downloadImagem() {
    const blob = this.cy.png({ output: 'blob', full: true });
    FileSaver.saveAs(blob, 'grafo_relacionamentos.png');
  }

  downloadJson() {
    const json = JSON.stringify(this.cy.json());
    const blob = new Blob([json], { type: 'application/json' });
    FileSaver.saveAs(blob, 'grafo_relacionamentos.json');
  }

  onTrocaSliderComprimentoArestas(event) {
    const comprimentoAresta = event.value;
    const parametrosCOLA = {
      edgeLength: comprimentoAresta,
    };

    this.paraLayout();
    this.atualizaLayout(parametrosCOLA);
    this.executaLayout();
  }

  onTrocaSliderEspacamentoNos(event) {
    const espacamentoNos = event.value;
    const parametrosCOLA = {
      nodeSpacing: espacamentoNos,
    };

    this.paraLayout();
    this.atualizaLayout(parametrosCOLA);
    this.executaLayout();
  }

  expandirNodes() {
    const nodes        = this.cy.nodes('node[!alvo]').map(n => n.data('id'));
    const cpfsValidos  = nodes.map(d => this.utils.checaCPF(d)).filter(d => d !== null).map(d => d.trim());
    const cnpjsValidos = nodes.map(d => this.utils.checaCNPJ(d)).filter(d => d !== null).map(d => d.trim());
    const lista        = cpfsValidos.concat(cnpjsValidos);

    if (nodes.length > 0) {
      this.relacionamentos.getRelacionamentosLista(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(r => this.consultaEntidade(r, lista), this.trataConsultaEntidadeErro.bind(this));
    }
  }

  expandirNodesTelefone() {
    const nodes = this.cy.nodes('node[!alvo][entidade="telefone"]').map(n => n.data('id'));
    const lista = nodes.join(',');

    if (nodes.length > 0) {
      this.relacionamentos.getRelacionamentosTelefone(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(r => this.consultaEntidade(r, lista.split(',')), this.trataConsultaEntidadeErro.bind(this));
    }
  }

  expandirNodesPJ() {
    const nodes = this.cy.nodes('node[!alvo][entidade="empresa"]').map(n => n.data('id'));
    const cnpjsValidos = nodes.map(d => this.utils.checaCNPJ(d)).filter(d => d !== null).map(d => d.trim());
    const lista = cnpjsValidos;

    if (nodes.length > 0) {
      this.relacionamentos.getRelacionamentosLista(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(r => this.consultaEntidade(r, lista), this.trataConsultaEntidadeErro.bind(this));
    }
  }

  expandirNodesPF() {
    const nodes = this.cy.nodes('node[!alvo][entidade="pessoa"]').map(n => n.data('id'));
    const cpfsValidos = nodes.map(d => this.utils.checaCPF(d)).filter(d => d !== null).map(d => d.trim());
    const lista = cpfsValidos;

    if (nodes.length > 0) {
      this.relacionamentos.getRelacionamentosLista(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(r => this.consultaEntidade(r, lista), this.trataConsultaEntidadeErro.bind(this));
    }
  }

  encontraCaminho() {
    const nodes = this.cy.nodes('node:selected').map(n => n.data('id'));

    if (nodes.length === 2) {
      const origem = this.cy.$id(`${nodes[0]}`);
      const destino = this.cy.$id(`${nodes[1]}`);

      const aStar = this.cy.elements().aStar({ root: origem, goal: destino });
      if (aStar.found) {
        const path = [];

        aStar.path.forEach(el => {
          const dados = el.data();
          if (el.isNode()) { path.push(dados.id); }
          else if (el.isEdge()) { path.push(dados.relacao); }
        });

        console.log(path);

        const pathCorrigido = [path[0]];
        for (let i = 0 ; i < path.length - 2 ; i += 2 ) {
          pathCorrigido.push(path[i + 2]);
          pathCorrigido.push(path[i + 1]);
        }

        console.log(pathCorrigido);
      }
    }
  }
}
