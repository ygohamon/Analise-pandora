import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import {FormGroup} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { sortBy, uniqBy } from 'lodash-es';
import * as FileSaver from 'file-saver';

import * as cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import cxtmenu from 'cytoscape-cxtmenu';
// import popper from 'cytoscape-popper';
// import tippy from 'tippy.js';

cytoscape.use(cola);
cytoscape.use(cxtmenu);
// cytoscape.use(popper);

import { MessageService } from 'primeng/api';

import { RelatorioRelacionamentosService } from '../../../services/relacionamentos/relatorio.relacionamentos.service';
import { RelacionamentosService } from '../../../services/relacionamentos/relacionamentos.service';
import { UtilsService } from '../../../services/common/utils.service';
import { CacaFantasmasService } from '../../../services/cacafantasmas/cacafantasmas.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-analise-ciclos',
  templateUrl: './analise.ciclos.component.html',
  styleUrls: ['./analise.ciclos.component.css']
})
export class AnaliseCiclosComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  // Autocomplete
  orgao: any;
  orgaosEncontrados: any;

  // Booleans
  buscaRelacionamentosFinalizada: boolean = false;
  buscaRelacionamentosSucesso:    boolean = false;
  buscaRelacionamentosErro:       boolean = false;

  // O tipo de busca inicial
  tipoBusca: string = 'completa';

  // Objeto contendo os parametros do Cytoscape
  layoutParams;

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

  // Lista de todos os alvos já buscados
  idAlvos = [];

  // Layout
  layout;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private relatorio: RelatorioRelacionamentosService,
    private cacafantasmas: CacaFantasmasService,
    private message: MessageService,
    private relacionamentos: RelacionamentosService
  ) {}

  ngOnInit() {
    this.grafo = [];
    this.layoutParams = this.relacionamentos.getLayoutParam();
  }

  ngOnDestroy() {
    this.grafo        = null;
    this.layoutParams = null;
    this.cy           = null;
    this.layout       = null;
    this.menu         = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   *
   */
  onClick() {
    // Aceita separacao por virgulas ou por linha
    const cpfsValidos = this.campoTexto.split('\n').join('|').split(',').join('|').split('|')
                            .map(d => this.utils.checaCPF(d)).filter(d => d !== null).map(d => d.trim());
    const cnpjsValidos = this.campoTexto.split('\n').join('|').split(',').join('|').split('|')
                            .map(d => this.utils.checaCNPJ(d)).filter(d => d !== null).map(d => d.trim());
    this.idAlvos = this.idAlvos.concat(cpfsValidos.concat(cnpjsValidos));

    const lista = cpfsValidos.concat(cnpjsValidos);

    if (lista.length > 0) {

      this.relacionamentos.getRelacionamentosLista(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;
          this.buscaRelacionamentosFinalizada = true;

          if (status === 'OK') {
            this.buscaRelacionamentosSucesso = true;
            this.buscaRelacionamentosErro    = false;

            const grafoBusca: any = dados;
            grafoBusca.nodes = grafoBusca.nodes.map(n => {
              if (cpfsValidos.indexOf(n.id) !== -1 || cnpjsValidos.indexOf(n.id) !== -1) { n.alvo = true; }
              return n;
            });

            setTimeout(() => {
              this.inicializaCytoscape();
              this.adicionaElementosAoGrafo(grafoBusca);
              this.inicializaLayout();
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

  buscaOrgao(event) {
    const orgaoParcial = event.query;

    this.cacafantasmas.pesquisaOrgaoSagresMunicipal(orgaoParcial)
      .subscribe(resultado => {
        const { status, msg, dados } = resultado;

        if (status === 'OK') {
          this.orgaosEncontrados = dados;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      });
  }

  onGerarAnalise() {
    if (this.orgao) {

      let dtinicio;
      let dtfim;

      // if (this.intervaloAnalise) {
      //   dtinicio = format(this.intervaloAnalise[0], 'YYYYMMDD');
      //   dtfim = format(this.intervaloAnalise[1], 'YYYYMMDD');
      // }

      this.relacionamentos.getRelacionamentosOrgaoPublico(this.orgao.cdUgestora, dtinicio, dtfim, 'completa')
        .subscribe(resultado => {
          const { status, msg, dados } = resultado;
          this.buscaRelacionamentosFinalizada = true;

          if (status === 'OK') {
            this.buscaRelacionamentosSucesso = true;
            this.buscaRelacionamentosErro = false;

            const grafoBusca: any = dados;

            setTimeout(() => {
              this.inicializaCytoscape();
              this.adicionaElementosAoGrafo(grafoBusca);
              this.inicializaLayout();
            }, 10);

          } else {
            this.buscaRelacionamentosSucesso = false;
            if (status !== 'ENOTFOUND') { this.buscaRelacionamentosErro = true; }

            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao analisar o órgão.'));
        });
    }
  }

  /**
   *
   */
  inicializaCytoscape() {
    this.cy = cytoscape({
        container: document.getElementById('cy'),
        style: this.relacionamentos.getStyleCytoscape()
    });

    this.inicializaMenu();
  }

  inicializaLayout() {
    this.layout = this.criaLayout(this.layoutParams, {});

    this.cy.on('layoutstart', function () {
      // console.log('running = true;');
    }).on('layoutstop', function () {
      // console.log('running = false;');
    });
  }

  /**
   *
   * @param res
   */
  trataConsultaEntidadeOk(res, idalvo) {
    const { status, msg, dados } = res;

    if (status === 'OK') {
      const grafoBusca = dados;
      this.idAlvos = this.idAlvos.concat(idalvo);

      this.adicionaElementosAoGrafo(grafoBusca);
    } else {
      this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
    }
  }

  /**
   *
   * @param err
   */
  trataConsultaEntidadeErro(err) {
    this.message.add(this.utils.trataErroRequisicao(err, 'Ocorreu um erro ao buscar as informações de relacionamento.'));
  }

  /**
   *
   */
  menuPessoa() {
    const commandsGeral = [
      {
        content: '<span class="pi pi-users"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'parentesco')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-phone"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'telefones')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-road"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'enderecos')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="fa fa-university"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'empresasresponsavel')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-sitemap"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'empresassocio')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-globe"></span>',
        select: (n) => {
          this.relacionamentos.getRelacionamentosPessoa(n.data('cpf'), 'completa')
            .pipe(takeUntil(this._destroy$))
            .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cpf')), this.trataConsultaEntidadeErro.bind(this));
        }
      },
      {
        content: '<span class="pi pi-search"></span>',
        select: (n) => {
          n.data('_tip').show();
        }
      },
      {
        content: '<span class="pi pi-times"></span>',
        select: (n) => {
          this.cy.$id(`${n.data('id')}`).remove();
        }
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
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-user"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'responsavel')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="fa fa-phone"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'telefones')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="fa fa-road"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'enderecos')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosEmpresa(n.data('cnpj'), 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('cnpj')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => {
            this.cy.$id(`${n.data('id')}`).remove();
          }
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
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosTelefone(n.data('telefone'), 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => {
            this.cy.$id(`${n.data('id')}`).remove();
          }
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
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('telefone')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-globe"></span>',
          select: (n) => {
            this.relacionamentos.getRelacionamentosOrgaoPublico(n.data('id'), null, null, 'completa')
              .pipe(takeUntil(this._destroy$))
              .subscribe(r => this.trataConsultaEntidadeOk(r, n.data('id')), this.trataConsultaEntidadeErro.bind(this));
          }
        },
        {
          content: '<span class="pi pi-times"></span>',
          select: (n) => {
            this.cy.$id(`${n.data('id')}`).remove();
          }
        },
      ]
    };

    this.cy.cxtmenu(opt);
  }

  /**
   *
   */
  inicializaMenu() {
    this.menuPessoa();
    this.menuEmpresa();
    this.menuTelefone();
    this.menuOrgao();
  }

  /**
   *
   * @param grafoParcial
   */
  adicionaElementosAoGrafo(grafoParcial) {

    // Gera os nodes no formato do Cytoscape
    const nodes = grafoParcial.nodes.map(n => {
      const node: any = {};

      node.data  = n;
      node.group = 'nodes';
      node.data.label = this.relacionamentos.getNodeLabel(n);

      return node;
    });

    // Gera os edges no formato do Cytoscape
    const edges = grafoParcial.edges.map(e => {
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

    const novosElementos   = nodes.concat(edges);
    const antigosElementos = this.grafo;
    const elementos = sortBy(novosElementos.concat(antigosElementos), d => d.data.alvo);
    this.grafo = uniqBy(elementos, d => d.data.id);

    this.atualizaGrafoCytoscape();
  }

  /**
   *
   */
  atualizaGrafoCytoscape() {
    this.cy.add(this.grafo);
    this.calculaMetricas();
    this.adicionaTipNodesGrafo();

    this.atualizaAlvos();
    this.atualizaPosicoes();
  }

  atualizaAlvos() {
    this.cy.nodes().forEach((node) => {
      // Se esse nó estiver na lista de alvos
      if (this.idAlvos.indexOf(node.data('id')) !== -1 && !node.data('alvo')) {
        node.data('alvo', true);
      }
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

          // console.log(`${id} - pr: ${pageRank} - dc: ${degreeCentrality} - cc: ${closenessCentrality}`);

          // Insere no grafo do Cytoscape
          n.data('pageRank', pageRank);
          n.data('degreeCentrality', degreeCentrality);
          n.data('closenessCentrality', closenessCentrality);
      });
  }


  /**
   *
   * @param params
   * @param extraopts
   */
  criaLayout(params, extraopts) {
    for (const i of Object.keys(extraopts)) {
      params[i] = extraopts[i];
    }
    return this.cy.layout(params);
  }

  /**
   *
   * @param data
   */
  getTippyOptions(data) {
    let inner;

    if (data.entidade === 'pessoa') {
      inner = this.relacionamentos.getTabelaHtmlPessoa(data);
    } else if (data.entidade === 'empresa') {
      inner = this.relacionamentos.getTabelaHtmlEmpresa(data);
    } else if (data.entidade === 'endereco') {
      inner = this.relacionamentos.getTabelaHtmlEndereco(data);
    } else {
        inner = 'Tippy content';
    }

    return {
        html: (() => {
            const content = document.createElement('div');
            content.innerHTML = inner;
            return content;
        })(),
        trigger: 'manual',
        placement: 'bottom',
        hideOnClick: true,
        multiple: true,
        sticky: true,
        arrow: true,
    };
  }

  /**
   *
   */
  adicionaTipNodesGrafo() {
    this.cy.nodes().forEach((node) => {

      // Só adiciona nos novatos
      if (!node.data('tooltip')) {
        const data       = node.data();
        // const _popperRef = node.popperRef();
        // const _tip       = new tippy(_popperRef, this.getTippyOptions(data)).tooltips[0];

        // node.data('_tip', _tip);

        // node.on('select', () => _tip.show());
        // node.on('unselect', () => _tip.hide());
        node.data('tooltip', true);

        node.on('mouseover', () => this.onMouseOverNode(node));
        node.on('mouseout', () => this.onMouseOutNode(node));
      }
    });
  }

  onMouseOverNode(node) {
    // console.log('entrou');
    // node.data('mouseover', true);
    // console.log(node.outgoers().edges());
    node.outgoers().edges().forEach(edge => {
      edge.data('mostra', true);
    });
  }

  onMouseOutNode(node) {
    // console.log('saiu');
    // node.data('mouseover', true);
    // console.log(node.outgoers().edges());
    node.outgoers().edges().forEach(edge => {
      edge.data('mostra', false);
    });
  }

  /**
   *
   */
  toggleBarraConfig() {
    this.escondeConfig = !this.escondeConfig;
    this.cy.resize();
  }

  /**
   *
   */
  atualizaPosicoes() {
    const params = this.layoutParams;
    params.randomize = true;

    const layout = this.criaLayout(params, {});

    layout.run();
  }

  downloadRelatorio(nodes) {
    if (!nodes) { nodes = this.cy.nodes('node[?alvo]'); }

    const lista = nodes.map(node => {
      const alvo     = node.data();
      const vinculos = node.outgoers('node').map(n => n.data()).map(d => {
        const vinculo = node.edgesTo(this.cy.$id(`${d.id}`)).data();

        d.relacao = vinculo.relacao;

        console.log(alvo);
        console.log(vinculo);

        if (d.entidade === 'orgaopublico') { d.pOcorrencia = vinculo.pOcorrencia; d.uOcorrencia = vinculo.uOcorrencia; }
        return d;
      });

      return {alvo, vinculos};
    });

    const l = sortBy(lista, d => d.alvo.entidade);

    const fileName = `Relatório Relacionamentos.pdf`;
    const url = location.origin + this.router.url;

    this.relatorio.relatorioRelacionamento(l, null, fileName, url);
  }

  downloadImagem() {
    const blob = this.cy.png({ output: 'blob', full: true});
    FileSaver.saveAs(blob, 'grafo_relacionamentos.png');
  }

  downloadJson() {
    const json = JSON.stringify(this.cy.json());
    const blob = new Blob([json], { type: 'application/json' });
    FileSaver.saveAs(blob, 'grafo_relacionamentos.json');
  }

  onTrocaSliderComprimentoArestas(event) {
    const comprimentoAresta = event.value;
    const params = this.layoutParams;
    const opt = {
      edgeLength: comprimentoAresta,
      randomize: false,
    };

    this.layout.stop();
    this.layout = this.criaLayout(params, opt);
    this.layout.run();
  }

  onTrocaSliderEspacamentoNos(event) {
    const espacamentoNos = event.value;
    const params = this.layoutParams;
    const opt = {
      nodeSpacing: espacamentoNos,
      randomize: false,
    };

    this.layout.stop();
    this.layout = this.criaLayout(params, opt);
    this.layout.run();
  }

  expandirNodes() {
    const nodes = this.cy.nodes('node[!alvo]').map(n => n.data('id'));
    const cpfsValidos = nodes.map(d => this.utils.checaCPF(d)).filter(d => d !== null).map(d => d.trim());
    const cnpjsValidos = nodes.map(d => this.utils.checaCNPJ(d)).filter(d => d !== null).map(d => d.trim());
    const lista = cpfsValidos.concat(cnpjsValidos);

    if (nodes.length > 0) {
      this.relacionamentos.getRelacionamentosLista(lista, this.tipoBusca)
        .pipe(takeUntil(this._destroy$))
        .subscribe(r => this.trataConsultaEntidadeOk(r, lista), this.trataConsultaEntidadeErro.bind(this));
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
